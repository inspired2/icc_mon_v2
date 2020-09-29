<template>
  <div id="converter" class="container">
    <div class="row header">header</div>
    <div class="row main-container">
      <div class="col-7 drop-container">
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
    <button @click="convertFiles(files)" class="start-convert">
      convertFiles
    </button>
  </div>
</template>
<script>
import { CommonMethods } from "./mixins/CommonMethods";
import { ipcRenderer } from "electron";
//import config from "../../config";

const settings = require("../../modules/settingsReader")();
const { dialog } = require("electron").remote;

export default {
  name: "Convert",
  data() {
    return {
      dropElement: null,
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
    async startSelectDirDialog() {
      let selected = await this.getDirsList();
      if (selected.length) {
        const dirs = selected.filter(dir => !this.dirs.includes(dir));
        dirs.forEach(path => {
          this.addPath(path, "dirs");
        });
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
    addPath(path, destination) {
      const prop = this[destination];
      prop.push(path);
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
    },
    async convertFiles() {
      console.log(this.dirs);
      this.createFileList(this.dirs);
      const fileList = [...this.files];
      //!!!refactor id hashing
      console.log(fileList);
      const id = this.hashPath(fileList[0]);
      ipcRenderer.once(`${id}batchConvert`, res => {
        //add response parsing logic
        console.log(`converted `, res);
      });
      ipcRenderer.send("batchConvertImages", {
        id,
        fileList,
        options: this.convertOptions
      });
    },
    createFileList(dirsList) {
    }
  },
  created() {}
};
</script>

<style scoped>
* {
  border: 1px dotted red;
}
</style>
