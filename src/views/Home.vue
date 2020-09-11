<template>
  <div class="home container">
    <div class="home-navbar row">
      <div class="col-4 current-folder">{{ settings.pathToDir }}</div>
      <div class="col-3 manual-convert">
        <button class="btn btn-secondary">
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
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "Home",
  data: () => {
    return {};
  },
  computed: {
    ...mapGetters(["settings"])
  },
  components: {},
  methods: {}
};
</script>

<style scoped>
* {
  border: 1px dotted #999;
}
</style>
