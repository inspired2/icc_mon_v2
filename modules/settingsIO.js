import fs from "fs";
import { ipcRenderer } from "electron";

const defaultSettings = {
  pathToDir: "",
  outputProfile: "",
  pathToProfile: ""
};

export default {
  readSettings() {
    try {
      const buffer = fs.readFileSync("./appSettings.json", "utf-8");
      if (buffer) {
        return JSON.parse(buffer);
      } else return null;
    } catch (e) {
      return null;
    }
  },
  createSettingsFile() {
    fs.writeFileSync("./appSettings.json", JSON.stringify(defaultSettings));
  },
  checkSettings(object) {
    for (let key of Object.keys(object)) {
      if (!object[key]) return false;
    }
    return true;
  },
  openSettingsModal() {
    ipcRenderer.send("openModal", {
      url: "settings",
      windowConfig: this.settingsWinConfig
    });
  },
  settingsWinConfig: { width: 600, height: 600 }
};
