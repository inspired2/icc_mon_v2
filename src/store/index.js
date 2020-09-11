import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    settings: {
      pathToDir: "",
      outputProfile: "",
      pathToProfile: ""
    }
  },
  mutations: {
    update(state, payload) {
      console.log("called update mutation");
      if (payload.field === "all") {
        console.log("update all", payload.value);
        state.settings = payload.value;
        console.log("current state: ", state.settings);
      } else state.settings[payload.field] = payload.value;
    }
  },
  actions: {},
  getters: {
    settings(state) {
      console.log("called getter, state: ", state.settings);
      return state.settings;
    }
  },
  modules: {}
});
// updateAllSettings(settings) {
//   store.update({ field: "all", value: settings });
// }
// writeSetting(payload) {
//   config.update("all", payload);
// }
