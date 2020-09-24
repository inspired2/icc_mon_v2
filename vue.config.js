module.exports = {
  //...
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true
    }
  },
  pages: {
    index: "src/main.js",
    converter: "src/converter.js" // your main window
  }
};
