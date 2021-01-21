//const { readdirSync } = require("fs");
const pathParse = require("path");
import { readdirSync } from "fs";
import config from "../../../config";
const { ipcRenderer } = require("electron");

export const CommonMethods = {
  methods: {
    addIpcListener(eventName, callback) {
      ipcRenderer.once(eventName, callback);
    },
    sendIpcEvent(eventName, props) {
      ipcRenderer.send(eventName, props);
    },
    hashPath(string) {
      let hash = 0,
        i,
        chr;
      for (i = 0; i < string.length; i++) {
        chr = string.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0;
      }
      return hash.toString(10);
    },
    getExt(path) {
      return pathParse.parse(path).ext.toLowerCase();
    },
    isCheckPending(path) {
      const ext = this.getExt(path);
      const extensions = config.iccConvertExt;
      if (extensions.indexOf(ext) === -1) {
        return false;
      }
      return true;
    },
    async getFiles(dir) {
      // console.log(dir);
      // const dirents = await readdir(dir, { withFileTypes: true });
      // const files = await Promise.all(
      //   dirents.map(async dirent => {
      //     const res = pathParse.resolve(dir, dirent.name);
      //     return dirent.isDirectory() ? await this.getFiles(res) : res; //!!! Error, recursive promise is not working, let's try iterative approach
      //   })
      // );
      // return Array.prototype.concat(...files);
      let queue = [dir];
      let output = [];
      while (queue.length) {
        console.log(queue);
        let dir = queue.shift();
        let entries = readdirSync(dir, { withFileTypes: true });
        entries.forEach(entry => {
          if (entry.isDirectory()) {
            queue.push(pathParse.resolve(dir, entry.name));
          } else {
            output.push(pathParse.resolve(dir, entry.name));
          }
        });
      }
      return output;
    }
  }
};
