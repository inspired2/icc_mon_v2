<template>
  <div class="home container">
    <div class="home-navbar row">
      <div class="col-4 current-folder"></div>
      <div class="col-3 manual-convert"></div>
      <div class="col-3 settings">
        <button @click="openSettings" class="btn btn-secondary">button</button>
      </div>
    </div>
    <h1>APP</h1>
  </div>
</template>

<script>
import { ipcRenderer } from "electron";

export default {
  name: "Home",
  data: () => {
    return {};
  },
  components: {},
  methods: {
    openSettings() {
      ipcRenderer.send("settings");
    }
  }
};
</script>

<style scoped>
.home-navbar {
}
* {
  border: 1px dotted #999;
}
</style>
