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
const EventEmitter = require("events");
// const emitter = new EventEmitter();

export default {
  data: () => {
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
    startFileWatcher(path) {
      const watcher = chokidar.watch(path, {
        ignored: /[/\\]\./,
        persistent: false,
        awaitWriteFinish: true,
        ignorePermissionErrors: true,
        usePolling: true
      });
      watcher
        .on("add", file => {
          this.fileList.push(file);
        })
        .on("error", err => {
          console.log(err);
        })
        .on("ready", () => {
          console.log(this.fileList);
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
