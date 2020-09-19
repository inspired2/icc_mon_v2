const { parentPort } = require("worker_threads");
const fs = require("fs");

//const path = require("path");
//const gm = require("gm");
const ExifReader = require("exifreader");

// const defaultState = () => ({
//   fileList: [],
//   id: null,
//   output: []
// });
// const state = {
//   fileList: [],
//   id: null,
//   output: []
// };
// const resetState = () => Object.assign(state, defaultState());
// //resetState();

parentPort.on("message", async job => {
  //console.log(data);
  await checker(job).then(data => {
    parentPort.postMessage(data);
  });
});
//const promise = new Promise((resolve, reject) => {});

async function checker(job) {
  const output = [];
  const list = [...job];
  while (list.length) {
    const filePath = list.pop();
    const buffer = fs.readFileSync(filePath);
    if (buffer) {
      const tags = ExifReader.load(buffer, { expanded: true });
      output.push(tags);
    }
  }
  console.log("worker finished, returning result: ", output.length);
  return output;
}
// async function getProfileDescriptor(buffer) {

// }
