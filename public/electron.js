const { app, BrowserWindow, ipcMain, protocol, screen, Menu } = require('electron')
const path = require('path')
const isDev = require('electron-is-dev');
const url = require('url')

if (isDev) {
  require('electron-reload')
}

let mainWindow
let video_player

const isWindows = process.platform === 'win32'
const isMac = process.platform === "darwin";
const activeWin = require('active-win');

// TODO Now we can add external window for settings.
// TODO Add support for App Signing.

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 315,
    height: 320,
    titleBarStyle: 'hiddenInset',
    title: "MainWindow",
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      plugins: true
    }
  })

  mainWindow.setMenu(null);

  // FIXME Maximize/Minimize Issue.
  // mainWindow.setAlwaysOnTop(true, 'screen');

  const startPageUrl = url.format({
    pathname: path.join(__dirname, '../build/index.html'),
    hash: '/',
    protocol: 'file:',
    slashes: true
  })

  mainWindow.loadURL(isDev ? process.env.ELECTRON_START_URL : startPageUrl);

  if (isDev) {
    // Open the DevTools.
    // BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
    mainWindow.webContents.openDevTools();
    (async () => {
      console.log(await activeWin());
    })();
  }

  mainWindow.on('closed', () => {
    // Close all windows.
    var windows = BrowserWindow.getAllWindows();
    windows.forEach(x => x.close());

  });

  ipcMain.on('resize-login', (event, arg) => {
    mainWindow.setSize(315, 320)
  })

  ipcMain.on('resize-normal', (event, arg) => {
    mainWindow.setSize(315, 606)
  })

  ipcMain.on('close-video', (event, arg) => {
    if (video_player !== null) {
      video_player = null
    }
  })

  ipcMain.on(`display-app-menu`, function (e, args) {
    if (isWindows && mainWindow) {
      menu.popup({
        window: mainWindow,
        x: args.x,
        y: args.y
      });
    }
  });

  ipcMain.on('load-video-window', (event, data) => {

    if (video_player !== null) {
      video_player = null;
    }

    let display = screen.getPrimaryDisplay();
    let swidth = display.bounds.width;
    let sheight = display.bounds.height;

    // create the window
    video_player = new BrowserWindow({
      show: true,
      width: 300,
      height: 220,
      frame: false,
      title: "VideoWindow",
      x: swidth - 310,
      y: sheight - 270,
      webPreferences: {
        nodeIntegration: true,
        plugins: true
      }
    })

    video_player.setAlwaysOnTop(true, 'screen');
    video_player.setMenu(null);

    const videoUrl = url.format({
      pathname: path.join(__dirname, '../build/index.html'),
      hash: '/videocall',
      protocol: 'file:',
      slashes: true
    })

    video_player.loadURL(isDev ? process.env.ELECTRON_START_URL + '#/videocall' : videoUrl);

    video_player.on('closed', () => {
      video_player = null
    })

    // here we can send the data to the new window
    video_player.webContents.on('did-finish-load', () => {
      video_player.webContents.send('data', data);
    });

    // Close the video player window when we 
    // close the main window of the app. 
    mainWindow.on('closed', () => {
      if (video_player !== null) {
        video_player.close();
      }
    })

  });

  var menu = Menu.buildFromTemplate([
    {
      label: 'App ',
      submenu: [
        {
          label: 'Join Team',
          click() {

          }
        },
        {
          label: 'Join Room',
          click() {

          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          click() {

          }
        }
      ],
    },
    {
      label: 'File 📁',
      submenu: [
        {
          label: 'Share File',
          click() {

          }
        },
        {
          label: 'Sync With GCloud',
          click() {

          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          click() {

          }
        }
      ]
    },
    {
      label: 'Refersh 🔄',
      submenu: [
        {
          label: 'Reset',
          click() {

          }
        },
        {
          label: 'Logout',
          click() {

          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          click() {

          }
        }
      ]
    }
  ])
}

app.on('ready', () => {
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    Menu.setApplicationMenu(menu);
    createWindow()
  }
})

// Exit cleanly on request from parent process in development mode.
if (isDev) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}