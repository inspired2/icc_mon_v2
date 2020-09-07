module.exports = {
  //...
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true
    }
  },
  pages: {
    index: "src/main.js", // your main window
    settings: "src/subpages/settings.js",
    convert: "src/subpages/convert.js" // your video window
  }
};
