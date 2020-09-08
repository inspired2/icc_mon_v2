<template>
  <div id="app" class="container">
    Settings
    <div class="row working-directory">
      <div class="col-3 row-header"></div>
      <div class="col-8 inner-container">
        <div class="row inner-container-row">
          <div class="col-6 variable"></div>
          <div class="col-2 change-button">
            <button @click="changeSettings">Settings</button>
          </div>
        </div>
      </div>
    </div>
    <div class="row exception"></div>
    <div class="row profile"></div>
    <div class="row log"></div>
  </div>
</template>

<script>
const { dialog } = require("electron").remote;

export default {
  methods: {
    async changeSettings() {
      const path = dialog.showOpenDialog({
        properties: ["openDirectory"]
      });
      await path.then(e => console.log(e.filePaths[0]));
    }
  }
};
</script>

<style scoped>
* {
  border: 1px dotted red;
}
</style>
