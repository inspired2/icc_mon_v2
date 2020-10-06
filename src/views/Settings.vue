<template>
  <div id="app" class="container">
    Settings
    <div class="row working-folder-container">
      <div class="col-4 working-folder title">Путь к рабочему каталогу</div>
      <div class="col-6 working-folder variable">{{ pathToDir }}</div>
      <div class="col-2 change-button">
        <button @click="changePath('pathToDir')">Change</button>
      </div>
    </div>
    <div class="row exception">
      <div class="col-4 exception title">Не сканировать в:</div>
      <div class="col-6 exception variable">{{ exceptionFolder }}</div>
      <div class="col-2 change-button">
        <button @click="changePath('exceptionFolder')">Change</button>
      </div>
    </div>
    <div class="row profile-info">
      <div class="col-4 profile-title">Конвертировать в:</div>
      <div class="col-6 variable">{{ profileDescriptor }}</div>
      <div class="col-2 profile-select">
        <button @click="selectProfile()" class="profile-select">
          Выбор файла профиля
        </button>
      </div>
    </div>
    <div class="row log">
      <button class="col-12 log-button">Показать лог</button>
    </div>
    <div class="row confirm-button">
      <button @click="confirmChanges" class="confirm col-6">confirm</button>
      <button @click="cancelChanges" class="confirm col-6">cancel</button>
    </div>
  </div>
</template>

<script>
import IO from "../../modules/settingsIO";
import { mapGetters, mapMutations } from "vuex";
import config from "./../../config";
const { dialog } = require("electron").remote;
import { ipcRenderer } from "electron";

export default {
  name: "Settings",
  data() {
    return {
      localSettings: {
        pathToDir: "",
        outputProfile: "",
        pathToProfile: "",
        exceptionFolder: ""
      },
      copyPath: ""
    };
  },
  computed: {
    ...mapGetters(["settings"]),
    pathToDir() {
      return this.localSettings.pathToDir;
    },
    exceptionFolder() {
      return this.localSettings.exceptionFolder;
    },
    profileDescriptor() {
      return this.localSettings.outputProfile;
    }
  },
  methods: {
    ...mapMutations(["update"]),

    readCurrentSettings() {
      this.localSettings = { ...this.settings };
    },
    changeLocalSettings(type, value) {
      this.localSettings[type] = value;
    },
    confirmChanges() {
      if (this.copyPath) {
        this.localSettings.pathToProfile = IO.copySelectedFile(this.copyPath);
      }
      this.update({ field: "all", value: { ...this.localSettings } });
      IO.writeSettingsFile(this.localSettings);
      this.$router.push({ name: "Home" });
      ipcRenderer.send("reloadApp");
    },
    cancelChanges() {
      this.$router.push({ name: "Home" });
    },
    async changePath(pathType) {
      const path = dialog.showOpenDialog({
        properties: ["openDirectory"]
      });
      await path.then(e => {
        if (e.filePaths[0]) {
          this.changeLocalSettings(pathType, e.filePaths[0]);
        }
      });
    },
    async selectProfile() {
      // const path = dialog.showOpenDialog({
      //   properties: ["openFile"],
      //   filters: [
      //     {
      //       name: "файл профиля",
      //       extensions: config.iccProfileExtensions
      //     }
      //   ]
      // });
      ipcRenderer.once("path", async (e, path) => {
        console.log(path);
        this.copyPath = path;
        const profile = IO.readProfile(this.copyPath);
        const profileDescriptor = IO.getIccDesc(profile);
        this.localSettings.outputProfile = profileDescriptor;
      });
      ipcRenderer.send("openDialog", {
        properties: ["openFile"],
        filters: [
          {
            name: "файл профиля",
            extensions: config.iccProfileExtensions
          }
        ]
      });
    }
  },
  created() {
    this.readCurrentSettings();
  }
};
</script>

<style scoped>
* {
  border: 1px dotted red;
}
</style>
