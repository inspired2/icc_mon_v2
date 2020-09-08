import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    settings: null
  },
  mutations: {
    changeSettings(state, payload) {
      this.state.settings = payload;
    }
  },
  actions: {},
  getters: {
    
  },
  modules: {}
});
