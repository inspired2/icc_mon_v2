import fs from "fs";

//const defaults

export default {
  readSettings() {
    const buffer = fs.readFileSync("./appSettings.json", "utf-8");
    if (buffer) {
      return JSON.parse(buffer);
    } else throw Error("no settings");
  },
  createDefalultSettings() {
    const dir = prompt("choose dir to watch");
    console.log(dir);
  }
};
