<template>
  <div class="container row">
    <h4>{{ path | folderName }}</h4>
    <p>totalImages: {{ totalImages }}</p>
    <p>checkedImages: {{ checkedImages }}</p>
    <p>convertedImages: {{ convertedImages }}</p>
    <!-- <p>flag: {{ flag }}, isIdlePool: {{ poolIsIdle }}</p> -->
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
const remote = require("electron").remote;
const pathParse = require("path");
const chokidar = remote.app.chokidar; //require("chokidar");
const timeoutName = Symbol("timeout");

export default {
  data() {
    return {
      convertedImages: 0,
      checkedImages: 0,
      fileList: [],
      idleFlag: false,
      [timeoutName]: null
    };
  },
  computed: {
    getTimerCounter() {
      return this.counter;
    },
    totalImages() {
      return this.fileList.length;
    },
    flag() {
      return this.idleFlag;
    },
    poolIsIdle() {
      return this.poolRef;
    },
    taskFinished() {
      const total = this.totalImages;
      return total === this.checkedImages && this.poolIsIdle && this.flag;
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
        //awaitWriteFinish: true,
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
      if (this[timeoutName]) {
        clearTimeout(this[timeoutName]);
      }
      this[timeoutName] = setTimeout(() => {
        this.idleFlag = true;
      }, 3000);
    },
    checkManually(dir) {
      this.startFileWatcher.watcher.close();
      this.resetCounters();
      this.getFiles(dir).then(files => {
        files.forEach(file => {
          if (this.isCheckPending(file)) {
            const fileName = pathParse.basename(file);
            this.fileList.push(fileName);
            this.checkImage(file);
            this.handleIdleFlag();
          }
        });
      });
    }
  },
  mixins: [CommonMethods],
  beforeMount() {
    if (config.autostartFileWatcher) {
      this.startFileWatcher(this.path);
    }
  },
  created() {
    this[timeoutName] = setTimeout(() => {
      this.idleFlag = true;
    }, 5000);
  }
};
</script>

<style></style>
