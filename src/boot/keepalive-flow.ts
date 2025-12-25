// src/boot/keepalive-flow.ts
import { boot } from "quasar/wrappers";
import { useKeepAliveCacheStore } from "src/stores/keepAliveCacheStore";

export default boot(({ router }) => {
  router.afterEach((to, from) => {
    const cache = useKeepAliveCacheStore();

    const toFlow = (to.meta.flow as string) || "";
    const fromFlow = (from.meta.flow as string) || "";

    const toCacheName = (to.meta.CacheName as string) || "";
    const fromCacheName = (from.meta.CacheName as string) || "";
    // 1) 離開某個 flow（到別的 flow 或無 flow）=> 清掉該 flow 的列表快取
    if (fromFlow && fromFlow !== toFlow && fromCacheName) {
      cache.drop(fromCacheName);
    }

    // 2) 進入某個 flow => 確保該 flow 的列表允許快取
    if (toFlow && toCacheName) {
      cache.ensure(toCacheName);
    }

    cache.activeFlow = toFlow;
  });
});
