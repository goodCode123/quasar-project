<template>
  <q-page class="q-pa-md column q-gutter-md">
    <div class="text-h6">條碼 / QR Code 掃描</div>

    <q-btn
      label="開始掃描"
      color="primary"
      :loading="loading"
      @click="onScan"
    />

    <q-input
      v-model="resultText"
      label="掃描結果"
      outlined
      readonly
      type="textarea"
      autogrow
    />

    <div class="text-caption text-grey-7">
      提醒：Android Emulator 常常沒有可用相機或掃描 UI 依賴，建議用實機測最準。
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref ,onMounted} from 'vue'
import { Dialog, Notify } from 'quasar'
import { Capacitor } from '@capacitor/core'
import {
  BarcodeScanner,
  BarcodeFormat,
  type Barcode
} from '@capacitor-mlkit/barcode-scanning'

const loading = ref(false)
const resultText = ref('')
console.log('@@@',Notify)
onMounted(()=>{
  console.log('platform =', Capacitor.getPlatform())
console.log('isNative =', Capacitor.isNativePlatform())
console.log('BarcodeScanner available =', Capacitor.isPluginAvailable('BarcodeScanner'))
})

async function ensurePermissionOrThrow() {
  const { camera } = await BarcodeScanner.requestPermissions()
  if (camera === 'granted') return

  Dialog.create({
    title: '需要相機權限',
    message: '未取得相機權限，無法掃描。你可以到系統設定開啟相機權限。',
    ok: '前往設定',
    cancel: '取消'
  }).onOk(async () => {
    await BarcodeScanner.openSettings()
  })

  throw new Error('Camera permission not granted')
}

async function onScan() {
  loading.value = true
  try {
    // Web：如果你有做 polyfill（import 'barcode-detector/polyfill'）這邊也能跑 :contentReference[oaicite:7]{index=7}
    // Native：用 MLKit ready-to-use 掃描 UI
    if (!Capacitor.isNativePlatform()) {
      Notify.create({ type: 'info', message: '目前在 Web 環境，請確認已加入 barcode-detector polyfill。' })
    }

    await ensurePermissionOrThrow()

    const { barcodes } = await BarcodeScanner.scan({
      // 你可以只掃 QR：formats: [BarcodeFormat.QrCode],
      // 或同時支援多種條碼格式
      formats: [
        BarcodeFormat.QrCode,
        BarcodeFormat.Ean13,
        BarcodeFormat.Ean8,
        BarcodeFormat.Code128,
        BarcodeFormat.Code39,
        BarcodeFormat.UpcA,
        BarcodeFormat.UpcE
      ],
      autoZoom: true
    })

    const first: Barcode | undefined = barcodes?.[0]
    const value = (first as any)?.rawValue ?? (first as any)?.displayValue ?? ''
    resultText.value = value || JSON.stringify(first ?? {}, null, 2)

    if (!value) {
      Notify.create({ type: 'warning', message: '有掃到條碼，但取不到內容（請看輸出欄位 rawValue / displayValue）' })
    }
  } catch (err: any) {
    // 使用者取消也會進 catch（屬正常）
    Notify.create({ type: 'negative', message: err?.message ?? String(err) })
  } finally {
    loading.value = false
  }
}
</script>
