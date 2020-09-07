import fs from "fs";

//const defaults

export default {
  readSettings() {
    const buffer = fs.readFileSync("./appSettings.json", "utf-8");
    if (buffer) {
      return JSON.parse(buffer);
    } else throw Error("no settings");
  },
  createDefalultSettings() {},
  settingsWinConfig: { width: 600, height: 600 }
};
