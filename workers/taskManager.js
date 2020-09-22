import { ipcMain } from "electron";
import { win } from "./../src/background";
import IO from "./../modules/settingsIO";

// eslint-disable-next-line no-unused-vars
const WorkerPool = require("./WorkerPool");
const os = require("os");
const cpus = os.cpus().length;
const settings = IO.readSettingsFile();
const pool = new WorkerPool(cpus);
let recieved = 0,
  sentBack = 0;

ipcMain.on("checkFile", (e, job) => {
  console.log("tasks recieved from vue", ++recieved);
  //console.log("TM recieved job", job.id)
  job.pathToProfile = settings.pathToProfile;
  job.outputProfile = settings.outputProfile;
  pool.runTask(job, responder);
});

function responder(error, completeJob) {
  if (error) {
    win.webContents.send("error", "something went wrong in thread_worker");
  } else {
    const id = completeJob.id;
    console.log("tasks sent back to vue", ++sentBack);
    //console.log("sending result from TM", completeJob);
    win.webContents.send(`${id}done`, completeJob);
  }
}
