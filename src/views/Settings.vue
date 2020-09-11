<template>
  <div id="app" class="container">
    Settings
    <div class="row working-directory">
      <div class="col-3 row-header"></div>
      <div class="col-8 inner-container">
        <div class="row inner-container-row">
          <div class="col-6 variable">{{ pathToDir }}</div>
          <div class="col-2 change-button">
            <button @click="changePath('pathToDir')">Change</button>
          </div>
        </div>
      </div>
    </div>
    <div class="row exception">
      <div class="col-6 variable">{{ exceptionFolder }}</div>
      <div class="col-2 change-button">
        <button @click="changePath('exceptionFolder')">Change</button>
      </div>
    </div>
    <div class="row profile"></div>
    <div class="row log"></div>
    <div class="row confirm-button">
      <button @click="confirmChanges" class="confirm col-3">confirm</button>
      <button @click="cancelChanges" class="confirm col-3">cancel</button>
    </div>
  </div>
</template>

<script>
import IO from "../../modules/settingsIO";
import { mapGetters, mapMutations } from "vuex";
const { dialog } = require("electron").remote;

export default {
  name: "Settings",
  data() {
    return {
      localSettings: {
        pathToDir: "",
        outputProfile: "",
        pathToProfile: "",
        exceptionFolder: ""
      }
    };
  },
  computed: {
    ...mapGetters(["settings"]),
    pathToDir() {
      return this.localSettings.pathToDir;
    },
    exceptionFolder() {
      return this.localSettings.exceptionFolder;
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
      this.update({ field: "all", value: { ...this.localSettings } });
      IO.writeSettingsFile(this.localSettings);
      this.$router.push({ name: "Home" });
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
