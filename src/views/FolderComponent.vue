<template>
  <div class="container row">
    <h4>{{ path | folderName }}</h4>
    <p>totalImages: {{ totalImages }}</p>
    <p>checkedImages: {{ checkedImages }}</p>
    <p>convertedImages: {{ convertedImages }}</p>
    <button @click="checkManually(path)" :disabled="!taskFinished">
      Check Manually
    </button>
  </div>
</template>

<script>
import { ipcRenderer } from "electron";
import { CommonMethods } from "./mixins/CommonMethods";
import config from "../../config";
// eslint-disable-next-line no-unused-vars
const pathParse = require("path");
const chokidar = require("chokidar");

export default {
  data() {
    return {
      convertedImages: 0,
      checkedImages: 0,
      fileList: [],
      idleFlag: true,
      timeout: null
    };
  },
  computed: {
    totalImages() {
      return this.fileList.length;
    },
    poolIsIdle() {
      return this.poolRef.isIdle() && this.idleFlag;
    },
    taskFinished() {
      const total = this.totalImages;
      return total === this.checkedImages && this.poolIsIdle;
    }
  },
  props: ["path", "folderId", "poolRef"],
  filters: {
    folderName(path) {
      return pathParse.basename(path);
    }
  },
  methods: {
    checkImage(filePath) {
      const file = filePath;
      const fileName = pathParse.basename(file);
      this.fileList.push(fileName);
      const id = this.hashPath(fileName);
      ipcRenderer.once(`${id}done`, (event, job) => {
        this.checkedImages++;
        if (job.wrongProfile) {
          this.convertedImages++;
          console.log(job);
        }
      });
      ipcRenderer.send("checkImage", { id, file });
    },
    resetCounters() {
      this.checkedImages = 0;
      this.convertedImages = 0;
      this.fileList = [];
      // if (this.timeout) clearTimeout(this.timeout);
      // this.timeout = null;
    },
    startFileWatcher(path) {
      const watcher = chokidar.watch(path, {
        ignored: /[/\\]\./,
        persistent: true,
        awaitWriteFinish: true,
        ignorePermissionErrors: true,
        usePolling: true
      });
      watcher
        .on("add", file => {
          if (this.isCheckPending(file)) {
            this.checkImage(file);
            this.handleIdleFlag();
          }
        })
        .on("error", err => {
          console.log(err);
        });
      this.startFileWatcher.watcher = watcher;
    },
    handleIdleFlag() {
      this.idleFlag = false;
      if (this.timeout) {
        clearTimeout(this.timeout);
        console.log(this.timeout);
      }
      this.timeout = setTimeout(() => {
        this.idleFlag = true;
      }, 3000);
    },
    async checkManually(dir) {
      this.startFileWatcher.watcher.close();
      this.resetCounters();
      const files = await this.getFiles(dir);
      files.forEach(file => {
        if (this.isCheckPending(file)) {
          this.checkImage(file);
          this.handleIdleFlag();
        }
      });
    }
  },
  mixins: [CommonMethods],
  beforeMount() {
    if (config.autostartFileWatcher) {
      this.startFileWatcher(this.path);
    }
  }
};
</script>

<style></style>
