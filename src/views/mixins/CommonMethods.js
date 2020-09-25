const { readdir } = require("fs").promises;
const pathParse = require("path");

export const CommonMethods = {
  methods: {
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
    async getFiles(dir) {
      const dirents = await readdir(dir, { withFileTypes: true });
      const files = await Promise.all(
        dirents.map(dirent => {
          const res = pathParse.resolve(dir, dirent.name);
          return dirent.isDirectory() ? this.getFiles(res) : res;
        })
      );
      return Array.prototype.concat(...files);
    }
  }
};
