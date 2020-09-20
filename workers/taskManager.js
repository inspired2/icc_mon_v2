import { ipcMain } from "electron";
import { win } from "./../src/background";
// eslint-disable-next-line no-unused-vars
const WorkerPool = require("./WorkerPool");
const os = require("os");
const cpus = os.cpus().length;

const pool = new WorkerPool(cpus);

ipcMain.on("checkFile", (e, job) => {
  console.log("TM recieved job: ", job.id);
  pool.runTask(job, responder);
});

function responder(error, completeJob) {
  if (error) {
    win.webContents.send(`${id}done`, "something went wrong in thread_worker");
  } else {
    const id = completeJob.id;
    win.webContents.send(`${id}done`, completeJob);
  }
}
