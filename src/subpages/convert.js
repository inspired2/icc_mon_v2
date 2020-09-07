import Vue from "vue";
import Convert from "../views/Convert";
//import App from "../App";

Vue.config.productionTip = false;

//const ipc = require('electron').ipcRenderer;

new Vue({
  render: h => h(Convert)
}).$mount("#app");
