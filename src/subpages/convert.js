import Vue from "vue";
import Convert from "../views/Convert";
import router from "./../router/";
import store from "./../store";
//import App from "../App";

Vue.config.productionTip = false;

//const ipc = require('electron').ipcRenderer;

new Vue({
  router,
  store,
  render: h => h(Convert)
}).$mount("#app");
