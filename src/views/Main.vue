<template>
  <div id="main" class="container">
    <h1>Main</h1>
    <div id="folders" class="row working-folders">
      <folder-component
        :key="folder"
        :path="folder"
        class="worker"
        v-for="folder in folders"
      >
        {{ folder }}
      </folder-component>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import FolderComponent from "../views/FolderComponent";
const chokidar = require("chokidar");
const path = require("path");

export default {
  data() {
    return {
      folders: []
    };
  },
  components: {
    "folder-component": FolderComponent
  },
  computed: {
    ...mapGetters(["settings"])
  },
  methods: {
    startWatcher() {
      const dirToWatch = path.normalize(this.settings.pathToDir);
      const exclusion = path.normalize(this.settings.exceptionFolder);
      const watcher = chokidar.watch(dirToWatch, {
        ignored: exclusion,
        depth: 0,
        usePolling: true,
        persistent: false,
        awaitWriteFinish: true,
        ignoreInitial: false,
        ignorePermissionErrors: true
      });
      watcher
        .on("addDir", dir => {
          console.log("dir added: ", dir);
          this.addWatcherComponent(dir);
        })
        .on("unlinkDir", dir => {
          this.removeWatcherComponent(dir);
          console.log("dir removed: ", dir);
        })
        .on("error", err => {
          console.log(err);
        });
      console.log(watcher);
    },
    addWatcherComponent(id) {
      this.folders.push(id);
    },
    removeWatcherComponent(id) {
      const idx = this.folders.indexOf(id);
      this.folders.splice(idx, 1);
    }
  },
  created() {
    this.startWatcher();
  }
};
</script>

<style scoped></style>
