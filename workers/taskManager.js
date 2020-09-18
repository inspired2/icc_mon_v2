import { ipcMain } from "electron";
import { win } from "./../src/background";
// eslint-disable-next-line no-unused-vars
const path = require("path");
const os = require("os");
const cpus = os.cpus().length;
const { Worker } = require("worker_threads");
// const pathParse = require("path");
//const worker = new Worker("./workers/checker.js")
const workers = spawnWorkers(cpus);
const jobQueue = [];

ipcMain.on("startCheck", (e, job) => {
  jobQueue.push(job);
});

setInterval(checkQueue, 100);

function checkQueue() {
  if (jobQueue.length && workers.length) {
    const job = jobQueue.shift();
    const worker = workers.pop();
    startCheck(job, worker);
  }
}
function startCheck(jobObj, thread) {
  const { id, list } = jobObj;
  const worker = thread;
  worker.on(`message`, list => {
    console.log("worker result: ", id, list);
    win.webContents.send(`${id}done`, { id, list });
  });
  worker.on("error", err => {
    console.log(err);
  });
  worker.postMessage(list);
}
function spawnWorkers(noOfThreads) {
  const workers = [];
  for (let i = 0; i <= noOfThreads; i++) {
    workers.push(new Worker("./workers/checker.js"));
  }
  return workers;
}
// const jobs = new Map();
// cpus.forEach(() => {
//   const worker = new Thread("../workers/converter.js");
//   worker.on("ready", data => this.emit("ready", data));
//   workers.push(worker);
// });
