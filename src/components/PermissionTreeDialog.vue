<template>
  <q-dialog
    :model-value="modelValue"
    persistent
    @update:model-value="emitModelValue"
  >
    <q-card style="width: 860px; max-width: 96vw">
      <!-- 標題列 -->
      <q-card-section class="row items-center">
        <div class="text-h6">
          {{ title }} <span v-if="subjectName">({{ subjectName }})</span>
        </div>
        <q-space />
        <q-btn flat round icon="close" @click="close()" />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pt-sm">
        <!-- 搜尋 -->
        <div class="row items-center q-col-gutter-sm q-mb-sm">
          <div class="col-12 col-sm-4">
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
        </div>

        <!-- 表頭（權限 / 授權） - 用原生 Quasar 排版 -->
        <q-card flat bordered class="q-mb-none">
          <q-card-section class="row items-center q-py-sm">
            <div class="col text-weight-medium">權限</div>
            <div
              class="col-auto text-weight-medium"
              style="width: 120px; text-align: center"
            >
              授權
            </div>
          </q-card-section>

          <q-separator />

          <!-- 樹狀列表 -->
          <q-scroll-area style="height: 420px">
            <q-tree
              :nodes="filteredNodes"
              node-key="key"
              v-model:expanded="expanded"
              dense
            >
              <template #default-header="p">
                <div class="row items-center full-width">
                  <div class="col row items-center no-wrap">
                    <q-icon
                      :name="leftIcon(p.node)"
                      :color="leftColor(p.node)"
                      size="18px"
                      class="q-mr-sm"
                    />
                    <div class="text-body2">{{ p.node.label }}</div>
                  </div>

                  <div
                    class="col-auto"
                    style="width: 120px; text-align: center"
                  >
                    <q-checkbox
                      :model-value="checkValue(p.node)"
                      :indeterminate-value="null"
                      @update:model-value="() => toggleNode(p.node)"
                    />
                  </div>
                </div>
              </template>
            </q-tree>
          </q-scroll-area>
        </q-card>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn flat label="取消" @click="close()" />
        <q-btn color="primary" unelevated label="OK" @click="ok()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

export type PermNode = {
  key: string;
  label: string;
  permKey?: string; // 葉子或任意節點都可有（你資料怎麼設計都行）
  children?: PermNode[];
};

const props = defineProps<{
  modelValue: boolean; // v-model
  title?: string; // "編輯角色權限" / "編輯使用者權限"
  subjectName?: string; // Administrators / adam.edwards
  nodes: PermNode[]; // 權限樹資料
  selectedKeys: string[]; // 已勾選的 permKey（外部傳入）
  defaultExpanded?: string[]; // 沒搜尋時預設展開哪些 key
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "update:selectedKeys", v: string[]): void; // 想做成雙向也可以用
  (e: "ok", v: string[]): void; // 點 OK 回傳選到的 keys
  (e: "cancel"): void;
}>();

const title = computed(() => props.title ?? "編輯權限");

const keyword = ref<string>("");
const expanded = ref<string[]>([]);
const selected = ref<Set<string>>(new Set<string>());

// 開啟 Dialog 時，把外部 selectedKeys 帶進來（避免使用者上一輪殘留）
watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      keyword.value = "";
      selected.value = new Set(props.selectedKeys ?? []);
      expanded.value = props.defaultExpanded?.length
        ? [...props.defaultExpanded]
        : [];
    }
  },
  { immediate: true },
);

function emitModelValue(v: boolean) {
  emit("update:modelValue", v);
}

function close() {
  emit("cancel");
  emit("update:modelValue", false);
}

function ok() {
  const keys = Array.from(selected.value.values());
  emit("update:selectedKeys", keys);
  emit("ok", keys);
  emit("update:modelValue", false);
}

/** 收集某節點底下所有葉子 permKey（含自己） */
function collectLeafPermKeys(node: PermNode): string[] {
  const keys: string[] = [];
  const walk = (n: PermNode) => {
    if (n.permKey) keys.push(n.permKey);
    n.children?.forEach(walk);
  };
  walk(node);
  return keys;
}

/** 三態：true(全選) / false(全不選) / null(部分選) */
function checkValue(node: PermNode): boolean | null {
  const leafKeys = collectLeafPermKeys(node);
  if (leafKeys.length === 0) return false;

  let hit = 0;
  for (const k of leafKeys) if (selected.value.has(k)) hit++;

  if (hit === 0) return false;
  if (hit === leafKeys.length) return true;
  return null;
}

/** 點 checkbox：none/partial -> 全選；checked -> 全清 */
function toggleNode(node: PermNode) {
  const current = checkValue(node);
  const leafKeys = collectLeafPermKeys(node);
  if (leafKeys.length === 0) return;

  const shouldSelectAll = current !== true;
  if (shouldSelectAll) leafKeys.forEach((k) => selected.value.add(k));
  else leafKeys.forEach((k) => selected.value.delete(k));
}

/** 左側狀態圖示（紅/藍/綠） */
function leftIcon(node: PermNode) {
  const v = checkValue(node);
  if (v === true) return "check_circle";
  if (v === null) return "remove_circle";
  return "cancel";
}
function leftColor(node: PermNode) {
  const v = checkValue(node);
  if (v === true) return "positive";
  if (v === null) return "primary";
  return "negative";
}

/** 搜尋過濾：保留命中的節點與其祖先 */
function filterTree(nodes: PermNode[], kw: string): PermNode[] {
  console.log("filterTree", (kw ?? "").trim().toLowerCase());
  console.log("PermNode", nodes);
  const k = (kw ?? "").trim().toLowerCase();

  if (!k) return nodes;
  const match = (n: PermNode) =>
    n.label.toLowerCase().includes(k) ||
    (n.permKey?.toLowerCase().includes(k) ?? false);

  const dfs = (arr: PermNode[]): PermNode[] => {
    const out: PermNode[] = [];
    for (const n of arr) {
      const children = n.children ? dfs(n.children) : [];
      if (match(n) || children.length) {
        const { children: _, ...rest } = n;
        out.push({ ...rest, ...(children.length ? { children } : {}) });
      }
    }
    return out;
  };

  return dfs(nodes);
}

const filteredNodes = computed(() => filterTree(props.nodes, keyword.value));

/** 搜尋時自動展開所有可展開節點 */
function collectExpandableKeys(nodes: PermNode[]): string[] {
  const keys: string[] = [];
  const walk = (n: PermNode) => {
    if (n.children?.length) {
      keys.push(n.key);
      n.children.forEach(walk);
    }
  };
  nodes.forEach(walk);
  return keys;
}

watch(
  () => keyword.value,
  (v) => {
    const k = (v ?? "").trim();
    if (k) expanded.value = collectExpandableKeys(filteredNodes.value);
    else
      expanded.value = props.defaultExpanded?.length
        ? [...props.defaultExpanded]
        : [];
  },
);
</script>
