<template>
  <div id="app">
    outer
    <!-- <div id="nav"><router-link to="/">Home</router-link></div> -->
    <router-view />
  </div>
</template>
<script>
import IO from "../modules/settingsIO.js";
import { mapGetters, mapMutations } from "vuex";
import readSettings from "../modules/settingsReader";

export default {
  computed: {
    ...mapGetters(["settings"])
  },
  methods: {
    ...mapMutations(["update"]),
    updGlobalSettings(fileData) {
      this.update({ field: "all", value: fileData });
    },
    checkSettings() {
      const settings = readSettings();
      if (!settings) {
        IO.createSettingsFile(this.settings);
        this.$router.push({ name: "Settings" });
      } else {
        this.updGlobalSettings(settings);
        this.validate(this.settings);
      }
    },
    validate(settings) {
      let isValid = true;
      for (let param of Object.keys(settings)) {
        IO.checkField[param] = IO.checkField[param].bind(IO);
        let checkResult = IO.checkField[param](settings[param]);
        if (typeof checkResult === "object") {
          let { iccDesc } = checkResult;
          if (settings.outputProfile !== iccDesc) {
            isValid = false;
            this.update({ field: "outputProfile", value: "" });
            this.update({ field: param, value: "" });
          }
        }
        if (!checkResult) {
          isValid = false;
          this.update({ field: param, value: "" });
          //!!!maybe add jsonSettings modify here??
          if (param === "pathToProfile") {
            this.update({ field: "outputProfile", value: "" });
          }
        }
      }
      console.log("settings valid: ", isValid);
      if (!isValid) {
        this.$router.push({ name: "Settings" });
      }
    }
  },
  async created() {
    this.checkSettings();
  }
};
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color:rgb(143, 143, 143);
  background-color: #2c3e50;
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
