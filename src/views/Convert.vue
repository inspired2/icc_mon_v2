<template>
  <div id="converter" class="container">
    <div v-if="!conversionIsRunning" class="conversion-select">
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
            start
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
    <div v-if="conversionIsRunning" class="conversion-process">
      <div v-if="message" class="conversion-process-message">{{ message }}</div>
      <div v-if="arrayOfResults" class="conversion-results">
        <div
          v-for="entry in arrayOfResults"
          :key="entry.image"
          class="row result-entry"
        >
          <div class="path col-10">{{ entry.image | shortenPath }}</div>
          <div class="status col-2">{{ entry.result }}</div>
        </div>
      </div>
      <button
        class="close-conversion-process"
        @click.stop.prevent="closeProcessWindow"
        :disabled="!buttonEnabled"
      >
        Close
      </button>
    </div>
  </div>
</template>
<script>
import { CommonMethods } from "./mixins/CommonMethods";
import { ipcRenderer } from "electron";
import config from "../../config";
const fs = require("fs");
const pathParse = require("path");
const settings = require("../../modules/settingsReader")();

export default {
  name: "Convert",
  data() {
    return {
      messageText: null,
      buttonEnabled: false,
      inProgress: false,
      results: [],
      dirs: [],
      files: [],
      convertOptions: {
        profilePath: settings.pathToProfile
      }
    };
  },
  filters: {
    shortenPath(path) {
      const pathObj = pathParse.parse(path);
      const dir = pathObj.dir;
      const dirName = dir.match(/[/\\][^/\\]+[/\\][^/\\]+$/);
      return dirName + "/" + pathObj.base;
    }
  },
  mixins: [CommonMethods],
  computed: {
    conversionIsRunning() {
      return this.inProgress;
    },
    arrayOfResults() {
      return this.results.length ? this.results : false;
    },
    message() {
      return this.messageText;
    }
  },
  methods: {
    resetLocalState() {
      this.results = [];
      this.buttonEnabled = false;
      this.dirs = [];
      this.files = [];
      this.messageText = null;
    },
    processDrop(e) {
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
    closeProcessWindow() {
      this.resetLocalState();
      this.inProgress = false;
    },
    processResults(arrayOfResults) {
      if (!arrayOfResults?.length) {
        this.messageText = `выбраные папки не содержат ${config.unsupportedImageTypes.concat(
          ","
        )}`;
        this.buttonEnabled = true;
        return;
      }
      const res = arrayOfResults.flat();
      this.results = res;
      this.buttonEnabled = true;
    },
    buildPromisesFrom(dirList) {
      const promises = [];
      dirList.forEach(dir => {
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
      return promises;
    },
    async confirmSelection(dirs) {
      this.inProgress = true;
      let results = [],
        resCounter = 0,
        promises = this.buildPromisesFrom(dirs),
        jobsTotal = 0,
        timeout;
      const dirEntries = await Promise.all(promises);
      dirEntries.forEach(dirEntry => {
        const id = dirEntry.dir;
        const fileList = dirEntry.files;
        if (fileList.length) {
          jobsTotal++;
          ipcRenderer.once(`${id}batchConvert`, (event, res) => {
            resCounter++;
            results.push(res);
            if (jobsTotal === resCounter) {
              if (timeout) clearTimeout(timeout);
              this.processResults(results);
            }
          });
          ipcRenderer.send("batchConvertImages", { id, fileList });
          if (timeout) clearTimeout(timeout);
          timeout = setTimeout(() => {
            this.processResults(results);
            console.log("conversion timedout");
          }, 20000);
        }
      });
      if (!jobsTotal) {
        this.processResults(null);
      }
    },
    async startSelectDirDialog() {
      let selected = await this.getDirsList();
      if (selected.length) {
        this.addPaths(selected);
      }
    },
    getDirsList() {
      const promise = new Promise(resolve => {
        this.addIpcListener("pathBrowsed", (e, paths) => {
          if (paths) resolve(paths);
        });
      });
      this.sendIpcEvent("openDialog", {
        properties: ["openDirectory", "multiSelections"]
      });
      return promise;
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
    async testFiles(fileList) {
      //! refactor id hashing
      const id = this.hashPath(fileList[0]);
      ipcRenderer.once(`${id}tested`, res => {
        //!add response parsing logic
        console.log("tested", res);
      });
      ipcRenderer.send("getMeta", { id, fileList });
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
