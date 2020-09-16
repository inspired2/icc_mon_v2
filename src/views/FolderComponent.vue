<template>
  <div class="container row">
    <h1>{{ path | folderName }}</h1>
  </div>
</template>

<script>
import config from "../../config";
import taskManager from "../../workers/taskManager.js";
const pathParse = require("path");
const chokidar = require("chokidar");
// const EventEmitter = require("events");
// const emitter = new EventEmitter();

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
    isCheckPending(path) {
      const ext = pathParse.parse(path).ext.toLowerCase();
      const extensions = config.iccConvertExt;
      if (extensions.indexOf(ext) === -1) {
        return false;
      }
      return true;
    },
    startFileWatcher(path) {
      const watcher = chokidar.watch(path, {
        ignored: /[/\\]\./,
        persistent: false,
        awaitWriteFinish: true,
        ignoreInitial: false,
        ignorePermissionErrors: true,
        usePolling: true
      });
      watcher
        .on("add", file => {
          if (this.isCheckPending(file)) {
            console.log("add to list: ", file);
            this.fileList.push(file);
          }
        })
        .on("ready", () => {
          console.log("run check");
          if (this.fileList.length) taskManager.check(this.fileList);
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
    taskManager.on("message", console.log);
  }
};
</script>

<style></style>
