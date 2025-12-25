<template>
  <q-page class="q-pa-md">
    <!-- 標題列 -->
    <div class="row items-center q-mb-md">
      <div class="text-h5 text-primary">
        編輯使用者 ({{ model.username || "..." }})
      </div>
      <q-space />
      <q-btn flat round icon="close" @click="closePage()">
        <q-tooltip>關閉</q-tooltip>
      </q-btn>
    </div>

    <!-- 操作按鈕列（用原生 row/col + q-btn-group） -->
    <div class="row items-center q-col-gutter-sm q-mb-md">
      <div class="col-auto">
        <q-btn-group unelevated>
          <q-btn
            color="primary"
            icon="check_circle"
            label="儲存"
            :loading="saving"
            :disable="!canSave"
            @click="save()"
          />
          <q-btn
            color="negative"
            flat
            icon="delete"
            label="刪除"
            :disable="saving"
            @click="confirmDelete()"
          />
          <q-btn
            color="secondary"
            flat
            icon="lock"
            label="編輯權限"
            :disable="saving"
            @click="openPermissions()"
          />
        </q-btn-group>
      </div>
    </div>

    <!-- 表單：用 q-form + q-card + row/col，不寫客製 grid -->
    <q-form @submit.prevent="save">
      <q-card flat bordered>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <!-- 使用者名稱 -->
            <div class="col-12">
              <div class="row items-center q-col-gutter-md">
                <div class="col-12 col-sm-2 text-right text-weight-medium">
                  <span class="text-negative">*</span> 使用者名稱
                </div>
                <div class="col-12 col-sm-10">
                  <q-input
                    v-model="model.username"
                    dense
                    outlined
                    :rules="[(v) => !!(v && v.trim()) || '必填']"
                  />
                </div>
              </div>
            </div>

            <!-- 顯示名稱 -->
            <div class="col-12">
              <div class="row items-center q-col-gutter-md">
                <div class="col-12 col-sm-2 text-right text-weight-medium">
                  <span class="text-negative">*</span> 顯示名稱
                </div>
                <div class="col-12 col-sm-10">
                  <q-input
                    v-model="model.displayName"
                    dense
                    outlined
                    :rules="[(v) => !!(v && v.trim()) || '必填']"
                  />
                </div>
              </div>
            </div>

            <!-- 電子郵件 -->
            <div class="col-12">
              <div class="row items-center q-col-gutter-md">
                <div class="col-12 col-sm-2 text-right text-weight-medium">
                  電子郵件
                </div>
                <div class="col-12 col-sm-10">
                  <q-input v-model="model.email" dense outlined type="email" />
                </div>
              </div>
            </div>

            <!-- 角色（多選 chips） -->
            <div class="col-12">
              <div class="row items-center q-col-gutter-md">
                <div class="col-12 col-sm-2 text-right text-weight-medium">
                  角色
                </div>
                <div class="col-12 col-sm-10">
                  <q-select
                    v-model="model.roles"
                    :options="roleOptions"
                    multiple
                    use-chips
                    dense
                    outlined
                    clearable
                    use-input
                    input-debounce="150"
                    @filter="filterRoleOptions"
                  />
                </div>
              </div>
            </div>

            <!-- 手機號碼 -->
            <div class="col-12">
              <div class="row items-center q-col-gutter-md">
                <div class="col-12 col-sm-2 text-right text-weight-medium">
                  手機號碼
                </div>
                <div class="col-12 col-sm-10">
                  <q-input v-model="model.mobilePhone" dense outlined />
                </div>
              </div>
            </div>

            <!-- 使用者圖片（用 q-uploader 原生） -->
            <div class="col-12">
              <div class="row items-start q-col-gutter-md">
                <div class="col-12 col-sm-2 text-right text-weight-medium">
                  使用者圖片
                </div>
                <div class="col-12 col-sm-10">
                  <q-uploader
                    label="選擇檔案"
                    accept="image/*"
                    auto-upload="false"
                    hide-upload-btn
                    flat
                    bordered
                    :max-files="1"
                    @added="onAddedFiles"
                    @removed="onRemovedFiles"
                  />
                </div>
              </div>
            </div>

            <!-- 密碼 -->
            <div class="col-12">
              <div class="row items-center q-col-gutter-md">
                <div class="col-12 col-sm-2 text-right text-weight-medium">
                  密碼
                </div>
                <div class="col-12 col-sm-10">
                  <q-input
                    v-model="model.password"
                    dense
                    outlined
                    type="password"
                    autocomplete="new-password"
                  />
                </div>
              </div>
            </div>

            <!-- 確認密碼 -->
            <div class="col-12">
              <div class="row items-center q-col-gutter-md">
                <div class="col-12 col-sm-2 text-right text-weight-medium">
                  確認密碼
                </div>
                <div class="col-12 col-sm-10">
                  <q-input
                    v-model="model.confirmPassword"
                    dense
                    outlined
                    type="password"
                    autocomplete="new-password"
                    :rules="confirmPasswordRules"
                  />
                </div>
              </div>
            </div>

            <!-- 來源（唯讀） -->
            <div class="col-12">
              <div class="row items-center q-col-gutter-md">
                <div class="col-12 col-sm-2 text-right text-weight-medium">
                  來源
                </div>
                <div class="col-12 col-sm-10">
                  <q-input v-model="model.source" dense outlined readonly />
                </div>
              </div>
            </div>

            <!-- 啟用 -->
            <div class="col-12">
              <div class="row items-center q-col-gutter-md">
                <div class="col-12 col-sm-2 text-right text-weight-medium">
                  啟用
                </div>
                <div class="col-12 col-sm-10">
                  <q-checkbox v-model="model.isActive" />
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-form>

    <!-- 刪除確認 -->
    <q-dialog v-model="deleteDialog">
      <q-card style="width: 420px; max-width: 95vw">
        <q-card-section class="text-h6">確認刪除？</q-card-section>
        <q-card-section class="text-grey-7">
          將刪除使用者：<b>{{ model.username }}</b>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="取消" v-close-popup />
          <q-btn color="negative" unelevated label="刪除" @click="doDelete()" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 編輯權限（先留一個原生 dialog 容器，你可接前面 q-tree） -->
    <q-dialog v-model="permDialog" persistent>
      <q-card style="width: 860px; max-width: 96vw">
        <q-card-section class="row items-center">
          <div class="text-h6">
            編輯使用者權限 ({{ model.username || "..." }})
          </div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section class="text-grey-7">
          這裡接「權限樹」內容（你之前那套 q-tree + checkbox）。
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="取消" v-close-popup />
          <q-btn color="primary" unelevated label="OK" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
  <PermissionTreeDialog
    v-model="permDialogOpen"
    title="編輯使用者權限"
    :subject-name="model.username"
    :nodes="permNodes"
    :selected-keys="userPermKeys"
    :default-expanded="['admin']"
    @ok="onPermOk"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import PermissionTreeDialog, {
  type PermNode,
} from "src/components/PermissionTreeDialog.vue";
import { useQuasar } from "quasar";

