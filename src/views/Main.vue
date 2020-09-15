<template>
  <div id="main" class="container">
    <h1>Main</h1>
    <div id="folders" class="row working-folders"></div>
    <button @click="addWatcherComponent">add component</button>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import FolderComponent from "../views/FolderComponent";
const chokidar = require("chokidar");
const path = require("path");
//const div = document.querySelector("#folders");

export default {
  data() {
    return {};
  },
  components: {
    // eslint-disable-next-line vue/no-unused-components
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
        ignoreInitial: true,
        ignorePermissionErrors: true
      });
      watcher
        .on("addDir", dir => {
          this.addWatcherComponent(dir);
        })
        .on("error", err => {
          console.log(err);
        });
    },
    addWatcherComponent() {
      const div = document.querySelector("#folders");
      let component = document.createElement("folder-worker");
      console.log(div, component);
      div.prepend(component);
    }
  },
  created() {
    this.startWatcher();
  }
};
</script>

<style scoped></style>
