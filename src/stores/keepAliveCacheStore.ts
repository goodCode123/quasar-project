// src/stores/keepAliveCacheStore.ts
import { defineStore } from "pinia";

export const useKeepAliveCacheStore = defineStore("keepAliveCache", {
  state: () => ({
    // include 要的是 array；內部用 Set 概念操作
    cachedNames: [] as string[],
    activeFlow: "" as string,
  }),
  actions: {
    ensure(name: string) {
      if (!this.cachedNames.includes(name)) this.cachedNames.push(name);
    },
    drop(name: string) {
      this.cachedNames = this.cachedNames.filter((x) => x !== name);
    },
  },
});
