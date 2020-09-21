const { parentPort } = require("worker_threads");
const fs = require("fs");

//const path = require("path");
const gm = require("gm");
const ExifReader = require("exifreader");

parentPort.on("message", async job => {
  const { id, file } = job;

  await checker(file).then(tags => {
    parentPort.postMessage({ id, tags });
  });
});

async function checker(file) {
  const buffer = fs.readFileSync(file);
  if (buffer) {
    const tags = ExifReader.load(buffer, { expanded: true });
    return tags;
  } else {
    return Error("could not read file: ", file);
  }
}
async function converter(file) {

}
