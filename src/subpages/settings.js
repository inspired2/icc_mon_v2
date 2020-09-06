import Vue from "vue";
import Settings from "../views/Settings";
//import App from "../App";

Vue.config.productionTip = false;

//const ipc = require('electron').ipcRenderer;

new Vue({
  render: h => h(Settings)
}).$mount("#app");
