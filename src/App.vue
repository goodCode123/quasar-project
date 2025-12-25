<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { Dialog, Notify } from "quasar";

onMounted(() => {
  // @ts-ignore
  window.updater?.onDownloaded(() => {
    Dialog.create({
      title: "更新已下載",
      message: "要立即重啟套用更新嗎？",
      cancel: true,
      persistent: true,
    }).onOk(() => {
      // @ts-ignore
      window.updater.quitAndInstall();
    });
  });

  // @ts-ignore
  window.updater?.onError((_e, msg) => {
    Notify.create({ type: "negative", message: `更新失敗：${msg}` });
  });
});
</script>
