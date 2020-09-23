<template>
  <div id="app" class="container">
    <div class="row header">header</div>
    <div class="row main-container">
      <div @drop="run($event)" class="col-7 drop-container">
        DropContainer
      </div>
      <div class="col-3 settings-container"></div>
    </div>
    <button @click="$router.push({ name: 'Home' })">Close</button>
  </div>
</template>
<script>
export default {
  data() {
    return {
      dropElement: null
    };
  },
  methods: {
    run() {
      console.log("e")
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
