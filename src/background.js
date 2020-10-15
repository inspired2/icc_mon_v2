"use strict";
import {
  app,
  protocol,
  BrowserWindow,
  ipcMain,
  dialog,
  Menu,
  Tray,
  nativeImage
} from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
import menuTemplate from "./windowMenu.js";
// eslint-disable-next-line no-unused-vars
import taskManager from "../workers/taskManager";
//export const sharp = import("sharp");

const isDevelopment = process.env.NODE_ENV !== "production";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
export let win;
export let converterWin;
export { app, ipcMain };
export const windows = [];

let tray;

function identifyWinInstance(eventObj) {
  for (let i = 0; i < windows.length; i++) {
    if (windows[i].webContents === eventObj.sender) {
      return windows[i];
    }
  }
}

const mainMenu = new Menu.buildFromTemplate(menuTemplate);

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } }
]);
ipcMain.on("startReload", () => {
  console.log("settings canged =>> restarting app");
  reloadApp();
});

ipcMain.on("openDialog", async (event, data) => {
  const sender = identifyWinInstance(event);
  const path = dialog.showOpenDialog(sender, data);
  await path.then(e => event.sender.send("pathBrowsed", e.filePaths));
});

ipcMain.on("openConverterWin", createConverterWin);

// here we can send the data to the new window
// settings.webContents.on("did-finish-load", () => {
//   settings.webContents.send("data", data);
// });

export function createConverterWin(event, data) {
  if (converterWin) converterWin.show();
  else {
    converterWin = new BrowserWindow(
      Object.assign(
        {
          show: true,
          webPreferences: {
            nodeIntegration: true,
            plugins: true
          }
        },
        data.url
      )
    );
    windows.push(converterWin);
    if (process.env.WEBPACK_DEV_SERVER_URL) {
      // Load the url of the dev server if in development mode
      converterWin.loadURL(
        process.env.WEBPACK_DEV_SERVER_URL + `${data.url}.html`
      );
      if (!process.env.IS_TEST) converterWin.webContents.openDevTools();
    } else {
      converterWin.loadURL(`app://./${data.url}.html`);
    }

    converterWin.on("closed", () => {
      windows.splice(windows.indexOf(converterWin), 1);
      converterWin = null;
    });
  }
}

export function reloadApp() {
  app.relaunch();
  app.quit();
}
export async function createWindow() {
  if (win) win.show();
  createTray();
  // Create the browser window.
  win = new BrowserWindow({
    width: 1400,
    height: 600,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: true,
      nodeIntegrationInWorker: true
    }
  });
  windows.push(win);
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }
  win.on("close", winCloseHandler);
  win.on("closed", () => {
    windows.splice(windows.indexOf(win), 1);
    win = null;
  });
  Menu.setApplicationMenu(mainMenu);
}
// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", data => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
export function winCloseHandler(event) {
  event.preventDefault();
  win.hide();
}

function createTray() {
  if (!tray) {
    const icon = nativeImage.createFromPath(
      "/home/alex/Документы/icc_mon_v2/src/assets/icon.png"
    );
    tray = new Tray(icon);
    tray.on("click", () => {
      windows.forEach(win => (win.isVisible() ? win.hide() : win.show()));
    });
  }
}
export function startQuitSequence() {
  ipcMain.emit("quit");
}
