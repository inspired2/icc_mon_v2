//const ThreadsPlugin = require("threads-plugin");
module.exports = {
  //...
  configureWebpack: {},
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        extraResources: [
          {
            from: "src/workers/checker.js",
            to: "../checker.js"
          }
        ]
      }
    }
  },
  pages: {
    index: "src/main.js",
    converter: "src/converter.js" // your main window
  }
};
