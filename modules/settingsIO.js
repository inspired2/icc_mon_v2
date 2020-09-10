import fs from "fs";

export default {
  readSettingsFile() {
    try {
      const buffer = fs.readFileSync("./appSettings.json", "utf-8");
      if (buffer) {
        return JSON.parse(buffer);
      } else return null;
    } catch (e) {
      return null;
    }
  },
  createSettingsFile(settings) {
    try {
      fs.writeFileSync("./appSettings.json", JSON.stringify(settings));
    } catch (e) {
      console.log("Error trying to write <appSettings.json>: " + e);
      return false;
    }
    return true;
  },
  checkSettings(object) {
    for (let key of Object.keys(object)) {
      if (!object[key]) return false;
    }
    return true;
  },
  writeSettingsFile(settings) {
    fs.writeFileSync("./appSettings.json", JSON.stringify(settings));
  }
};
