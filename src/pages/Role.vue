<template>
  <q-page class="q-pa-md">
    <!-- 標題 -->
    <div class="text-h5 text-primary q-mb-md">角色</div>

    <!-- 工具列 -->
    <div class="row items-center q-col-gutter-sm q-mb-sm">
      <div class="col-12 col-sm-4 col-md-3">
        <q-input
          v-model="keyword"
          dense
          outlined
          clearable
          debounce="200"
          placeholder="搜尋"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <div class="col-auto">
        <q-btn
          color="primary"
          unelevated
          icon="add"
          label="新增角色"
          @click="openCreate()"
        />
      </div>

      <div class="col-auto">
        <q-btn flat round icon="refresh" :loading="loading" @click="refresh()">
          <q-tooltip>重新整理</q-tooltip>
        </q-btn>
      </div>

      <q-space />
    </div>

    <!-- 表格 -->
    <q-table
      :rows="rows"
      :columns="columns"
      row-key="id"
      :filter="keyword"
      :loading="loading"
      :dense="dense"
      flat
      bordered
      separator="horizontal"
      :pagination="pagination"
      @request="onRequest"
    >
      <!-- 角色名稱：可點 -->
      <template #body-cell-name="props">
        <q-td :props="props">
          <a
            class="table-link"
            href="javascript:void(0)"
            @click="openEdit(props.row)"
          >
            {{ props.row.name }}
          </a>
        </q-td>
      </template>

      <!-- 角色金鑰：可點 -->
      <template #body-cell-roleKey="props">
        <q-td :props="props">
          <a
            class="table-link"
            href="javascript:void(0)"
            @click="openEdit(props.row)"
          >
            {{ props.row.roleKey }}
          </a>
        </q-td>
      </template>

      <template #no-data>
        <div class="full-width row flex-center q-pa-md text-grey-7">
          沒有資料
        </div>
      </template>
    </q-table>

    <!-- 新增 / 編輯 Dialog -->
    <q-dialog v-model="dialog.open" persistent>
      <q-card style="width: 560px; max-width: 95vw">
        <q-card-section class="row items-center">
          <div class="text-h6">
            {{ dialog.mode === "create" ? "新增角色" : "編輯角色" }}
          </div>
          <q-space />
          <q-btn flat round icon="close" @click="closeDialog()" />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-md">
          <q-input
            v-model="dialog.form.name"
            outlined
            dense
            label="角色名稱"
            :rules="[(v) => !!v || '必填']"
          />
          <q-input
            v-model="dialog.form.roleKey"
            outlined
            dense
            label="角色金鑰"
            hint="建議用穩定且不易變更的代號，例如 Administrators / WorkLogManagers"
            :rules="roleKeyRules"
          />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="取消" @click="closeDialog()" />
          <q-btn
            color="primary"
            unelevated
            :label="dialog.mode === 'create' ? '建立' : '儲存'"
            :disable="!canSubmit"
            @click="submit()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import type { QTableColumn, QTableProps } from "quasar";
import { useRouter } from "vue-router";

defineOptions({ name: "Role" });

const router = useRouter();

type RoleRow = {
  id: number;
  name: string;
  roleKey: string;
};

const keyword = ref("");
const dense = ref(false);
const loading = ref(false);

const columns: QTableColumn<RoleRow>[] = [
  {
    name: "id",
    label: "ID",
    field: "id",
    align: "left",
    sortable: true,
  },
  {
    name: "name",
    label: "角色名稱",
    field: "name",
    align: "left",
    sortable: true,
  },
  {
    name: "roleKey",
    label: "角色金鑰",
    field: "roleKey",
    align: "left",
    sortable: true,
  },
];

/** 模擬資料（你之後可改成 API 取得） */
const rows = ref<RoleRow[]>([
  { id: 1, name: "Administrators", roleKey: "Administrators" },
  { id: 2, name: "Developers", roleKey: "Developers" },
  { id: 3, name: "Employees", roleKey: "Employees" },
  { id: 4, name: "Northwind Users", roleKey: "NorthwindUsers" },
  { id: 5, name: "Work Log Customers", roleKey: "WorkLogCustomers" },
  { id: 6, name: "Work Log Managers", roleKey: "WorkLogManagers" },
]);

/** q-table 分頁（可依需求調整） */
const pagination = ref<QTableProps["pagination"]>({
  page: 1,
  rowsPerPage: 10,
  sortBy: "id",
  descending: false,
});

function onRequest(props: { pagination: QTableProps["pagination"] }) {
  // 若你之後改成 server-side paging/sort，在這邊打 API
  pagination.value = props.pagination;
}

/** Dialog 狀態 */
const dialog = reactive({
  open: false,
  mode: "create" as "create" | "edit",
  editingId: null as number | null,
  form: {
    name: "",
    roleKey: "",
  },
});

const roleKeyRules = [
  (v: string) => !!v || "必填",
  (v: string) =>
    /^[A-Za-z][A-Za-z0-9_]*$/.test(v) ||
    "格式：英文字開頭，只能英數或底線（_）",
];

const canSubmit = computed(() => {
  if (!dialog.form.name?.trim()) return false;
  if (!dialog.form.roleKey?.trim()) return false;
  return /^[A-Za-z][A-Za-z0-9_]*$/.test(dialog.form.roleKey);
});

function openCreate() {
  dialog.mode = "create";
  dialog.editingId = null;
  dialog.form.name = "";
  dialog.form.roleKey = "";
  dialog.open = true;
}

function openEdit(row: RoleRow) {
  router.push(`/Roles/edit/${row.id}`);
}

function closeDialog() {
  dialog.open = false;
}

function submit() {
  if (!canSubmit.value) return;

  if (dialog.mode === "create") {
    const nextId = Math.max(...rows.value.map((x) => x.id), 0) + 1;
    rows.value = [
      ...rows.value,
      {
        id: nextId,
        name: dialog.form.name.trim(),
        roleKey: dialog.form.roleKey.trim(),
      },
    ];
  } else {
    const id = dialog.editingId;
    if (id == null) return;
    rows.value = rows.value.map((r) =>
      r.id === id
        ? {
            ...r,
            name: dialog.form.name.trim(),
            roleKey: dialog.form.roleKey.trim(),
          }
        : r,
    );
  }

  closeDialog();
}

async function refresh() {
  // 這裡示範「重新整理」的 loading 效果；你之後可改成呼叫 API
  loading.value = true;
  try {
    await new Promise((r) => setTimeout(r, 450));
    // rows.value = await api.getRoles()
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.table-link {
  color: var(--q-primary);
  text-decoration: none;
  font-weight: 500;
}
.table-link:hover {
  text-decoration: underline;
}

:deep(.q-table tbody tr:nth-child(odd)) td {
  background: rgba(218, 213, 213, 0.02);
}

:deep(.q-table tbody tr:nth-child(even)) td {
  background: rgba(134, 170, 238, 0.06);
}

/* ✅ hover 高亮（可選） */
:deep(.q-table tbody tr:hover) td {
  background: rgba(0, 0, 0, 0.1) !important;
}
</style>
