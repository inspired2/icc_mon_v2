<template>
  <div id="main" class="container">
    <h1>Main</h1>
    <div id="folders" class="row working-folders">
      <folder-component
        :key="folder.dirName"
        :path="folder.dirName"
        :folderId="folder.id"
        class="worker"
        v-for="folder in folders"
      >
        {{ folder.dirName }}
      </folder-component>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import FolderComponent from "../views/FolderComponent";
import { CommonMethods } from "./mixins/CommonMethods";
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
        ignoreInitial: true,
        ignorePermissionErrors: true
      });
      watcher
        .on("addDir", dir => {
          if (dir !== this.settings.pathToDir) {
            console.log("dir added: ", dir);
            this.addFolderComponent(dir);
          }
        })
        .on("unlinkDir", dir => {
          this.removeFolderComponent(dir);
          console.log("dir removed: ", dir);
          console.log(this.folders);
        })
        .on("error", err => {
          console.log(err);
        });
    },
    addFolderComponent(dirName) {
      const item = {
        dirName,
        id: this.hashPath(dirName)
      };
      this.folders.push(item);
    },
    removeFolderComponent(dirName) {
      const id = this.hashPath(dirName);
      const index = id => {
        let index = -1;
        this.folders.forEach((item, idx) => {
          if (item.id === id) {
            index = idx;
          }
        });
        return index;
      };
      this.folders.splice(index(id), 1);
    }
  },
  mixins: [CommonMethods],
  created() {
    this.startWatcher();
  }
};
</script>

<style scoped></style>
