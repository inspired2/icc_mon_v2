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
import config from "../../config";
// eslint-disable-next-line no-unused-vars
//import taskManager from "../../workers/taskManager.js";
const { readdir } = require("fs").promises;
const pathParse = require("path");
const chokidar = require("chokidar");

export default {
  data() {
    return {
      convertedImages: 0,
      checkedImages: 0,
      fileList: []
    };
  },
  computed: {
    totalImages() {
      return this.fileList.length;
    },
    taskFinished() {
      const total = this.totalImages;
      return total === this.checkedImages;
    }
  },
  props: ["path"],
  filters: {
    folderName(path) {
      return pathParse.basename(path);
    }
  },
  methods: {
    checkFile(filePath) {
      const file = filePath;
      const fileName = pathParse.basename(file);
      this.fileList.push(fileName);
      //!!!TODO: detailed id hashing unique for every instance of component
      const id = fileName;
      ipcRenderer.once(`${id}done`, (event, job) => {
        this.checkedImages++;
        if (job.wrongProfile) {
          this.convertedImages++;
          console.log(job);
        }
      });
      ipcRenderer.send("checkFile", { id, file });
    },
    resetCounters() {
      this.checkedImages = 0;
      this.convertedImages = 0;
      this.fileList = [];
    },
    getExt(path) {
      return pathParse.parse(path).ext.toLowerCase();
    },
    isCheckPending(path) {
      const ext = this.getExt(path);
      const extensions = config.iccConvertExt;
      if (extensions.indexOf(ext) === -1) {
        return false;
      }
      return true;
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
            this.checkFile(file);
          }
        })
        .on("error", err => {
          console.log(err);
        });
      this.startFileWatcher.watcher = watcher;
    },
    async checkManually(dir) {
      this.startFileWatcher.watcher.close();
      this.resetCounters();
      const files = await this.getFiles(dir);
      files.forEach(file => {
        if (this.isCheckPending(file)) {
          this.checkFile(file);
        }
      });
    },
    async getFiles(dir) {
      const dirents = await readdir(dir, { withFileTypes: true });
      const files = await Promise.all(
        dirents.map(dirent => {
          const res = pathParse.resolve(dir, dirent.name);
          return dirent.isDirectory() ? this.getFiles(res) : res;
        })
      );
      return Array.prototype.concat(...files);
    }
  },

  created() {
    if (config.autostartFileWatcher) {
      this.startFileWatcher(this.path);
    }
  }
};
</script>

<style></style>
