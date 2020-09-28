const fs = require("fs");
const config = require("../config");
const settingsFilePath = config.settingsFilePath + config.settingsFileName;
const settings = function() {
  try {
    const buffer = fs.readFileSync(settingsFilePath, "utf-8");
    if (buffer) {
      return JSON.parse(buffer);
    } else return null;
  } catch (e) {
    return null;
  }
};
module.exports = settings;
