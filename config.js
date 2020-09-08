export default {
  _settings: {
    pathToDir: "",
    outputProfile: "",
    pathToProfile: ""
  },
  get settings() {
    return this._settings;
  },
  update(field, payload) {
    if (field === "all") {
      console.log("update all", payload);
      this._settings = payload;
      console.log("after update", this.settings)
    } else this._settings[field] = payload;
    //console.log(this.settings);
  }
};
