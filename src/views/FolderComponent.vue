<template>
  <div class="container row">
    <h1>{{ path | folderName }}</h1>
  </div>
</template>

<script>
import { ipcRenderer } from "electron";
import config from "../../config";
// eslint-disable-next-line no-unused-vars
//import taskManager from "../../workers/taskManager.js";
const pathParse = require("path");
const chokidar = require("chokidar");

export default {
  data() {
    return {
      filesAmount: undefined,
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
      const list = this.fileList;
      const id = pathParse.basename(path);
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
            this.fileList.push(file);
          }
          if (this.getExt(file) == ".mrk") {
            this.filesAmount = +pathParse.basename(file).match(/\d+/);
          }
          if (this.filesAmount && this.fileList.length == this.filesAmount) {
            ipcRenderer.send("startCheck", { list, id });
          }
        })
        .on("ready", () => {
          console.log("ready", id, list);
          ipcRenderer.once(`${id}done`, (event, job) => {
            console.log(job);
          });
        })
        .on("error", err => {
          console.log(err);
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
