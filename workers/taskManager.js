import { emitter } from "./EventBus";
const os = require("os");
const cpus = os.cpus().length;
const { Worker } = require("worker_threads");
// const pathParse = require("path");
emitter.on("startCheck", job => startCheck(job));

function startCheck(dataObj) {
  const { id, list } = dataObj;
  emitter.emit(`${id}done`, { id, list });
}
const workers = [new Worker("./checker.js")];
const jobQueue = [];


// const jobs = new Map();
// cpus.forEach(() => {
//   const worker = new Thread("../workers/converter.js");
//   worker.on("ready", data => this.emit("ready", data));
//   workers.push(worker);
// });
