<template>
  <q-page class="q-pa-md">
    <!-- Title -->
    <div class="row items-center q-mb-md">
      <div class="text-h5 text-primary">選單管理</div>
      <q-space />
      <q-btn flat round icon="refresh" @click="reload()" />
    </div>

    <!-- Two Pane -->
    <div class="row q-col-gutter-md">
      <!-- Left: Groups -->
      <div class="col-12 col-md-4">
        <q-card flat bordered>
          <q-card-section class="row items-center">
            <div class="text-subtitle1">父項（群組）</div>
            <q-space />
            <q-btn
              color="primary"
              unelevated
              icon="add"
              label="新增"
              @click="openAddGroup()"
            />
          </q-card-section>

          <q-separator />

          <q-card-section class="q-pa-none">
            <q-list separator>
              <q-item
                v-for="g in menu"
                :key="g.id"
                clickable
                v-ripple
                :active="g.id === selectedGroupId"
                active-class="bg-grey-2 text-primary"
                @click="selectGroup(g.id)"
              >
                <q-item-section avatar>
                  <q-icon :name="g.icon || 'folder'" />
                </q-item-section>

                <q-item-section>
                  <q-item-label>{{ g.label }}</q-item-label>
                  <q-item-label caption>
                    {{ g.children.length }} 個子項
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-btn
                    flat
                    round
                    dense
                    icon="delete"
                    color="negative"
                    @click.stop="deleteGroup(g.id)"
                  />
                </q-item-section>
              </q-item>

              <q-item v-if="menu.length === 0">
                <q-item-section class="text-grey-7">
                  尚未建立任何群組
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Right: Children -->
      <div class="col-12 col-md-8">
        <q-card flat bordered>
          <q-card-section class="row items-center">
            <div class="text-subtitle1">
              子項（目前群組：{{ selectedGroup?.label ?? "未選擇" }}）
            </div>

            <q-space />

            <q-btn
              color="secondary"
              flat
              icon="playlist_add"
              label="新增子項"
              :disable="!selectedGroup"
              @click="openAddItem()"
            />
          </q-card-section>

          <q-separator />

          <q-card-section class="q-pa-none">
            <q-list separator>
              <q-item v-if="!selectedGroup">
                <q-item-section class="text-grey-7">
                  請先在左邊選擇一個群組
                </q-item-section>
              </q-item>

              <template v-else>
                <q-item v-for="it in selectedGroup.children" :key="it.id">
                  <q-item-section avatar>
                    <q-icon :name="it.icon || 'circle'" />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label>{{ it.label }}</q-item-label>
                    <q-item-label caption>
                      路徑：{{ it.to.path }}
                      <span v-if="it.permKey">｜權限：{{ it.permKey }}</span>
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <q-btn
                      flat
                      round
                      dense
                      icon="delete"
                      color="negative"
                      @click="deleteItem(selectedGroup.id, it.id)"
                    />
                  </q-item-section>
                </q-item>

                <q-item v-if="selectedGroup.children.length === 0">
                  <q-item-section class="text-grey-7">
                    此群組尚無子項
                  </q-item-section>
                </q-item>
              </template>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Add Group Dialog -->
    <q-dialog v-model="addGroup.open" persistent>
      <q-card style="width: 520px; max-width: 95vw">
        <q-card-section class="row items-center">
          <div class="text-h6">新增父項（群組）</div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-md">
          <q-input v-model="addGroup.label" outlined label="群組名稱" />
          <q-input
            v-model="addGroup.icon"
            outlined
            label="Icon（可空）"
            hint="例：people / settings / security"
          />
        </q-card-section>

        <q-separator />
        <q-card-actions align="right">
          <q-btn flat label="取消" v-close-popup />
          <q-btn
            color="primary"
            unelevated
            label="新增"
            @click="submitAddGroup()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Add Item Dialog -->
    <q-dialog v-model="addItem.open" persistent>
      <q-card style="width: 560px; max-width: 95vw">
        <q-card-section class="row items-center">
          <div class="text-h6">新增子項</div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-md">
          <q-input v-model="addItem.label" outlined label="子項名稱" />
          <q-input
            v-model="addItem.icon"
            outlined
            label="Icon（可空）"
            hint="例：badge / tune / history / manage_accounts"
          />
          <q-input
            v-model="addItem.path"
            outlined
            label="路徑（path）"
            hint="例：/User 或 /Roles 或 /system/audit"
          />
          <q-input
            v-model="addItem.permKey"
            outlined
            label="權限 Key（可空）"
            hint="例：Administration:Security:View"
          />
        </q-card-section>

        <q-separator />
        <q-card-actions align="right">
          <q-btn flat label="取消" v-close-popup />
          <q-btn
            color="primary"
            unelevated
            label="新增"
            @click="submitAddItem()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useQuasar } from "quasar";

type MenuChild = {
  id: string;
  label: string;
  icon: string;
  to: { path: string };
  permKey?: string;
};

type MenuGroup = {
  id: string;
  label: string;
  icon: string;
  children: MenuChild[];
};

const $q = useQuasar();

const STORAGE_KEY = "wms_menu_v1";

