<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title> WMS 倉儲系統 </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <img
        src="../assets/momo.png"
        alt="WMS Map"
        style="width: 100%; max-width: 300px; max-height: 100px"
      />
      <q-list padding>
        <q-expansion-item
          v-for="group in menu"
          :key="group.label"
          :icon="group.icon"
          :label="group.label"
          expand-separator
        >
          <q-item
            v-for="item in group.children"
            :key="item.label"
            clickable
            :to="item.to"
            exact
            active-class="text-primary"
          >
            <q-item-section avatar>
              <q-icon :name="item.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item.label }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-expansion-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view v-slot="{ Component }">
        <keep-alive :include="cache.cachedNames">
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import EssentialLink, {
  type EssentialLinkProps,
} from "components/EssentialLink.vue";
import { useKeepAliveCacheStore } from "src/stores/keepAliveCacheStore";
const cache = useKeepAliveCacheStore();

// menu definition used to render the left drawer via v-for
const menu = [
  {
    label: "User Management",
    icon: "people",
    children: [
      { label: "Home", icon: "person", to: { path: "/" } },
      { label: "Groups", icon: "groups", to: { path: "/barcode" } },
      {
        label: "ref基本類型的響應式數據",
        icon: "shield",
        to: { path: "/refpage" },
      },
      { label: "col", icon: "shield", to: { path: "/col" } },
      { label: "ToRefs", icon: "shield", to: { path: "/toRefs" } },
    ],
  },
  {
    label: "System",
    icon: "settings",
    children: [
      { label: "Audit Logs", icon: "history", to: { path: "/system/audit" } },
      { label: "Configuration", icon: "tune", to: { path: "/system/config" } },
    ],
  },
  {
    label: "權限設定",
    icon: "settings",
    children: [
      { label: "角色", icon: "history", to: { path: "/Roles" } },
      { label: "使用者管理", icon: "tune", to: { path: "/User" } },
      { label: "選單管理", icon: "tune", to: { path: "/Menu" } },
    ],
  },
];

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
