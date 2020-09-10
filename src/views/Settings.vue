<template>
  <div id="app" class="container">
    Settings
    <div class="row working-directory">
      <div class="col-3 row-header"></div>
      <div class="col-8 inner-container">
        <div class="row inner-container-row">
          <div class="col-6 variable">{{ pathToDir }}</div>
          <div class="col-2 change-button">
            <button @click="changeSettings">Change</button>
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
import { mapGetters, mapMutations } from "vuex";
const { dialog } = require("electron").remote;

export default {
  name: "Settings",
  data() {
    return {
      localSettings: { pathToDir: "", outputProfile: "", pathToProfile: "" }
    };
  },
  computed: {
    ...mapGetters(["settings"]),
    pathToDir() {
      return this.localSettings.pathToDir;
    }
  },
  methods: {
    ...mapMutations(["update"]),

    readCurrentSettings() {
      this.localSettings = this.settings;
    },
    changeLocalSettings(type, value) {
      this.localSettings[type] = value;
    },
    confirmChanges() {
      //console.log(this.localSettings);
      this.update({ field: "all", value: this.localSettings });
      IO.writeSettingsFile(this.localSettings);
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
    this.readCurrentSettings();
    console.log("localSettings: ", this.localSettings);
    console.log("globalSettings: ", this.settings)
  }
};
</script>

<style scoped>
* {
  border: 1px dotted red;
}
</style>
