<template>
  <div id="app">
    outer
    <!-- <div id="nav"><router-link to="/">Home</router-link></div> -->
    <router-view />
  </div>
</template>
<script>
import IO from "../modules/settingsIO.js";

export default {
  created() {
    const settings = IO.readSettings();
    if (!settings) {
      IO.createSettingsFile();
      IO.openSettingsModal();
    } else {
      IO.updateAllSettings(settings);
      console.log(settings);
      if (!IO.checkSettings(settings)) {
        IO.openSettingsModal();
      } else {
        //IO.writeSetting(settings);
      }
    }
  }
};
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
