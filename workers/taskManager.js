import { ipcMain } from "electron";
import { win, converterWin } from "./../src/background";
import IO from "./../modules/settingsIO";

// eslint-disable-next-line no-unused-vars
const WorkerPool = require("./WorkerPool");
const os = require("os");
const cpus = os.cpus().length;
const settings = IO.readSettingsFile();
const pool = new WorkerPool(cpus);
//export default pool;

ipcMain.on("checkImage", (e, job) => {
  job.pathToProfile = settings.pathToProfile;
  job.outputProfile = settings.outputProfile;
  pool.runTask(job, responder);
});
ipcMain.on("batchConvertImages", (e, job) => {
  const completeJobs = [];
  const id = job.id;
  const fileList = job.fileList;
  fileList.forEach(image => {
    const job = { image, type: "convertType" };
    pool.runTask(job, (err, res) => {
      completeJobs.push(res);
      if (completeJobs.length === fileList.length) {
        converterWin.wibContents.send(`${id}converted`, completeJobs);
      }
    });
  });
});
ipcMain.on("getImagesMeta", (e, job) => {
  pool.runTask(job, responder);
});
function responder(error, completeJob) {
  if (completeJob.jobIsMeta) {
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
