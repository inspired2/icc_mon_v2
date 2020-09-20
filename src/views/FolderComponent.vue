<template>
  <div class="container row">
    <h4>{{ path | folderName }}</h4>
    <p>totalImages: {{ totalImages }}</p>
    <p>checkedImages: {{ checkedImages }}</p>
    <p>convertedImages: {{ convertedImages }}</p>
    <button @click="checkManually(path)">Check Manually</button>
  </div>
</template>

<script>
import { ipcRenderer } from "electron";
import config from "../../config";
// eslint-disable-next-line no-unused-vars
//import taskManager from "../../workers/taskManager.js";
const fs = require("fs");
const pathParse = require("path");
const chokidar = require("chokidar");

export default {
  data() {
    return {
      totalImages: null,
      checkedImages: null,
      convertedImages: null,
      fileList: []
    };
  },
  props: ["path"],
  filters: {
    folderName(path) {
      return pathParse.basename(path);
    }
  },
  methods: {
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
        ignoreInitial: false,
        ignorePermissionErrors: true,
        usePolling: true
      });
      watcher
        .on("add", file => {
          if (this.isCheckPending(file)) {
            this.totalImages++;
            const fileName = pathParse.basename(file);
            this.fileList.push(fileName);
            //!!!TODO: detailed id hashing
            const id = fileName;
            ipcRenderer.once(`${id}done`, (event, job) => {
              this.convertedImages++;
              console.log(job);
            });
            this.fileList.push(file);
            ipcRenderer.send("checkFile", { id, file });
            this.checkedImages++;
          }
        })
        .on("error", err => {
          console.log(err);
        });
      this.startFileWatcher.watcher = watcher;
    },
    async checkManually(dir) {
      fs.readdir(dir, (err, files) => {
        console.log(files);
        console.log(this.startFileWatcher.watcher)
      });
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
