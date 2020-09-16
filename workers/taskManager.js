//const os = require("os");
// const cpus = os.cpus().length;
// const Thread = require("worker_threads");
// const pathParse = require("path");
// //const EventEmitter = require("events");
// //const emitter = new EventEmitter();
// const workers = [];
const events = {};
// const jobs = new Map();
// cpus.forEach(() => {
//   const worker = new Thread("../workers/converter.js");
//   worker.on("ready", data => this.emit("ready", data));
//   workers.push(worker);
// });

// const addJob = path => {
//   const id = pathParse.basename(path);
//   jobs.set(id, path);
// };

export default {
  on(event, fn) {
    if (!events[event]) {
      events[event] = [fn];
    } else {
      events[event].push(fn);
    }
  },
  emit(event, ...data) {
    if (events[event]) {
      console.log(events[event].length)
      events[event].forEach(fn => {
        fn(...data);
      });
    }
  },
  check(array) {
    //setTimeout(() => {
    console.log("fire emit");
    this.emit("message", array);
    //}, 2000);
  }
};
