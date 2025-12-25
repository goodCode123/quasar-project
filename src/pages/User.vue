<template>
  <q-page class="q-pa-md">
    <!-- 標題 -->
    <div class="text-h5 text-primary q-mb-md">使用者</div>

    <!-- 工具列：搜尋 / 新增 / 重新整理 / 版面切換 -->
    <div class="row items-center q-col-gutter-sm q-mb-sm">
      <div class="col-12 col-sm-4 col-md-3">
        <q-input
          v-model="keyword"
          dense
          outlined
          clearable
          debounce="200"
          placeholder="搜尋"
          @clear="keyword = ''"
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
          label="新增 使用者"
          @click="createUser()"
        />
      </div>

      <div class="col-auto">
        <q-btn flat round icon="refresh" :loading="loading" @click="refresh()">
          <q-tooltip>重新整理</q-tooltip>
        </q-btn>
      </div>

      <div class="col-auto">
        <q-btn
          flat
          round
          :icon="dense ? 'view_agenda' : 'view_list'"
          @click="dense = !dense"
        >
          <q-tooltip>{{ dense ? "一般" : "密集" }}</q-tooltip>
        </q-btn>
      </div>

      <q-space />
    </div>

    <!-- 角色多選（chips） -->
    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-12 col-sm-6 col-md-5">
        <div class="text-caption text-grey-7 q-mb-xs">角色</div>

        <q-select
          v-model="roleFilter"
          :options="roleOptions"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          multiple
          use-chips
          dense
          outlined
          clearable
          use-input
          input-debounce="150"
          placeholder=""
          @filter="filterRoleOptions"
          @clear="roleFilter = []"
        />
      </div>
    </div>

    <!-- 表格 -->
    <q-table
      flat
      bordered
      separator="horizontal"
      row-key="userId"
      :dense="dense"
      :loading="loading"
      :columns="columns"
      :rows="filteredRows"
      :pagination="pagination"
    >
      <!-- 使用者名稱：可點超連結 -->
      <template #body-cell-username="props">
        <q-td :props="props">
          <a
            class="table-link"
            href="javascript:void(0)"
            @click="openEdit(props.row.userId)"
          >
            {{ props.row.username }}
          </a>
        </q-td>
      </template>

      <!-- 中間圖示欄（模擬 Serenity 那個小圖示） -->
      <template #body-cell-flag="props">
        <q-td :props="props" class="text-center">
          <q-icon name="person" size="18px" />
        </q-td>
      </template>

      <!-- 角色欄：顯示多角色 -->
      <template #body-cell-roles="props">
        <q-td :props="props">
          {{ props.row.roles.join(", ") }}
        </q-td>
      </template>

      <template #no-data>
        <div class="full-width row flex-center q-pa-md text-grey-7">
          沒有資料
        </div>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { QTableColumn, QTableProps } from "quasar";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";

defineOptions({ name: "User" });

type UserRow = {
  userId: number;
  username: string;
  displayName: string;
  email: string;
  source: "site" | "ldap" | "sso";
  roles: string[];
};

type RoleOption = { label: string; value: string };

const $q = useQuasar();
const router = useRouter();

const loading = ref(false);
const dense = ref(false);

const keyword = ref<string>("");

/** ✅ 多選：存 value[] */
const roleFilter = ref<string[]>([]);

/** 角色下拉：可搜尋 */
const roleOptionsAll = ref<RoleOption[]>([
  { label: "Administrators", value: "Administrators" },
  { label: "Developers", value: "Developers" },
  { label: "Employees", value: "Employees" },
  { label: "Northwind Users", value: "NorthwindUsers" },
  { label: "Work Log Customers", value: "WorkLogCustomers" },
  { label: "Work Log Managers", value: "WorkLogManagers" },
]);

const roleOptions = ref<RoleOption[]>([...roleOptionsAll.value]);

