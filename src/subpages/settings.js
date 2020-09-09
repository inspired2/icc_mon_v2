import Vue from "vue";
import Settings from "../views/Settings";
//import router from "./../router";
import store from "./../store/index";
//import App from "../App";

Vue.config.productionTip = false;

//const ipc = require('electron').ipcRenderer;

new Vue({
  //router,
  store,
  render: h => h(Settings)
}).$mount("#app");
