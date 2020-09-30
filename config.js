module.exports = {
  settingsFileName: "appSettings.json",
  settingsFilePath: "./",
  iccProfileDestination: "./profile/",
  iccProfileExtensions: ["icm"],
  validators: {
    pathToDir: "path",
    outputProfile: "file",
    profileDir: "profile",
    exceptionFolder: "path"
  },
  autostartFileWatcher: true,
  iccConvertExt: [".jpg", ".jpeg", ".tiff", ".tif"],
  converterWinConfig: {
    width: 1200,
    height: 700
  },
  unsupportedImageTypes: [".webp", ".heic"]
};
