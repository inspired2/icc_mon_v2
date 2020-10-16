import * as main from "./background.js";
export default [
  {
    label: "Меню",
    submenu: [
      {
        label: "Конвертер",
        click: () => {
          main.createConverterWin(null, { url: "converter" });
        }
      },
      {
        label: "Настройки",
        click: async () => {
          const win = main.win;
          if (!win) {
            await main.createWindow().then(() => {
              win.webContents.on("did-finish-load", () => {
                win.webContents.send("openSettings");
              });
            });
          } else win.webContents.send("openSettings");
        }
      },
      { label: "Перезагрузить приложение", click: main.reloadApp },
      {
        label: "Cвернуть",
        click: (e, win) => {
          win.hide();
        }
      },
      {
        label: "Выход",
        click: (e, win) => {
          if (win == main.win) {
            main.win.removeListener("close", main.winCloseHandler);
            main.startQuitSequence();
          } else win.hide();
        }
      },
      { label: "Консоль", role: "toggleDevTools" }
    ]
  }
];
