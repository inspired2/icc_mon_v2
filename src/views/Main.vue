<template>
  <div id="main" class="container">
    <h1>Main</h1>
    <p>PoolIsIdle: {{ poolIsIdle }}</p>
    <button @click="scanForFolders" class="scan-manually">Scan</button>
    <div id="folders" class="row working-folders">
      <folder-component
        :poolRef="poolRef"
        :key="folder.id"
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
import { readdirSync } from "fs";
import { mapGetters } from "vuex";
import FolderComponent from "../views/FolderComponent";
import { CommonMethods } from "./mixins/CommonMethods";
//import { ipcRenderer } from "electron";
const path = require("path");
const remote = require("electron").remote;
const chokidar = remote.app.chokidar; //require("chokidar");

export default {
  data() {
    return {
      folders: [],
      poolIsIdle: false
    };
  },
  components: {
    "folder-component": FolderComponent
  },
  computed: {
    ...mapGetters(["settings"]),
    poolRef() {
      return this.poolIsIdle;
    }
  },
  methods: {
    startWatcher() {
      const dirToWatch = path.normalize(this.settings.pathToDir);
      const exclusion = path.normalize(this.settings.exceptionFolder);
      const watcher = chokidar.watch(dirToWatch, {
        ignored: exclusion,
        depth: 0,
        usePolling: true,
        persistent: true,
        awaitWriteFinish: true,
        ignoreInitial: true,
        ignorePermissionErrors: true
      });
      watcher
        .on("ready", () => console.log("ready"))
        .on("addDir", dir => {
          if (dir !== this.settings.pathToDir) {
            console.log("dir added: ", dir);
            this.addFolderComponent(dir);
          }
        })
        .on("unlinkDir", dir => {
          this.removeFolderComponent(dir);
          console.log("dir removed: ", dir);
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
      if (this.folderIsNew(item.dirName)) this.folders.unshift(item);
    },
    folderIsNew(dirName) {
      let flag = true;
      this.folders.forEach(item => {
        if (item.dirName === dirName) flag = false;
      });
      return flag;
    },
    scanForFolders() {
      const dirToWatch = path.normalize(this.settings.pathToDir);
      const dirents = readdirSync(dirToWatch, { withFileTypes: true });
      const folders = dirents.map(dirent => {
        const folder = path.resolve(dirToWatch, dirent.name);
        if (!this.folders.includes(folder)) return folder;
      });
      folders.forEach(folder => {
        this.addFolderComponent(folder);
      });
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
  updated() {
    this.pool = remote.app.pool;
  },
  created() {
    this.pool = remote.app.pool;
    this.startWatcher();
    setInterval(() => {
      this.poolIsIdle =
        this.pool.freeWorkers.length === this.pool.workers.length;
    }, 250);
  },
  beforeMount() {
    this.pool = remote.app.pool;
  }
};
</script>

<style scoped></style>
