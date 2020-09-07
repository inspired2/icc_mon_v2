<template>
  <div class="home container">
    <div class="home-navbar row">
      <div class="col-4 current-folder"></div>
      <div class="col-3 manual-convert">
        <button @click="openModal('convert')" class="btn btn-secondary">
          converter
        </button>
      </div>
      <div class="col-3 settings">
        <button @click="openModal('settings')" class="btn btn-secondary">
          settings
        </button>
      </div>
    </div>
    <h1>APP</h1>
  </div>
</template>

<script>
import { ipcRenderer } from "electron";
import winConfig from "../../modules/settingsIO";

export default {
  name: "Home",
  data: () => {
    return {};
  },
  components: {},
  methods: {
    openModal(type) {
      ipcRenderer.send("openModal", {
        url: type,
        windowConfig: winConfig.settingsWinConfig
      });
    }
  }
};
</script>

<style scoped>
* {
  border: 1px dotted #999;
}
</style>