/** ✅ 這裡放你要的 data（初始用） */
const DEFAULT_MENU: MenuGroup[] = [
  {
    id: "g-user-mgmt",
    label: "User Management",
    icon: "people",
    children: [
      { id: "m-home", label: "Home", icon: "person", to: { path: "/" } },
      {
        id: "m-groups",
        label: "Groups",
        icon: "groups",
        to: { path: "/barcode" },
      },
      {
        id: "m-refpage",
        label: "ref基本類型的響應式數據",
        icon: "shield",
        to: { path: "/refpage" },
      },
      { id: "m-col", label: "col", icon: "shield", to: { path: "/col" } },
      {
        id: "m-torefs",
        label: "ToRefs",
        icon: "shield",
        to: { path: "/toRefs" },
      },
    ],
  },
  {
    id: "g-system",
    label: "System",
    icon: "settings",
    children: [
      {
        id: "m-audit",
        label: "Audit Logs",
        icon: "history",
        to: { path: "/system/audit" },
      },
      {
        id: "m-config",
        label: "Configuration",
        icon: "tune",
        to: { path: "/system/config" },
      },
    ],
  },
  {
    id: "g-auth",
    label: "權限設定",
    icon: "settings",
    children: [
      { id: "m-roles", label: "角色", icon: "history", to: { path: "/Roles" } },
      {
        id: "m-user",
        label: "使用者管理",
        icon: "tune",
        to: { path: "/User" },
      },
    ],
  },
];

const menu = ref<MenuGroup[]>([]);
const selectedGroupId = ref<string>("");

function uid(prefix = "") {
  return prefix + Math.random().toString(36).slice(2, 10);
}

/** ✅ 沒 localStorage 就用 DEFAULT_MENU */
function loadMenu() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    // 用深拷貝避免 DEFAULT_MENU 被意外改掉
    menu.value = structuredClone(DEFAULT_MENU);
    selectedGroupId.value = menu.value[0]?.id ?? "";
    return;
  }

  try {
    const parsed = JSON.parse(raw) as MenuGroup[];
    menu.value = Array.isArray(parsed) ? parsed : structuredClone(DEFAULT_MENU);
  } catch {
    menu.value = structuredClone(DEFAULT_MENU);
  }

  if (menu.value.length > 0) {
    const exists = menu.value.some((g) => g.id === selectedGroupId.value);
    if (!exists) selectedGroupId.value = menu.value[0].id;
  } else {
    selectedGroupId.value = "";
  }
}

function saveMenu() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(menu.value));
}

onMounted(() => {
  loadMenu();
});

watch(menu, saveMenu, { deep: true });

const selectedGroup = computed(() =>
  menu.value.find((g) => g.id === selectedGroupId.value),
);

function selectGroup(id: string) {
  selectedGroupId.value = id;
}

function reload() {
  loadMenu();
  $q.notify({ type: "info", message: "已重新載入" });
}

/* ===== Add Group ===== */
const addGroup = reactive({
  open: false,
  label: "",
  icon: "",
});

function openAddGroup() {
  addGroup.open = true;
  addGroup.label = "";
  addGroup.icon = "";
}

function submitAddGroup() {
  const label = addGroup.label.trim();
  const icon = addGroup.icon.trim() || "folder";

  if (!label) return $q.notify({ type: "negative", message: "群組名稱必填" });

  const newId = uid("g-");
  menu.value.push({
    id: newId,
    label,
    icon,
    children: [],
  });

  addGroup.open = false;
  selectedGroupId.value = newId;
  $q.notify({ type: "positive", message: "已新增群組" });
}

/* ===== Add Item ===== */
const addItem = reactive({
  open: false,
  label: "",
  icon: "",
  path: "",
  permKey: "",
});

function openAddItem() {
  if (!selectedGroup.value) return;
  addItem.open = true;
  addItem.label = "";
  addItem.icon = "";
  addItem.path = "";
  addItem.permKey = "";
}

function submitAddItem() {
  const g = selectedGroup.value;
  if (!g) return $q.notify({ type: "negative", message: "請先選擇群組" });

  const label = addItem.label.trim();
  const icon = addItem.icon.trim() || "circle";
  const path = addItem.path.trim();
  const permKey = addItem.permKey.trim();

  if (!label) return $q.notify({ type: "negative", message: "子項名稱必填" });
  if (!path.startsWith("/"))
    return $q.notify({ type: "negative", message: "path 必須以 / 開頭" });

  g.children.push({
    id: uid("m-"),
    label,
    icon,
    to: { path },
    permKey: permKey || undefined,
  });

  addItem.open = false;
  $q.notify({ type: "positive", message: "已新增子項" });
}

/* ===== Delete ===== */
function deleteGroup(groupId: string) {
  $q.dialog({
    title: "確認刪除",
    message: "確定要刪除此群組？（包含子項）",
    cancel: true,
    persistent: true,
  }).onOk(() => {
    menu.value = menu.value.filter((g) => g.id !== groupId);

    if (menu.value.length === 0) selectedGroupId.value = "";
    else if (!menu.value.some((g) => g.id === selectedGroupId.value))
      selectedGroupId.value = menu.value[0].id;

    $q.notify({ type: "positive", message: "已刪除群組" });
  });
}

function deleteItem(groupId: string, itemId: string) {
  const g = menu.value.find((x) => x.id === groupId);
  if (!g) return;

  g.children = g.children.filter((i) => i.id !== itemId);
  $q.notify({ type: "positive", message: "已刪除子項" });
}
</script>
