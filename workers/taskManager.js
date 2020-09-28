import { ipcMain } from "electron";
import { win, converterWin } from "../src/background";
// eslint-disable-next-line no-unused-vars
const WorkerPool = require("./WorkerPool");
const os = require("os");
const cpus = os.cpus().length;
let pool = new WorkerPool(cpus);

ipcMain.on("restartPool", () => {
  console.log("settings canged =>> rebuilding pool of workers");
  //!!!must make sure workers aren't busy
  pool.close();
  pool = new WorkerPool(cpus);
});

ipcMain.on("checkImage", (e, job) => {
  job.type = "checkImage";
  checkImage(job);
});

ipcMain.on("batchConvertImages", (e, job) => {
  batchProcess(job, "batchConvert");
});

ipcMain.on("getMeta", (e, job) => {
  batchProcess(job, "getMeta");
});

function checkImage(job) {
  pool.runTask(job, responder);
}

function batchProcess(job, type) {
  const { options } = job;

  const completeJobs = [];
  const id = job.id;
  const fileList = job.fileList;

  fileList.forEach(image => {
    const job = { image, type, options };
    pool.runTask(job, batchResponder);
  });

  function batchResponder(err, res) {
    if (err) {
      completeJobs.push(err);
    } else {
      completeJobs.push(res);
    }
    if (completeJobs.length === fileList.length) {
      converterWin.wibContents.send(`${id + type}`, completeJobs);
    }
  }
}
function responder(err, res) {
  if (res.type == "getMetadata") {
    const id = res.id;
    converterWin.webContents.send(`${id}done`, res);
  }
  if (err) {
    win.webContents.send("error", "something went wrong in thread_worker");
  } else {
    const id = res.id;
    win.webContents.send(`${id}done`, res);
  }
}
