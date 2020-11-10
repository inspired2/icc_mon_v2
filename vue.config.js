//const ThreadsPlugin = require("threads-plugin");
module.exports = {
  //...
  configureWebpack: {},
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
