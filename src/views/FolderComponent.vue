<template>
  <div class="container row">
    <h1>{{ path | folderName }}</h1>
  </div>
</template>

<script>
import config from "../../config";
//import taskManager from "../../workers/taskManager.js";
const pathParse = require("path");
const chokidar = require("chokidar");
import { emitter } from "./../../workers/EventBus";

export default {
  data() {
    return {
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
      const list = this.fileList,
        id = pathParse.basename(path);
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
        })
        .on("ready", () => {
          emitter.on(`${id}done`, e => {
            emitter.unsubscribe(`${id}done`);
          });
          if (this.fileList.length) {
            emitter.emit("startCheck", { list, id });
          }
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
