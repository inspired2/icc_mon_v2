const os = require("os");
//const EventEmitter = require("events");
//const emitter = new EventEmitter();
const cpus = os.cpus();
const Thread = require("worker-threads");
const workers = [];
const events = {};
const jobs = new Map();
cpus.forEach(cpu => {
  const worker = new Thread("../workers/converter.js");
  workers.push(worker);
});

const addJob = path => {};
export default {
  on(event, fn) {
    if (!events[event]) {
      events[event] = [fn];
    } else {
      events[event].push(fn);
    }
  },
  check(path) {
    addJob(path);
  }
};
