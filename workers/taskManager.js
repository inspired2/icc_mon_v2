import { ipcMain } from "electron";
import { win } from "./../src/background";
import IO from "./../modules/settingsIO";

// eslint-disable-next-line no-unused-vars
const WorkerPool = require("./WorkerPool");
const os = require("os");
const cpus = os.cpus().length;
const settings = IO.readSettingsFile();
const pool = new WorkerPool(cpus);

ipcMain.on("checkFile", (e, job) => {
  job.pathToProfile = settings.pathToProfile;
  job.outputProfile = settings.outputProfile;
  pool.runTask(job, responder);
});
ipcMain.on("convertFile", () => {
  console.log("message from converter.vue");
});
function responder(error, completeJob) {
  if (error) {
    win.webContents.send("error", "something went wrong in thread_worker");
  } else {
    const id = completeJob.id;
    win.webContents.send(`${id}done`, completeJob);
  }
}
