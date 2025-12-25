<template>
  <q-page class="q-pa-md">
    <!-- 說明標題 -->
    <q-item class="q-mb-md">
      <q-item-section>
        <q-item-label class="text-subtitle1 text-weight-bold">
          ref 基本類型範例
        </q-item-label>
        <q-item-label caption>
          使用 Quasar 的 row / col 來進行版面配置
        </q-item-label>
      </q-item-section>
    </q-item>

    <q-banner class="bg-blue-1 text-blue-10 q-mb-md" rounded>
      <div class="text-subtitle2 text-weight-bold">說明</div>
      <div class="text-body2">
        ref 與 reactive 都是 Vue 3 用來建立「響應式資料」的
        API，但使用方式不同：
        <br /><br />
        ref 會回傳一個具有 <code>.value</code> 屬性的響應式物件，
        存取或修改資料時需透過
        <code>.value</code>，常用於基本型別，也可包裝物件。 <br /><br />
        reactive 則是直接將物件轉為響應式， 操作時不需要
        <code>.value</code>，但僅適用於物件與陣列。 <br /><br />
        本質上，<strong>ref 內部其實也是透過 reactive 來實作</strong>，
        只是多包了一層，讓基本型別也能具備響應式能力。
      </div>
    </q-banner>

    <!-- ✅ 卡片容器（flex row） -->
    <div class="row q-col-gutter-md">
      <!-- 卡片 1 -->
      <div class="col-12 col-sm-6 col-md-4">
        <q-item-label class="text-subtitle1 text-weight-bold">
          ref 基本類型範例
        </q-item-label>
        <q-card class="profile-card">
          <q-card-section>
            <div class="row q-mb-sm">
              <div class="col-3 text-weight-bold">姓名：</div>
              <div class="col-9">{{ name }}</div>
            </div>

            <div class="row q-mb-sm">
              <div class="col-3 text-weight-bold">電話：</div>
              <div class="col-9">{{ phone }}</div>
            </div>

            <div class="row">
              <div class="col-3 text-weight-bold">地址：</div>
              <div class="col-9">{{ address }}</div>
            </div>
          </q-card-section>

          <q-separator />
          <q-card-actions align="right">
            <q-btn color="primary" label="改個人資料" @click="changeRef" />
          </q-card-actions>
        </q-card>
      </div>

      <!-- 卡片 2 -->
      <div class="col-12 col-sm-6 col-md-4">
        <q-item-label class="text-subtitle1 text-weight-bold">
          ref 創建對象範例
        </q-item-label>
        <q-card class="profile-card">
          <q-card-section>
            <div class="row q-mb-sm">
              <div class="col-3 text-weight-bold">姓名：</div>
              <div class="col-9">{{ profile.name }}</div>
            </div>

            <div class="row q-mb-sm">
              <div class="col-3 text-weight-bold">電話：</div>
              <div class="col-9">{{ profile.phone }}</div>
            </div>

            <div class="row">
              <div class="col-3 text-weight-bold">地址：</div>
              <div class="col-9">{{ profile.address }}</div>
            </div>
          </q-card-section>

          <q-separator />
          <q-card-actions align="right">
            <q-btn
              color="primary"
              label="改個人資料"
              @click="changeRefObject"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- 卡片 3 -->
      <div class="col-12 col-sm-6 col-md-4">
        <q-item-label class="text-subtitle1 text-weight-bold">
          reactive 創建對象範例
        </q-item-label>
        <q-card class="profile-card">
          <q-card-section>
            <div class="row q-mb-sm">
              <div class="col-3 text-weight-bold">姓名：</div>
              <div class="col-9">{{ ReactiveProfile.name }}</div>
            </div>

            <div class="row q-mb-sm">
              <div class="col-3 text-weight-bold">電話：</div>
              <div class="col-9">{{ ReactiveProfile.phone }}</div>
            </div>

            <div class="row">
              <div class="col-3 text-weight-bold">地址：</div>
              <div class="col-9">{{ ReactiveProfile.address }}</div>
            </div>
          </q-card-section>

          <q-separator />
          <q-card-actions align="right">
            <q-btn
              color="primary"
              label="改個人資料"
              @click="changeReactiveProfile"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";

let name = ref("王小明");
let phone = ref("0912-345-678");
let address = ref("花蓮信義區松高路 1 號");

function changeRef() {
  name.value += "!";
  phone.value += "!";
  address.value += "!";
}

const profile = ref({
  name: "王小明",
  phone: "0912-345-678",
  address: "台北市信義區松高路 1 號",
});

let ReactiveProfile = reactive({
  name: "王小明",
  phone: "0912-345-678",
  address: "台北市信義區松高路 1 號",
});

function changeRefObject() {
  profile.value.name += "!";
  profile.value.phone += "!";
  profile.value.address += "!";
}

function changeReactiveProfile() {
  ReactiveProfile.name += "!";
  ReactiveProfile.phone += "!";
  ReactiveProfile.address += "!";
}
</script>

<style scoped>
.profile-card {
  background: #d9efff;
  border: 1px solid #b6ddff;
  border-radius: 12px;
}
</style>
