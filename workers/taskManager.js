import { ipcMain } from "electron";
import { win, converterWin } from "../src/background";
// eslint-disable-next-line no-unused-vars
const WorkerPool = require("./WorkerPool");
const os = require("os");
const cpus = os.cpus().length;
let pool = new WorkerPool(cpus);

ipcMain.on("restartPool", () => {
  console.log("settings canged =>> rebuilding pool of workers");
  pool.close();
  pool = new WorkerPool(cpus);
});

ipcMain.on("checkImage", (e, job) => {
  job.type = "checkImage";
  pool.runTask(job, responder);
});

ipcMain.on("batchConvertImages", (e, job) => {
  batchProcess(job, "batchConvert");
});

ipcMain.on("getImagesMeta", (e, job) => {
  //const fileList =
  pool.runTask(job, (err, res) => {
    if (err) {}
  });
});
function batchProcess(job, type) {
  const completeJobs = [];
  const id = job.id;
  const fileList = job.fileList;
  fileList.forEach(image => {
    const job = { image, type };
    pool.runTask(job, (err, res) => {
      if (err) {
        completeJobs.push(err);
      } else {
        completeJobs.push(res);
      }
      if (completeJobs.length === fileList.length) {
        converterWin.wibContents.send(`${id + type}`, completeJobs);
      }
    });
  });
}
function responder(error, completeJob) {
  if (completeJob.type == "getMetadata") {
    const id = completeJob.id;
    converterWin.webContents.send(`${id}done`, completeJob);
  }
  if (error) {
    win.webContents.send("error", "something went wrong in thread_worker");
  } else {
    const id = completeJob.id;
    win.webContents.send(`${id}done`, completeJob);
  }
}
