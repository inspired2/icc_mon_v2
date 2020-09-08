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
      if (!IO.checkSettings(settings)) {
        console.log(settings);
        IO.openSettingsModal();
      } else {
        console.log(settings)
        //write settings to the store
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
