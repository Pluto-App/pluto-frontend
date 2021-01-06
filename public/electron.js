const { app, BrowserWindow, ipcMain, protocol, screen, Menu } = require('electron')
const path = require('path')
const isDev = require('electron-is-dev');
const url = require('url')

if (isDev) {
  require('electron-reload')
}

let mainWindow
let video_player
let settings_page

const isWindows = process.platform === 'win32'
const isMac = process.platform === "darwin";
const activeWin = require('active-win');

// TODO Now we can add external window for settings.
// TODO Add support for App Signing.

const minWidth = 315;
const minHeight = 320;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: minWidth,
    height: minHeight,
    minWidth: minWidth,
    minHeight: minHeight,
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

  const settingsUrl = url.format({
    pathname: path.join(__dirname, '../build/index.html'),
    hash: '/user-profile',
    protocol: 'file:',
    slashes: true
  })

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
    console.log(screen.getCursorScreenPoint())
  }

  mainWindow.on('closed', () => {
    // Close all windows.
    var windows = BrowserWindow.getAllWindows();
    windows.forEach(x => x.close());

  });

  ipcMain.on('active-win', async (event, arg) => {
    const activeWinInfo = await activeWin()

    if (activeWinInfo.owner !== undefined && activeWinInfo.owner.name !== undefined)
      event.returnValue = activeWinInfo
    else
      event.returnValue = "None"
  })

  ipcMain.on('logout', (event, arg) => {
    mainWindow.loadURL(isDev ? process.env.ELECTRON_START_URL : startPageUrl);
    mainWindow.setSize(minWidth, minHeight)
  })

  ipcMain.on('resize-login', (event, arg) => {
    mainWindow.setSize(minWidth, minHeight)
  })

  ipcMain.on('resize-normal', (event, arg) => {
    mainWindow.setSize(minWidth, 700)
  })

  ipcMain.on('close-video', (event, arg) => {
    if (video_player !== null) {
      video_player.close()
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

  ipcMain.on(`open-settings`, (events, data) => {
    let display = screen.getPrimaryDisplay();
    let swidth = display.bounds.width;
    let sheight = display.bounds.height;

    settings_page = new BrowserWindow({
      show: true,
      width: 400,
      height: 750,
      frame: false,
      title: "VideoWindow",
      x: swidth / 2,
      y: sheight / 2,
      webPreferences: {
        nodeIntegration: true,
        plugins: true
      }
    })

    settings_page.setAlwaysOnTop(true, 'screen');
    settings_page.setMenu(null);

    const settingsUrl = url.format({
      pathname: path.join(__dirname, '../build/index.html'),
      hash: '/user-profile',
      protocol: 'file:',
      slashes: true
    })

    settings_page.loadURL(isDev ? process.env.ELECTRON_START_URL + '#/user-profile' : settingsUrl);
    settings_page.on('closed', () => {
      settings_page.close()
    })

    // here we can send the data to the new window
    settings_page.webContents.on('did-finish-load', () => {
      settings_page.webContents.send('data', data);
    });

    mainWindow.on('closed', () => {
      if (settings_page !== null) {
        settings_page.close();
      }
    })
  });

  ipcMain.on('load-video-window', (event, data) => {

    if (video_player !== null && video_player) {
      try{
        video_player.close();
      } catch (error) {
        console.error(error);
      }
      
    }

    let display = screen.getPrimaryDisplay();
    let swidth = display.bounds.width;
    let sheight = display.bounds.height;

    // create the window
    video_player = new BrowserWindow({
      show: true,
      width: 200,
      height: 175,
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
      video_player.close()
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

  ipcMain.on('video-resize-normal', (event, arg) => {
    video_player.setSize(200, 175)
  })

  ipcMain.on('screen-share-options', (event, arg) => {
    video_player.setSize(675, 675)
  })


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