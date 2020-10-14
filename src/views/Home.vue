<template>
  <div class="home container">
    <div class="home-navbar row">
      <div class="col-4 current-folder">{{ settings.pathToDir }}</div>
      <div class="col-3 manual-convert">
        <button @click="openConverterWin" class="btn btn-secondary">
          converter
        </button>
      </div>
      <div class="col-3 settings">
        <button
          @click="$router.push({ name: 'Settings' })"
          class="btn btn-secondary"
        >
          settings
        </button>
      </div>
    </div>
    <h1>APP</h1>
    <div class="row main-view">
      <main-component></main-component>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from "electron";
import { mapGetters } from "vuex";
import Main from "../views/Main";
//import config from "../../config";

export default {
  name: "Home",
  data: () => {
    return {};
  },
  computed: {
    ...mapGetters(["settings"])
  },
  components: { "main-component": Main },
  methods: {
    openConverterWin() {
      ipcRenderer.send("openConverterWin", { url: "converter" });
    }
  },
  created() {
    ipcRenderer.on("openSettings", () => {
      if (this.$router.currentRoute.name !== "Settings") {
        this.$router.push({ name: "Settings" });
      }
    });
  }
};
</script>

<style scoped>
* {
  border: 1px dotted #999;
}
</style>
