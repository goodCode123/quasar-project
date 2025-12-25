<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <div class="text-h5">功能標題 — 資料管理</div>
      </div>

      <!-- 搜尋空間 -->
      <div class="col-12">
        <q-card>
          <q-card-section class="q-pa-sm">
            <div class="row q-col-gutter-md items-center">
              <div class="col-12 col-sm-6 col-md-3 col-md-4">
                <div class="row items-center no-wrap q-gutter-md q-pa-sm">
                  <q-item-label class="col-auto">主標題 :</q-item-label>
                  <q-input
                    v-model="searchCriteria1"
                    dense
                    outlined
                    class="col"
                  />
                </div>
              </div>

              <div class="col-12 col-sm-6 col-md-3 col-md-4">
                <div class="row items-center no-wrap q-gutter-md q-pa-sm">
                  <q-item-label class="col-auto">主標題 :</q-item-label>
                  <q-input
                    v-model="searchCriteria2"
                    dense
                    outlined
                    class="col"
                  />
                </div>
              </div>

              <div class="col-12 col-sm-6 col-md-3 col-md-4">
                <div class="row items-center no-wrap q-gutter-md q-pa-sm">
                  <q-item-label class="col-auto">主標題 :</q-item-label>
                  <q-input
                    v-model="searchCriteria3"
                    dense
                    outlined
                    class="col"
                  />
                </div>
              </div>

              <div class="col-12 col-sm-6 col-md-3 col-md-4">
                <div class="row items-center no-wrap q-gutter-md q-pa-sm">
                  <q-item-label class="col-auto">主標題 :</q-item-label>

                  <q-select
                    v-model="searchCriteria4"
                    class="col"
                    dense
                    outlined
                    use-input
                    hide-selected
                    fill-input
                    input-debounce="150"
                    :options="titleOptionsFiltered"
                    @filter="filterTitleOptions"
                    clearable
                    placeholder="輸入關鍵字搜尋"
                  />
                </div>
              </div>

              <!-- 第 5 個開始會自動換到下一排，且每排最多 4 個 -->
              <div class="col-12 col-sm-6 col-md-3 col-md-4">
                <div class="row items-center no-wrap q-gutter-md q-pa-sm">
                  <q-item-label class="col-auto">新增日期 :</q-item-label>

                  <q-input
                    v-model="createAt"
                    dense
                    outlined
                    class="col"
                    type="date"
                  />
                </div>
              </div>
            </div>

            <div class="row justify-end q-gutter-sm">
              <q-btn label="搜尋" color="primary" @click="onFilter" />
              <q-btn label="新增" color="secondary" @click="openAdd" />
              <q-btn label="刪除" color="negative" @click="deleteSelected" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- table 顯示空間 -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <q-table
              :rows="rowsFiltered"
              :columns="columns"
              row-key="id"
              flat
              bordered
            >
              <template v-slot:body-cell-actions="props">
                <q-td align="right">
                  <q-btn dense flat icon="edit" @click="openEdit(props.row)" />
                  <q-btn
                    dense
                    flat
                    icon="delete"
                    color="negative"
                    @click="removeItem(props.row.id)"
                  />
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 新增 / 編輯 Dialog -->
    <q-dialog v-model="dialog">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">
            {{ dialogMode === "add" ? "新增項目" : "編輯項目" }}
          </div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input v-model="form.text" label="文字" />
          <q-input v-model="form.criteria2" label="搜尋條件 2" />
          <q-input v-model="form.criteria3" label="搜尋條件 3" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="取消" v-close-popup @click="closeDialog" />
          <q-btn label="儲存" color="primary" @click="saveDialog" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

type Row = { id: number; text: string; criteria2?: string; criteria3?: string };

let createAt = ref("");

const rows = ref<Row[]>([
  { id: 1, text: "範例項目 A", criteria2: "內容1", criteria3: "條件1" },
  { id: 2, text: "範例項目 B", criteria2: "內容2", criteria3: "條件2" },
  { id: 3, text: "測試資料 C", criteria2: "內容3", criteria3: "條件3" },
]);

const searchCriteria1 = ref("");
const searchCriteria2 = ref("");
const searchCriteria3 = ref("");
const dialog = ref(false);
const dialogMode = ref<"add" | "edit">("add");
const form = ref({ id: 0, text: "", criteria2: "", criteria3: "" });
let nextId = 4;

const columns: any[] = [
  { name: "id", label: "ID", field: "id", align: "left" },
  { name: "text", label: "文字", field: "text" },
  { name: "criteria2", label: "條件2", field: "criteria2" },
  { name: "criteria3", label: "條件3", field: "criteria3" },
  { name: "actions", label: "操作", field: "actions", align: "right" },
];

const rowsFiltered = computed(() => {
  let result = rows.value;
  if (searchCriteria1.value) {
    result = result.filter((r) =>
      r.text.toLowerCase().includes(searchCriteria1.value.toLowerCase())
    );
  }
  if (searchCriteria2.value) {
    result = result.filter((r) =>
      (r.criteria2 || "")
        .toLowerCase()
        .includes(searchCriteria2.value.toLowerCase())
    );
  }
  if (searchCriteria3.value) {
    result = result.filter((r) =>
      (r.criteria3 || "")
        .toLowerCase()
        .includes(searchCriteria3.value.toLowerCase())
    );
  }
  return result;
});

function onFilter() {
  console.log(searchCriteria4.value);
  // table is reactive via computed; this exists for explicit search button
}

function openAdd() {
  dialogMode.value = "add";
  form.value = { id: 0, text: "", criteria2: "", criteria3: "" };
  dialog.value = true;
}

function openEdit(row: Row) {
  dialogMode.value = "edit";
  form.value = {
    id: row.id,
    text: row.text,
    criteria2: row.criteria2 || "",
    criteria3: row.criteria3 || "",
  };
  dialog.value = true;
}

function closeDialog() {
  dialog.value = false;
}

function saveDialog() {
  const t = form.value.text && form.value.text.trim();
  if (!t) return;
  if (dialogMode.value === "add") {
    rows.value.push({
      id: nextId++,
      text: t,
      criteria2: form.value.criteria2,
      criteria3: form.value.criteria3,
    });
  } else {
    const idx = rows.value.findIndex((r) => r.id === form.value.id);
    if (idx !== -1) {
      (rows.value[idx] as any).text = t;
      (rows.value[idx] as any).criteria2 = form.value.criteria2;
      (rows.value[idx] as any).criteria3 = form.value.criteria3;
    }
  }
  closeDialog();
}

function removeItem(id: number) {
  const idx = rows.value.findIndex((r) => r.id === id);
  if (idx !== -1) rows.value.splice(idx, 1);
}

function deleteSelected() {
  // 實現批量刪除邏輯，例如刪除選中的項目
  console.log("刪除選中的項目");
}

const searchCriteria4 = ref<string | null>(null);

// ✅ 全量選項（你可以換成從 API 回來的列表）
const titleOptionsAll = ref<string[]>([
  "出貨單",
  "退貨單",
  "入庫單",
  "調撥單",
  "盤點單",
  "結帳單",
]);

// ✅ 過濾後要顯示在下拉的選項
const titleOptionsFiltered = ref<string[]>([...titleOptionsAll.value]);

function filterTitleOptions(val: string, update: (fn: () => void) => void) {
  update(() => {
    const needle = (val || "").toLowerCase().trim();
    titleOptionsFiltered.value = !needle
      ? [...titleOptionsAll.value]
      : titleOptionsAll.value.filter((x) => x.toLowerCase().includes(needle));
  });
}
</script>

<style scoped></style>
