export const CommonMethods = {
  methods: {
    hashPath(string) {
      let hash = 0,
        i,
        chr;
      for (i = 0; i < string.length; i++) {
        chr = string.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0;
      }
      return hash.toString(10);
    }
  }
};
