<template>
  <div id="app">
    outer
    <!-- <div id="nav"><router-link to="/">Home</router-link></div> -->
    <router-view />
  </div>
</template>
<script>
import IO from "../modules/settingsIO.js";
import { ipcRenderer } from "electron";
import winConfig from "../modules/settingsIO";

{
  try {
    const settings = IO.readSettings();
    console.log(settings);
  } catch (e) {
    console.log("The error:" + e);
    ipcRenderer.send("openModal", {
      url: "settings",
      windowConfig: winConfig.settingsWinConfig
    });
    IO.createDefalultSettings();
  }
}
export default {};
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
