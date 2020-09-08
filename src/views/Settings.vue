<template>
  <div id="app" class="container">
    Settings
    <div class="row working-directory">
      <div class="col-3 row-header"></div>
      <div class="col-8 inner-container">
        <div class="row inner-container-row">
          <div class="col-6 variable">{{ pathToDir }}</div>
          <div class="col-2 change-button">
            <button @click="changeSettings">Settings</button>
          </div>
        </div>
      </div>
    </div>
    <div class="row exception"></div>
    <div class="row profile"></div>
    <div class="row log"></div>
    <div class="row confirm-button">
      <button @click="confirmChanges" class="confirm">confirm</button>
    </div>
  </div>
</template>

<script>
import IO from "../../modules/settingsIO";
import config from "../../config";
const { dialog } = require("electron").remote;

export default {
  data() {
    return {
      settings: { pathToDir: "", outputProfile: "", pathToProfile: "" }
    };
  },
  computed: {
    pathToDir() {
      return this.settings.pathToDir;
    }
  },
  methods: {
    readCurrentSettings() {
      this.settings = config.settings;
    },
    changeLocalSettings(type, value) {
      this.settings[type] = value;
    },
    confirmChanges() {
      IO.updateAllSettings(this.settings);
      IO.writeSettingsFile();
    },
    async changeSettings() {
      const path = dialog.showOpenDialog({
        properties: ["openDirectory"]
      });
      await path.then(e => {
        this.changeLocalSettings("pathToDir", e.filePaths[0]);
      });
    }
  },
  created() {
    console.log("in settings: ", config.settings);
    this.readCurrentSettings();
  }
};
</script>

<style scoped>
* {
  border: 1px dotted red;
}
</style>
