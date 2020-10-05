<template>
  <div id="converter" class="container">
    <div class="row header">header</div>
    <div class="row main-container">
      <div
        @dragover.prevent
        @dragenter.prevent
        @drop.stop.prevent="processDrop($event)"
        class="col-7 drop-container"
      >
        DropContainer
        <div
          @click="removePath(dir, 'dirs')"
          v-for="dir in dirs"
          :key="dir"
          class="dir-template"
        >
          {{ dir }}
        </div>
      </div>
      <div class="col-3 settings-container"></div>
      <div class="row select-button">
        <button @click="startSelectDirDialog" class="select manual">
          select
        </button>
      </div>
    </div>
    <button
      v-if="dirs.length"
      @click="confirmSelection(dirs)"
      class="start-convert"
    >
      select
    </button>
  </div>
</template>
<script>
import { CommonMethods } from "./mixins/CommonMethods";
import { ipcRenderer } from "electron";
import config from "../../config";
const fs = require("fs");

const settings = require("../../modules/settingsReader")();
const { dialog } = require("electron").remote;

export default {
  name: "Convert",
  data() {
    return {
      dirs: [],
      files: [],
      convertOptions: {
        profilePath: settings.pathToProfile,
        imageType: ".jpeg"
      }
    };
  },
  mixins: [CommonMethods],
  watch: {},
  methods: {
    resetLocalState() {
      this.dirs = [];
      this.files = [];
    },
    processDrop(e) {
      //this.resetLocalState();
      const dropList = e.dataTransfer.files;
      const paths = this.arrayFrom(dropList);
      if (!paths.length) return;
      this.addPaths(paths);
    },
    arrayFrom(dropList) {
      const array = [];
      const key = "path";
      for (let entry of Object.values(dropList)) {
        array.push(entry[key]);
      }
      return array;
    },
    async confirmSelection(dirs) {
      this.files = [];
      let promises = [];
      dirs.forEach(dir => {
        const promise = new Promise((resolve, reject) => {
          const list = this.getFiles(dir);
          list
            .then(files => {
              const filtered = files.filter(file =>
                config.unsupportedImageTypes.includes(this.getExt(file))
              );
              let dirEntry = {};
              dirEntry.files = [...filtered];
              dirEntry.dir = dir;
              resolve(dirEntry);
            })
            .catch(err => reject(err));
        });
        promises.push(promise);
      });
      const files = await Promise.all(promises);
      files.forEach(dirEntry => {
        console.log(dirEntry.files);
        const id = dirEntry.dir;
        const fileList = dirEntry.files;

        ipcRenderer.once(`${id}batchConvert`, (event, res) => {
          console.log(res);
        });
        ipcRenderer.send("batchConvertImages", { id, fileList });
      });
      //read selected dirs; ==> fileList={ dir1: [], dir2: [], ...}
      //filter fileList. Keep expected fileextensions;
      //send fileList to TM for checking;
      //on response - write detailed fileList & print on screen fileNames with details
    },
    async startSelectDirDialog() {
      let selected = await this.getDirsList();
      if (selected.length) {
        this.addPaths(selected);
      }
    },
    async getDirsList() {
      const path = dialog.showOpenDialog({
        properties: ["openDirectory", "multiSelections"]
      });
      let dirs;
      await path.then(e => {
        if (e.filePaths) dirs = [...e.filePaths];
      });
      return Promise.resolve(dirs);
    },
    addPaths(arrayOfPaths) {
      const paths = arrayOfPaths.filter(path => {
        return !this.dirs.includes(path) && !this.files.includes(path);
      });
      const fileList = paths.filter(path => {
        return !fs.lstatSync(path).isDirectory();
      });
      if (fileList.length) {
        this.files = [...this.files, ...fileList];
      }
      const dirList = paths.filter(path => {
        return !fileList.includes(path);
      });
      if (dirList.length) {
        this.dirs = [...this.dirs, ...dirList];
      }
      console.dir({ dirs: this.dirs, files: this.files });
    },
    removePath(path, destination) {
      const prop = this[destination];
      const index = prop.indexOf(path);
      if (index >= 0) prop.splice(index, 1);
    },
    async parseSelected(fileList) {
      console.log(fileList);
    },
    async testFiles(fileList) {
      //!!! refactor id hashing
      const id = this.hashPath(fileList[0]);
      console.log(fileList);
      ipcRenderer.once(`${id}tested`, res => {
        //add response parsing logic
        console.log("tested", res);
      });
      ipcRenderer.send("getMeta", { id, fileList });
    }
    // async convertFiles() {
    //   ipcRenderer.once(`${id}batchConvert`, res => {
    //     //add response parsing logic
    //     console.log(`converted `, res);
    //   });
    //   ipcRenderer.send("batchConvertImages", {
    //     id,
    //     fileList,
    //     options: this.convertOptions
    //   });
    // }
  },
  created() {}
};
</script>

<style scoped>
* {
  border: 1px dotted red;
}
</style>
