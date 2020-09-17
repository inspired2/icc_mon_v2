const events = {};
export const emitter = {
  on(event, fn) {
    if (!events[event]) {
      events[event] = [fn];
    } else {
      events[event].push(fn);
    }
  },
  emit(event, ...data) {
    if (events[event]) {
      console.log(events[event].length);
      events[event].forEach(fn => {
        fn(...data);
      });
    }
  },
  unsubscribe(event) {
    delete events[event];
  },
  evts() {
    return events;
  }
};
