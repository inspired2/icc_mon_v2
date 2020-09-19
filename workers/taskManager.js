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
  console.log("TM recieved job: ", job.id);
  jobQueue.push(job);
});

setInterval(checkQueue, 100);
setInterval(() => {
  console.log("free workers: ", workers.length);
}, 2000);

function checkQueue() {
  if (jobQueue.length && workers.length) {
    const job = jobQueue.shift();
    let worker = workers.pop();
    console.log("extracted worker, left: " + workers.length);
    startCheck(job, worker);
    worker = null;
  }
}
function startCheck(jobObj, thread) {
  const { id, list } = jobObj;
  console.log("starting worker for ", id);
  thread.on(`message`, list => {
    console.log("taskManager recieved worker result: ", id);
    win.webContents.send(`${id}done`, { id, list });
    workers.push(thread);
  });
  thread.on("error", err => {
    console.log(err);
  });
  thread.postMessage(list);
}
function spawnWorkers(noOfThreads) {
  const workers = [];
  for (let i = 0; i <= noOfThreads; i++) {
    workers.push(new Worker("./workers/checker.js"));
  }
  return workers;
}
