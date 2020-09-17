const { parentPort } = require("worker_threads");
const fs = require("fs");
const path = require("path");
const gm = require("gm");
const ExifReader = require("exifreader");
const defaultState = () => ({
  fileList: [],
  id: null,
  output: []
});
const state = {};
const resetState = () => Object.assign(state, defaultState());
resetState();

parentPort.on("message", async data => {
  state.fileList = data.list;
  state.id = data.id;
  await checker(data).then(data => {
    parentPort.emit("message", { id: state.id, list: data });
    resetState();
  });
});
//const promise = new Promise((resolve, reject) => {});

async function checker(path) {
  const list = state.fileList;
  while (list.length) {
    const filePath = list.pop();
    const buffer = await fs.readFile(filePath);
    if (shouldConvert(buffer)) {
      state.output.push(filePath);
    }
  }
  const output = [...state.output];
  return output;
}
