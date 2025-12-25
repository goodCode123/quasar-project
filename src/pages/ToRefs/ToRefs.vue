<template>
  <div class="row q-col-gutter-md">
    <!-- 卡片 1 -->
    <div class="col-12 col-sm-6 col-md-6">
      <q-item-label class="text-subtitle1 text-weight-bold q-mb-sm">
        ref 創建對象範例
      </q-item-label>

      <q-card class="profile-card">
        <q-card-section>
          <div class="row q-mb-sm">
            <div class="col text-weight-bold">姓名：{{ name }}</div>
          </div>
          <div class="row q-mb-sm">
            <div class="col text-weight-bold">電話：{{ phone }}</div>
          </div>
          <div class="row">
            <div class="col text-weight-bold">地址：{{ address }}</div>
          </div>
        </q-card-section>

        <q-separator />
        <q-card-actions align="right">
          <q-btn color="primary" label="改個人資料" @click="changeRefObject" />
        </q-card-actions>
      </q-card>
    </div>

    <!-- 卡片 2 -->
    <div class="col-12 col-sm-6 col-md-6">
      <q-item-label class="text-subtitle1 text-weight-bold q-mb-sm">
        ref 創建對象範例
      </q-item-label>

      <q-card class="profile-card">
        <q-card-section>
          <div class="row q-mb-sm">
            <div class="col text-weight-bold">姓名：{{ name1 }}</div>
          </div>
          <div class="row q-mb-sm">
            <div class="col text-weight-bold">電話：{{ phone2 }}</div>
          </div>
          <div class="row">
            <div class="col text-weight-bold">地址：{{ address3 }}</div>
          </div>
        </q-card-section>

        <q-separator />
        <q-card-actions align="right">
          <q-btn color="primary" label="改個人資料" @click="changeRefObject2" />
        </q-card-actions>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRefs, toRef, reactive } from "vue";

const profile = ref({
  name: "王小明",
  phone: "0912-345-678",
  address: "台北市信義區松高路 1 號",
});

const ReactiveProfile = reactive({
  name1: "王小明",
  phone2: "0912-345-678",
  address3: "台北市信義區松高路 1 號",
});

let { name, phone, address } = toRefs(profile.value);
//let name = toRef(profile.value.name, "name");
let { name1, phone2, address3 } = toRefs(ReactiveProfile);
console.log(name1, phone2, address3);

function changeRefObject() {
  name.value += "!";
  profile.value.phone += "!";
  profile.value.address += "!";
}

function changeRefObject2() {
  name1.value += "!";
  phone2.value += "!";
  address3.value += "!";
}
</script>

<style scoped>
.profile-card {
  background: #d9efff;
  border: 1px solid #b6ddff;
  border-radius: 12px;
}
</style>