type UserModel = {
  id: number;
  username: string;
  displayName: string;
  email: string;
  roles: string[];
  mobilePhone: string;
  photoFile: File | null;
  password: string;
  confirmPassword: string;
  source: "site" | "ldap" | "sso";
  isActive: boolean;
};

const $q = useQuasar();
const route = useRoute();
const router = useRouter();

const id = computed(() => Number(route.params.id));
const saving = ref(false);
const deleteDialog = ref(false);
const permDialog = ref(false);
const permDialogOpen = ref(false);

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

const userPermKeys = ref<string[]>(["Administration:Security:View"]);

function onPermOk(keys: string[]) {
  userPermKeys.value = keys;
  $q.notify({
    type: "positive",
    message: `User 已選：${keys.join(", ") || "(空)"}`,
  });
}

const model = reactive<UserModel>({
  id: 0,
  username: "",
  displayName: "",
  email: "",
  roles: [],
  mobilePhone: "",
  photoFile: null,
  password: "",
  confirmPassword: "",
  source: "site",
  isActive: true,
});

/** 角色選單（可搜尋） */
const roleOptionsAll = ref<string[]>([
  "Administrators",
  "Developers",
  "Employees",
  "NorthwindUsers",
  "WorkLogCustomers",
  "WorkLogManagers",
]);
const roleOptions = ref<string[]>([...roleOptionsAll.value]);

function filterRoleOptions(val: string, update: (cb: () => void) => void) {
  update(() => {
    const v = (val ?? "").trim().toLowerCase();
    roleOptions.value = !v
      ? [...roleOptionsAll.value]
      : roleOptionsAll.value.filter((x) => x.toLowerCase().includes(v));
  });
}

/** 密碼確認 rules */
const confirmPasswordRules = [
  (v: string) => {
    if (!model.password && !v) return true;
    return !!v || "請輸入確認密碼";
  },
  (v: string) => {
    if (!model.password && !v) return true;
    return v === model.password || "兩次密碼不一致";
  },
];

const canSave = computed(() => {
  if (!model.username.trim()) return false;
  if (!model.displayName.trim()) return false;
  if (model.password || model.confirmPassword) {
    if (!model.confirmPassword) return false;
    if (model.confirmPassword !== model.password) return false;
  }
  return true;
});

onMounted(async () => {
  await loadUser(id.value);
});

async function loadUser(userId: number) {
  // TODO: 改 API：User/Retrieve
  const fake: Record<
    number,
    Omit<UserModel, "photoFile" | "password" | "confirmPassword">
  > = {
    8: {
      id: 8,
      username: "adam.edwards",
      displayName: "Adam Edwards",
      email: "adam.edwards@acmecorp.com",
      roles: ["Employees", "Developers"],
      mobilePhone: "",
      source: "site",
      isActive: true,
    },
    1: {
      id: 1,
      username: "admin",
      displayName: "admin",
      email: "admin@domainmwra22cow3way.com",
      roles: ["Administrators"],
      mobilePhone: "",
      source: "site",
      isActive: true,
    },
  };

  const data = fake[userId];
  if (!data) {
    $q.notify({ type: "negative", message: "找不到使用者" });
    router.replace("/administration/user");
    return;
  }

  model.id = data.id;
  model.username = data.username;
  model.displayName = data.displayName;
  model.email = data.email;
  model.roles = [...data.roles];
  model.mobilePhone = data.mobilePhone;
  model.source = data.source;
  model.isActive = data.isActive;

  model.photoFile = null;
  model.password = "";
  model.confirmPassword = "";
}

async function save() {
  if (!canSave.value) return;

  saving.value = true;
  try {
    // TODO: 改 API：User/Update（含 roles / photoFile / password）
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
    // TODO: 改 API：User/Delete
    await new Promise((r) => setTimeout(r, 450));
    $q.notify({ type: "positive", message: "已刪除" });
    router.push("/user");
  } finally {
    saving.value = false;
  }
}

function openPermissions() {
  //permDialog.value = true;
  permDialogOpen.value = true;
}

function closePage() {
  router.push("/user");
}

/** q-uploader 事件 */
function onAddedFiles(files: readonly File[]) {
  model.photoFile = files?.[0] ?? null;
}
function onRemovedFiles() {
  model.photoFile = null;
}
</script>