function filterRoleOptions(val: string, update: (cb: () => void) => void) {
  update(() => {
    const v = (val ?? "").trim().toLowerCase();
    if (!v) {
      roleOptions.value = [...roleOptionsAll.value];
      return;
    }
    roleOptions.value = roleOptionsAll.value.filter(
      (x) =>
        x.label.toLowerCase().includes(v) || x.value.toLowerCase().includes(v),
    );
  });
}

/** 表格欄位 */
const columns: QTableColumn<UserRow>[] = [
  {
    name: "userId",
    label: "使用者ID",
    field: "userId",
    align: "left",
    sortable: true,
  },
  {
    name: "username",
    label: "使用者名稱",
    field: "username",
    align: "left",
    sortable: true,
  },
  { name: "flag", label: "", field: () => "", align: "center" },
  {
    name: "displayName",
    label: "顯示名稱",
    field: "displayName",
    align: "left",
    sortable: true,
  },
  {
    name: "email",
    label: "電子郵件",
    field: "email",
    align: "left",
    sortable: true,
  },
  {
    name: "source",
    label: "來源",
    field: "source",
    align: "left",
    sortable: true,
  },
  { name: "roles", label: "角色", field: (r) => r.roles, align: "left" },
];

const pagination = ref<QTableProps["pagination"]>({
  page: 1,
  rowsPerPage: 20,
  sortBy: "userId",
  descending: false,
});

/** 假資料 */
const rows = ref<UserRow[]>([
  {
    userId: 16,
    username: "aaron.taylor",
    displayName: "Aaron Taylor",
    email: "aaron.taylor@acmecorp.com",
    source: "site",
    roles: ["Employees"],
  },
  {
    userId: 8,
    username: "adam.edwards",
    displayName: "Adam Edwards",
    email: "adam.edwards@acmecorp.com",
    source: "site",
    roles: ["Developers", "Employees"],
  },
  {
    userId: 37,
    username: "adam.stewart",
    displayName: "Adam Stewart",
    email: "adam.stewart@acmecorp.com",
    source: "site",
    roles: ["Employees"],
  },
  {
    userId: 1,
    username: "admin",
    displayName: "admin",
    email: "admin@domainmwra22cow3way.com",
    source: "site",
    roles: ["Administrators"],
  },
  {
    userId: 34,
    username: "alexis.lopez",
    displayName: "Alexis Lopez",
    email: "alexis.lopez@acmecorp.com",
    source: "site",
    roles: ["Employees"],
  },
  {
    userId: 46,
    username: "allison.bell",
    displayName: "Allison Bell",
    email: "allison.bell@acmecorp.com",
    source: "site",
    roles: ["Employees"],
  },
  {
    userId: 58,
    username: "andrew.white",
    displayName: "Andrew White",
    email: "andrew.white@acmecorp.com",
    source: "site",
    roles: ["Employees"],
  },
]);

/** ✅ 前端過濾：關鍵字 + 多角色（任一命中即通過） */
const filteredRows = computed(() => {
  const k = (keyword.value ?? "").trim().toLowerCase();
  const selectedRoles = roleFilter.value ?? [];

  return rows.value.filter((r) => {
    const hitKeyword =
      !k ||
      r.username.toLowerCase().includes(k) ||
      r.displayName.toLowerCase().includes(k) ||
      r.email.toLowerCase().includes(k) ||
      r.source.toLowerCase().includes(k) ||
      r.roles.join(",").toLowerCase().includes(k);

    // ✅ 多選角色：selectedRoles 任何一個在 r.roles 內就算符合
    const hitRole =
      selectedRoles.length === 0 ||
      selectedRoles.some((sr) => r.roles.includes(sr));

    return hitKeyword && hitRole;
  });
});

function openEdit(userId: number) {
  router.push(`/User/edit/${userId}`);
}

function createUser() {
  $q.notify({
    type: "info",
    message: "這裡接「新增使用者」流程（可導頁或開 dialog）",
  });
}

async function refresh() {
  loading.value = true;
  try {
    await new Promise((r) => setTimeout(r, 450));
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

/* ✅ 單雙列交錯色（不寫任何 JS） */
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
