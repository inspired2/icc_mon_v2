import Vue from "vue";
import Convert from "./views/Convert";
//import router from "./router";
//import store from "./store";

Vue.config.productionTip = false;

new Vue({
  //router,
  //store,
  render: h => h(Convert)
}).$mount("#converter");

export const eventBus = new Vue();
