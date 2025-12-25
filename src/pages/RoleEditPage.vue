<template>
  <q-page class="q-pa-md">
    <!-- 標題列 -->
    <div class="row items-center q-mb-md">
      <div class="text-h5 text-primary">
        編輯角色 ({{ model.name || "..." }})
      </div>
      <q-space />
      <q-btn flat round icon="close" @click="closePage()">
        <q-tooltip>關閉</q-tooltip>
      </q-btn>
    </div>

    <!-- 操作按鈕列 -->
    <div class="row items-center q-col-gutter-sm q-mb-md">
      <div class="col-auto">
        <q-btn
          color="primary"
          unelevated
          icon="check"
          label="儲存"
          :loading="saving"
          :disable="!canSave"
          @click="save()"
        />
      </div>

      <div class="col-auto">
        <q-btn
          color="negative"
          flat
          icon="delete"
          label="刪除"
          :disable="saving"
          @click="confirmDelete()"
        />
      </div>

      <div class="col-auto">
        <q-btn
          color="secondary"
          flat
          icon="lock"
          label="編輯權限"
          :disable="saving"
          @click="openPermissions()"
        />
      </div>
    </div>

    <!-- 表單區 -->
    <q-card flat bordered>
      <q-card-section class="q-gutter-md">
        <q-input
          v-model="model.name"
          outlined
          label="角色名稱"
          :rules="[(v) => !!v || '必填']"
        />
        <q-input
          v-model="model.roleKey"
          outlined
          label="角色金鑰"
          hint="建議用穩定代號，例如 Administrators / WorkLogManagers"
          :rules="roleKeyRules"
        />
      </q-card-section>
    </q-card>

    <!-- 刪除確認 -->
    <q-dialog v-model="deleteDialog">
      <q-card style="width: 420px; max-width: 95vw">
        <q-card-section class="text-h6">確認刪除？</q-card-section>
        <q-card-section class="text-grey-7">
          將刪除角色：<b>{{ model.name }}</b>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="取消" v-close-popup />
          <q-btn color="negative" unelevated label="刪除" @click="doDelete()" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
  <PermissionTreeDialog
    v-model="permDialogOpen"
    title="編輯角色權限"
    :subject-name="model.name"
    :nodes="permNodes"
    :selected-keys="rolePermKeys"
    :default-expanded="['admin']"
    @ok="onPermOk"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import PermissionTreeDialog, {
  type PermNode,
} from "src/components/PermissionTreeDialog.vue";
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";

type RoleModel = {
  id: number;
  name: string;
  roleKey: string;
};

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const permDialogOpen = ref(false);
const rolePermKeys = ref<string[]>([
  "Administration:Security",
  "Administration:Security:View",
]);

function openPermissions() {
  permDialogOpen.value = true;
}

function onPermOk(keys: string[]) {
  rolePermKeys.value = keys;
  $q.notify({
    type: "positive",
    message: `Role 已選：${keys.join(", ") || "(空)"}`,
  });
}

const id = computed(() => Number(route.params.id));
const saving = ref(false);
const deleteDialog = ref(false);

const model = reactive<RoleModel>({
  id: 0,
  name: "",
  roleKey: "",
});

const roleKeyRules = [
  (v: string) => !!v || "必填",
  (v: string) =>
    /^[A-Za-z][A-Za-z0-9_]*$/.test(v) ||
    "格式：英文字開頭，只能英數或底線（_）",
];

const canSave = computed(() => {
  if (!model.name?.trim()) return false;
  if (!model.roleKey?.trim()) return false;
  return /^[A-Za-z][A-Za-z0-9_]*$/.test(model.roleKey);
});

onMounted(async () => {
  await loadRole(id.value);
});

async function loadRole(roleId: number) {
  const fake: Record<number, RoleModel> = {
    1: { id: 1, name: "Administrators", roleKey: "Administrators" },
    2: { id: 2, name: "Developers", roleKey: "Developers" },
    3: { id: 3, name: "Employees", roleKey: "Employees" },
    4: { id: 4, name: "Northwind Users", roleKey: "NorthwindUsers" },
    5: { id: 5, name: "Work Log Customers", roleKey: "WorkLogCustomers" },
    6: { id: 6, name: "Work Log Managers", roleKey: "WorkLogManagers" },
  };

  const data = fake[roleId];
  if (!data) {
    $q.notify({ type: "negative", message: "找不到角色" });
    router.replace("/administration/role");
    return;
  }

  model.id = data.id;
  model.name = data.name;
  model.roleKey = data.roleKey;
}

async function save() {
  if (!canSave.value) return;

  saving.value = true;
  try {
    await new Promise((r) => setTimeout(r, 450));
    $q.notify({ type: "positive", message: "已儲存" });
  } finally {
    saving.value = false;
  }
}

function confirmDelete() {
  deleteDialog.value = true;
}

async function doDelete() {
  deleteDialog.value = false;
  saving.value = true;
  try {
    await new Promise((r) => setTimeout(r, 450));
    $q.notify({ type: "positive", message: "已刪除" });
    router.push("/role");
  } finally {
    saving.value = false;
  }
}

function closePage() {
  router.push("/Roles");
}

/* =========================
   ✅ 權限編輯 Dialog（核心）
   ========================= */

// 這份資料你之後可改成打 API 拿
const permNodes: PermNode[] = [
  {
    key: "mail-client",
    label: "電子郵件客戶端",
    children: [{ key: "mailbox", label: "郵箱", permKey: "Mail:Mailbox" }],
  },
  {
    key: "admin",
    label: "管理",
    children: [
      {
        key: "admin-users",
        label: "使用者，角色管理和權限",
        permKey: "Administration:Security",
        children: [
          {
            key: "admin-users-view",
            label: "查看",
            permKey: "Administration:Security:View",
          },
          {
            key: "admin-users-modify",
            label: "修改",
            permKey: "Administration:Security:Modify",
          },
          {
            key: "admin-users-delete",
            label: "刪除",
            permKey: "Administration:Security:Delete",
          },
        ],
      },
      {
        key: "admin-exception",
        label: "異常日誌",
        permKey: "Administration:ExceptionLog",
      },
      {
        key: "admin-mailq",
        label: "郵件隊列",
        permKey: "Administration:MailQueue",
      },
      {
        key: "admin-lang",
        label: "語言和翻譯",
        permKey: "Administration:Languages",
      },
      {
        key: "admin-dataexplorer",
        label: "數據探索器",
        permKey: "Administration:DataExplorer",
      },
      {
        key: "admin-audit",
        label: "數據審計日誌",
        permKey: "Administration:AuditLog",
      },
    ],
  },
];
</script>

<style scoped>
.perm-header {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-bottom: none;
  padding: 10px 12px;
  border-radius: 6px 6px 0 0;
  background: rgba(0, 0, 0, 0.03);
}
.perm-body {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 0 0 6px 6px;
}
.perm-row {
  padding: 6px 8px;
}
</style>
