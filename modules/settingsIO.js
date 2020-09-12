import fs from "fs";
import config from "./../config";
const settingsFilePath = config.settingsFilePath + config.settingsFileName;
const profileDestinationPath = config.iccProfileDestination;
//const exif = require("exifreader")
import { parse } from "icc";

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
      fs.writeFileSync(settingsFilePath, JSON.stringify(settings));
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
    fs.writeFileSync(settingsFilePath, JSON.stringify(settings));
  },
  copySelectedFile(sourcePath) {
    console.dir({ sourcePath, profileDestinationPath });
    const buffer = fs.readFileSync(sourcePath);
    fs.writeFileSync(profileDestinationPath + "test.icc", buffer);
    const iccInfo = parse(buffer);
    return new Promise((resolve, reject) => {
      if (iccInfo) resolve(iccInfo);
      else reject("cudnt read profile data");
    });
  }
};
