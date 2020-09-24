<template>
  <div id="app" class="container">
    <div class="row header">header</div>
    <div class="row main-container">
      <div @drop="run($event)" class="col-7 drop-container">
        DropContainer
        <div
          @click="removePath(dir, 'dirs')"
          v-for="dir in dirs"
          :key="dir"
          class="dir-template"
        >
          {{ dir }}
        </div>
      </div>
      <div class="col-3 settings-container"></div>
      <div class="row select-button">
        <button @click="startSelectDirDialog" class="select manual">
          select
        </button>
      </div>
    </div>
    <button @click="$router.push({ name: 'Home' })">Close</button>
  </div>
</template>
<script>
const { dialog } = require("electron").remote;

export default {
  data() {
    return {
      dropElement: null,
      dirs: []
    };
  },
  watch: {},
  methods: {
    async startSelectDirDialog() {
      let selected = await this.getDirsList();
      if (selected.length) {
        const dirs = selected.filter(dir => !this.dirs.includes(dir));
        dirs.forEach(path => {
          this.addPath(path, "dirs");
        });
      }
    },
    async getDirsList() {
      const path = dialog.showOpenDialog({
        properties: ["openDirectory", "multiSelections"]
      });
      let dirs;
      await path.then(e => {
        if (e.filePaths) dirs = [...e.filePaths];
      });
      return Promise.resolve(dirs);
    },
    addPath(path, key) {
      const prop = this[key];
      prop.push(path);
    },
    removePath(path, key) {
      const prop = this[key];
      const index = prop.indexOf(path);
      if (index >= 0) prop.splice(index, 1);
    },
    run() {
      console.log("e");
    }
  },
  created() {}
};
</script>

<style scoped>
* {
  border: 1px dotted red;
}
</style>
