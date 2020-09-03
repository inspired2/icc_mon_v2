<template>
  <div class="home container">
    <div class="home-navbar row">
      <div class="col-4 current-folder"></div>
      <div class="col-3 manual-convert">
        <button class="btn btn-secondary"></button>
      </div>
      <div class="col-3 settings"></div>
    </div>
    <h1>APP</h1>
  </div>
</template>

<script>
export default {
  name: "Home",
  data: () => {
    return {};
  },
  components: {}
};
</script>

<style scoped>
.home-navbar {
}
* {
  border: 1px dotted #999;
}
</style>
