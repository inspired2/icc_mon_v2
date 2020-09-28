import fs from "fs";
import config from "./../config";

const settingsFilePath = config.settingsFilePath + config.settingsFileName;
const profileDestinationPath = config.iccProfileDestination;
import { parse } from "icc";

export default {
  createSettingsFile(settings) {
    try {
      fs.writeFileSync(settingsFilePath, JSON.stringify(settings));
    } catch (e) {
      console.log("Error trying to write <appSettings.json>: " + e);
      return false;
    }
    return true;
  },
  writeSettingsFile(settings) {
    fs.writeFileSync(settingsFilePath, JSON.stringify(settings));
  },
  copySelectedFile(sourcePath) {
    const buffer = fs.readFileSync(sourcePath);
    const newPath = profileDestinationPath + sourcePath.match(/[^\\/]+.icm\b/);
    if (!fs.existsSync(profileDestinationPath)) {
      fs.mkdirSync(profileDestinationPath);
    }
    fs.writeFileSync(newPath, buffer);
    return newPath;
  },
  getIccDesc(buffer) {
    return parse(buffer).description;
  },
  readProfile(path) {
    const buffer = fs.readFileSync(path);
    return buffer;
  },
  pathExists(path) {
    return fs.existsSync(path);
  },
  checkField: {
    pathToDir(path) {
      if (path && this.pathExists(path)) return true;
      return false;
    },
    outputProfile(name) {
      if (!name) return false;
      return true;
    },
    pathToProfile(path) {
      const bool = !!path && this.pathExists(path);
      if (!bool) return false;
      const profile = fs.readFileSync(path);
      const iccDesc = this.getIccDesc(profile);
      return { iccDesc };
    },
    exceptionFolder(folder) {
      if (folder && this.pathExists(folder)) return true;
      return false;
    }
  }
};
