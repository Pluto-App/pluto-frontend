const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const isDev = require('electron-is-dev');

if (isDev) {
  require('electron-reload')
}

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 315,
    height: 320,
    titleBarStyle: 'hiddenInset',
    frame: false,
    webPreferences: {
      nodeIntegration: true
    }
  })

  mainWindow.loadURL(isDev ? process.env.ELECTRON_START_URL : `file://${path.join(__dirname, '../build/index.html')}`);

  if (isDev) {
    // Open the DevTools.
    // BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  });

  ipcMain.on('resize-login', (event, arg) => {
    mainWindow.setSize(315, 320)
  })

  ipcMain.on('resize-normal', (event, arg) => {
    mainWindow.setSize(315, 606)
  })

}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})