import { app, BrowserWindow, ipcMain } from "electron";
import { autoUpdater } from "electron-updater";
import log from "electron-log";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

// needed in case process is undefined under Linux
const platform = process.platform || os.platform();
const currentDir = fileURLToPath(new URL(".", import.meta.url));

let mainWindow: BrowserWindow | undefined;

// 防止重複註冊 updater 事件（例如 macOS activate 重建視窗）
let autoUpdateInited = false;

function setupAutoUpdate() {
  // ✅ 只在打包後才啟用，DEV 不跑（不然你會一直覺得怪怪的）
  if (!app.isPackaged) return;
  if (autoUpdateInited) return;
  autoUpdateInited = true;

  // log（排錯超重要）
  autoUpdater.logger = log;
  (autoUpdater.logger as any).transports.file.level = "info";

  // 背景下載
  autoUpdater.autoDownload = true;

  autoUpdater.on("checking-for-update", () => {
    mainWindow?.webContents.send("updater:checking");
  });

  autoUpdater.on("update-available", (info) => {
    mainWindow?.webContents.send("updater:available", info);
  });

  autoUpdater.on("update-not-available", (info) => {
    mainWindow?.webContents.send("updater:not-available", info);
  });

  autoUpdater.on("download-progress", (p) => {
    mainWindow?.webContents.send("updater:progress", {
      percent: p.percent,
      transferred: p.transferred,
      total: p.total,
      bytesPerSecond: p.bytesPerSecond,
    });
  });

  // ✅ 下載完成 → 提示重啟套用更新（你前端接到這個事件後跳 Dialog）
  autoUpdater.on("update-downloaded", (info) => {
    mainWindow?.webContents.send("updater:downloaded", info);
  });

  autoUpdater.on("error", (err) => {
    mainWindow?.webContents.send("updater:error", String(err));
  });

  // ✅ 啟動就檢查（背景下載）
  autoUpdater.checkForUpdates();
}

// 前端按「重啟更新」時呼叫
ipcMain.handle("updater:quitAndInstall", () => {
  autoUpdater.quitAndInstall();
});

async function createWindow() {
  mainWindow = new BrowserWindow({
    icon: path.resolve(currentDir, "icons/icon.png"),
    width: 1000,
    height: 600,
    useContentSize: true,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      preload: path.resolve(
        currentDir,
        path.join(
          process.env.QUASAR_ELECTRON_PRELOAD_FOLDER!,
          "electron-preload" + process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION,
        ),
      ),
    },
  });

  if (process.env.DEV) {
    await mainWindow.loadURL(process.env.APP_URL!);
  } else {
    await mainWindow.loadFile("index.html");
  }

  if (process.env.DEBUGGING) {
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.webContents.on("devtools-opened", () => {
      mainWindow?.webContents.closeDevTools();
    });
  }

  mainWindow.on("closed", () => {
    mainWindow = undefined;
  });
}

void app.whenReady().then(async () => {
  await createWindow();
  setupAutoUpdate(); // ✅ 加在這裡：App ready + 視窗建立後啟動檢查更新
});

app.on("window-all-closed", () => {
  if (platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === undefined) {
    void createWindow();
    // 這裡不用再 setupAutoUpdate()（因為我們有 autoUpdateInited 防重複）
  }
});
