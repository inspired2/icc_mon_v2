const ThreadsPlugin = require("threads-plugin");
module.exports = {
  //...
  configureWebpack: {
    plugins: [new ThreadsPlugin({ target: "electron-node-worker" })]
  },
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
