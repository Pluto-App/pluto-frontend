const { app, BrowserWindow, ipcMain, protocol, screen, Menu, dialog, systemPreferences } = require('electron')
const path = require('path')
const isDev = require('electron-is-dev');
const url = require('url')
const robot = require('robotjs');
const { windowManager } = require("node-window-manager");

const ffi = require('ffi-napi');
const { autoUpdater } = require('electron-updater');

if (isDev) {
  require('electron-reload')
}

let user32;
let winurl;

let mainWindow
let videoCallWindow

let initScreenShareWindow
let screenShareContainerWindow
let screenShareControlsWindow

let settingsPage

const isWindows = process.platform === 'win32'
const isMac = process.platform === "darwin";

const activeWin = require('active-win');
const runApplescript = require('run-applescript');

const minWidth = 350;
const minHeight = 475;

const robotKeyMap = {
  'arrowup'     : 'up',
  'arrowdown'   : 'down',
  'arrowleft'   : 'left',
  'arrowright'  : 'right',
  'backspace'   : 'backspace',
  'enter'       : 'enter',
  ' '           : 'space',
  'control'     : 'control',
  'tab'         : 'tab',
  'shift'       : 'shift',
  'alt'         : 'alt',
  'command'     : 'command'
};

const robotMods = ['shift','control','alt'];
var currentMods = [];
var primaryDisplay;
var sWidth;
var sHeight;
var compactVideoWidth = 170;
var previousVideoBounds;
var scaleFactor = 1;

if (isWindows) {
  user32 = new ffi.Library('User32.dll', {
    GetForegroundWindow: ['pointer', []]
  });

  var _path;

  if (isDev) 
    _path = path.join(app.getAppPath(), 'src/dlls/BrowserURLs.dll');
  else
    _path = path.join(app.getAppPath(), '..', 'src/dlls/BrowserURLs.dll');

  winurl = new ffi.Library(_path, {
    FetchChromeURL: ['string', ['pointer']],
    FetchFirefoxURL: ['string', ['pointer']],
    FetchEdgeURL: ['string', ['pointer']]
  });

}

async function getTabUrl(activeWinInfo){

  var url = activeWinInfo ? activeWinInfo.url : undefined;

  if(activeWinInfo && !url) {
    
    if(activeWinInfo.platform == 'macos') {

      if(activeWinInfo.owner.bundleId == 'com.google.Chrome') {
      
        url = await runApplescript('tell application "Google Chrome" to return URL of active tab of front window');
     
      } else if(activeWinInfo.owner.bundleId == 'com.apple.Safari') {
        
        url = await runApplescript('tell app "Safari" to get URL of front document');
      }

    } else if (activeWinInfo.platform == 'windows') {
      
      var activeWindowHandle = user32.GetForegroundWindow();

      if(activeWinInfo.owner.name == 'chrome.exe') {
        
        url = winurl.FetchChromeURL(activeWindowHandle);

      } else if(activeWinInfo.owner.name == 'firefox.exe'){

        url = winurl.FetchFirefoxURL(activeWindowHandle);
      }
    
      url = url == 'null' ? undefined : url;

      if(url){
        if (!/^https?:\/\//i.test(url)) {
            url = 'http://' + url;
        }
      }
    }
  }

  return url;
}

async function getMediaAccess() {

  if(systemPreferences.getMediaAccessStatus('screen') != 'granted')
    await systemPreferences.askForMediaAccess('screen')

  if(systemPreferences.getMediaAccessStatus('camera') != 'granted')
    await systemPreferences.askForMediaAccess('camera');

  if(systemPreferences.getMediaAccessStatus('microphone') != 'granted')
    await systemPreferences.askForMediaAccess('microphone')

  if(isDev) {
    console.log('screen access: ' + systemPreferences.getMediaAccessStatus('screen'));
    console.log('camera access: ' + systemPreferences.getMediaAccessStatus('camera'));
    console.log('microphone access: ' + systemPreferences.getMediaAccessStatus('microphone'));
  }
}

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
      plugins: true,
      enableRemoteModule: true
    }
  })

  mainWindow.setMenu(null);

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
  }

  mainWindow.on('closed', () => {
    // Close all windows.
    var windows = BrowserWindow.getAllWindows();
    windows.forEach(x => x.close());

  });

  primaryDisplay = screen.getPrimaryDisplay();
  sWidth = primaryDisplay.bounds.width;
  sHeight = primaryDisplay.bounds.height;

  if(isWindows)
    scaleFactor = primaryDisplay.scaleFactor;

  if(isMac)
    getMediaAccess();

  ipcMain.on('active-win', async (event, arg) => {

    const activeWinInfo = await activeWin()
    
    if(activeWinInfo && activeWinInfo.owner && activeWinInfo.owner.name){
      
      activeWinInfo.url = await getTabUrl(activeWinInfo);
      event.returnValue = activeWinInfo

    } else {
      event.returnValue = "None"
    }
  })

  ipcMain.on('logout', (event, arg) => {
    mainWindow.webContents.send('logout', {});
  })

  ipcMain.on('exit-user-call', (event, room_id) => {
    mainWindow.webContents.send('exitUserCall', room_id);
  })

  ipcMain.on('resize-login', (event, arg) => {
    mainWindow.setMinimumSize(minWidth, minHeight);
    mainWindow.setSize(minWidth, minHeight);
  })

  ipcMain.on('resize-normal', (event, arg) => {
    mainWindow.setSize(minWidth, 690);
    mainWindow.setMinimumSize(minWidth, 690);
    mainWindow.center();
  })

  ipcMain.on('media-access', async (event, arg) => {


  })

  ipcMain.on('refresh-app', async (event, arg) => {
    
    mainWindow.webContents.send('refresh', {});
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

    if (settingsPage) {
      settingsPage.close();
    }

    settingsPage = new BrowserWindow({
      show: true,
      width: 900,
      height: sHeight,
      minHeight: 500,
      minWidth: 400,
      frame: false,
      titleBarStyle: 'hiddenInset',
      webPreferences: {
        nodeIntegration: true,
        plugins: true,
        enableRemoteModule: true
      }
    })

    settingsPage.setMenu(null);
    settingsPage.setAlwaysOnTop(true, 'screen');
   
    const settingsUrl = url.format({
      pathname: path.join(__dirname, '../build/index.html'),
      hash: '/settings',
      protocol: 'file:',
      slashes: true
    })

    settingsPage.loadURL(isDev ? process.env.ELECTRON_START_URL + '#/settings' : settingsUrl);
    settingsPage.on('closed', () => {
      settingsPage = undefined;
      mainWindow.webContents.send('refresh', {});
    })

    // here we can send the data to the new window
    settingsPage.webContents.on('did-finish-load', () => {
      settingsPage.webContents.send('data', data);
    });

    if (isDev) {
       settingsPage.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
      if (settingsPage) {
        settingsPage.close();
      }
    })
  });

  ipcMain.on('init-video-call-window', (event, data) => {

    if (videoCallWindow) {
      try{
        videoCallWindow.close();
      } catch (error) {
        console.error(error);
      }
    }

    // create the window
    videoCallWindow = new BrowserWindow({
      show: true,
      width: compactVideoWidth,
      height: 130,
      resizable: false,
      frame: false,
      title: "VideoWindow",
      alwaysOnTop: true,
      x: sWidth - 230,
      y: sHeight - 200,
      maximizable: false,
      webPreferences: {
        nodeIntegration: true,
        plugins: true,
        enableRemoteModule: true
      }
    })

    videoCallWindow.setAlwaysOnTop(true, 'pop-up-menu');
    videoCallWindow.setMenu(null);

    const videoUrl = url.format({
      pathname: path.join(__dirname, '../build/index.html'),
      hash: '/video-call',
      protocol: 'file:',
      slashes: true
    })

    videoCallWindow.loadURL(isDev ? process.env.ELECTRON_START_URL + '#/video-call' : videoUrl);

    videoCallWindow.on('closed', () => {

       try{
          if(initScreenShareWindow)
            initScreenShareWindow.close();

          if(screenShareControlsWindow)
            screenShareControlsWindow.close();

        } catch (error) {
          console.error(error);
        }

        videoCallWindow = undefined;
    })

    if (isDev) {
       videoCallWindow.webContents.openDevTools();
    }
  });

  ipcMain.on('expand-video-call-window', (event, data) => {

    if (videoCallWindow) {
      previousVideoBounds = videoCallWindow.getBounds();
      videoCallWindow.setPosition(0,0);
      videoCallWindow.setResizable(true);
      videoCallWindow.setSize(sWidth - 100, sHeight - 100);
      videoCallWindow.setMinimumSize(800, 600);
      videoCallWindow.setAlwaysOnTop(false);
      videoCallWindow.center();
    }
  });

  ipcMain.on('collapse-video-call-window', (event, height) => {

    if (videoCallWindow) {
      
      videoCallWindow.setMinimumSize(compactVideoWidth, height);
      videoCallWindow.setBounds({
        ...previousVideoBounds,
        height: height
      })

      videoCallWindow.setResizable(false);
      videoCallWindow.setAlwaysOnTop(true,'pop-up-menu');
    }
  });

  ipcMain.on('set-video-player-height', (event, height) => {

    if(videoCallWindow){
      
      if(height > (sHeight - 125))
        height = sHeight - 125;

      var resizeDisabled = videoCallWindow.isResizable() == true;

      var bounds = videoCallWindow.getBounds();
      videoCallWindow.setMinimumSize(videoCallWindow.getSize()[0], height);
      
      var newY = bounds.y;

      if(height > bounds.height){

        newY = bounds.y - (height - bounds.height);
    
      } else {

        newY = bounds.y + (bounds.height - height);
      }

      var newBounds = {
        ...bounds,
        height: height,
        y: newY
      };

      videoCallWindow.setBounds(newBounds);
    }
  })

  ipcMain.on('init-screenshare', (event, arg) => {

    if(initScreenShareWindow){
      try{
        initScreenShareWindow.close();
      } catch (error) {
        console.error(error);
      }
    }

    initScreenShareWindow = new BrowserWindow({
        width: 650,
        height: 650,
        frame: true,
        title: "ScreenShare",
        resizable: false,
        webPreferences: {
          nodeIntegration: true,
          plugins: true,
          enableRemoteModule: true
        }
    });

    initScreenShareWindow.setMenu(null);

    const screenShareWindowUrl = url.format({
      pathname: path.join(__dirname, '../build/index.html'),
      hash: '/init-screenshare',
      protocol: 'file:',
      slashes: true
    });

    initScreenShareWindow.loadURL(isDev ? process.env.ELECTRON_START_URL + '#/init-screenshare' : screenShareWindowUrl);

    initScreenShareWindow.on('closed', () => {
      initScreenShareWindow = undefined;
    })

    if (isDev) {
      // initScreenShareWindow.webContents.openDevTools();
    }
  })

  ipcMain.on('sharing-screen', (event, overlayBounds) => {

    if(initScreenShareWindow) {

      initScreenShareWindow.hide();

      screenShareContainerWindow = new BrowserWindow({
        x: overlayBounds.x,
        y: overlayBounds.y,
        hasShadow: false,
        transparent: true,
        frame: false,
        minimizable: false,
        maximizable: false,
        resizable: false,
        closeable: false,
        alwaysOnTop: true,
        focusable: false,
        enableLargerThanScreen: true,
        webPreferences: {
          nodeIntegration: true,
          plugins: true,
          enableRemoteModule: true
        },
        show: false
      });

      const screenshareContainerUrl = url.format({
        pathname: path.join(__dirname, '../build/index.html'),
        hash: '/screenshare-container',
        protocol: 'file:',
        slashes: true
      })

      screenShareContainerWindow.setVisibleOnAllWorkspaces(true);
      screenShareContainerWindow.loadURL(isDev ? process.env.ELECTRON_START_URL + '#/screenshare-container' : screenshareContainerUrl);
      screenShareContainerWindow.setIgnoreMouseEvents(true);
      screenShareContainerWindow.setSize(overlayBounds.width, overlayBounds.height);
      screenShareContainerWindow.setAlwaysOnTop(true,'pop-up-menu');
      screenShareContainerWindow.setVisibleOnAllWorkspaces(true, {visibleOnFullScreen: true});

      app.dock && app.dock.hide();
      screenShareContainerWindow.show();
      app.dock && app.dock.show();

      screenShareContainerWindow.on('closed', () => {
        screenShareContainerWindow = undefined;
      })

      if (isDev) {
       
        screenShareContainerWindow.webContents.openDevTools();
      }

      // ScreenShare Controls
      let windowWidth = 370;
      let windowHeight = 80;

      screenShareControlsWindow = new BrowserWindow({
        width: windowWidth,
        height: windowHeight,
        x: sWidth/2 - windowWidth/2,
        y: sHeight - 80,
        movable: true,
        minimizable: false,
        maximizable: false,
        resizable: false,
        titleBarStyle: 'hidden',
        title: "ScreenShare Controls",
        frame: false,
        trafficLightPosition: { x: -100, y: 0 },
        webPreferences: {
          nodeIntegration: true,
          plugins: true,
          enableRemoteModule: true
        }
      })

      screenShareControlsWindow.setVisibleOnAllWorkspaces(true);
      screenShareControlsWindow.setMenu(null);
      screenShareControlsWindow.setAlwaysOnTop(true,'pop-up-menu');

      const screenShareControlsUrl = url.format({
        pathname: path.join(__dirname, '../build/index.html'),
        hash: '/screenshare-controls',
        protocol: 'file:',
        slashes: true
      })

      screenShareControlsWindow.loadURL(isDev ? process.env.ELECTRON_START_URL + '#/screenshare-controls'  : screenShareControlsUrl);

      screenShareControlsWindow.on('closed', () => {

        screenShareControlsWindow = undefined;

        if(initScreenShareWindow)
          initScreenShareWindow.close();
        if(screenShareContainerWindow)
          screenShareContainerWindow.close();
      
      })

      if (isDev) {
        screenShareControlsWindow.webContents.openDevTools();
      }
    }
  })

  ipcMain.on('update-screenshare-container-bounds', (event, overlayBounds) => {

    if(screenShareContainerWindow){

      screenShareContainerWindow.setBounds(overlayBounds);
    }
  })

  ipcMain.on('stop-screenshare', (event, arg) => {

    videoCallWindow.webContents.send('stop-screenshare', {});
    try{

      if(initScreenShareWindow)
        initScreenShareWindow.close();  

      if(screenShareControlsWindow)
        screenShareControlsWindow.close();

    } catch (error) {
      console.error(error);
    }
  })

  ipcMain.on('screen-size', async (event, arg) => {

      event.returnValue = primaryDisplay.size;
  })

  ipcMain.on('screenshare-source-bounds', async (event, sourceInfo) => {

    var [sourceType, sourceId] = sourceInfo.split(':');
    var overlayBounds;
              
    if(sourceType == 'screen'){
      
      overlayBounds = {
        x: 0, y: 0, width: sWidth, height: sHeight
      }
    
    } else {

      overlayBounds = windowManager.getWindows().find(o => o.id == sourceId).getBounds()
    }

      event.returnValue = overlayBounds;
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

  ipcMain.on('emit-click', async (event, arg) => {

    originalPos = robot.getMousePos();
    var screenShareBounds = screenShareContainerWindow.getBounds();

    robot.moveMouse((screenShareBounds.x + arg.cursor.x) * scaleFactor, (screenShareBounds.y + arg.cursor.y) * scaleFactor);
    robot.mouseClick();
    robot.moveMouse(originalPos.x, originalPos.y);

  })

  ipcMain.on('emit-right-click', async (event, arg) => {

    console.log('right click!');

    originalPos = robot.getMousePos();
    var screenShareBounds = screenShareContainerWindow.getBounds();

    robot.moveMouse((screenShareBounds.x + arg.cursor.x) * scaleFactor, (screenShareBounds.y + arg.cursor.y) * scaleFactor);
    robot.mouseClick('right');
    robot.moveMouse(originalPos.x, originalPos.y);

  })

  ipcMain.on('emit-scroll', async (event, arg) => {

    originalPos = robot.getMousePos();
    var screenShareBounds = screenShareContainerWindow.getBounds();

    robot.moveMouse((screenShareBounds.x + arg.cursor.x) * scaleFactor, (screenShareBounds.y + arg.cursor.y) * scaleFactor);

    switch(arg.event.direction) {
      case 'up':
        robot.scrollMouse(0, -5);
        break;
      case 'down':
        robot.scrollMouse(0, 5);
        break;
      default:
        // code block
    }
    // robot.moveMouse(originalPos.x, originalPos.y);
  })

  ipcMain.on('emit-drag', async (event, arg) => {

    originalPos = robot.getMousePos();
    var screenShareBounds = screenShareContainerWindow.getBounds();

    robot.moveMouse((screenShareBounds.x + arg.event.start_x) * scaleFactor, (screenShareBounds.y + arg.event.start_y) * scaleFactor);
    robot.mouseToggle("down");
    robot.dragMouse((screenShareBounds.x + arg.cursor.x) * scaleFactor, (screenShareBounds.y + arg.cursor.y) * scaleFactor);
    robot.mouseToggle("up");
    
    robot.moveMouse(originalPos.x, originalPos.y);
  })

  ipcMain.on('emit-mousedown', async (event, arg) => {

    originalPos = robot.getMousePos();
    var screenShareBounds = screenShareContainerWindow.getBounds();

    robot.moveMouse((screenShareBounds.x + arg.cursor.x) * scaleFactor, (screenShareBounds.y + arg.cursor.y) * scaleFactor);
    robot.mouseToggle("down");
    //robot.moveMouse(originalPos.x, originalPos.y);

  })

  ipcMain.on('emit-mouseup', async (event, arg) => {

    originalPos = robot.getMousePos();
    var screenShareBounds = screenShareContainerWindow.getBounds();

    robot.moveMouse((screenShareBounds.x + arg.cursor.x) * scaleFactor, (screenShareBounds.y + arg.cursor.y) * scaleFactor);
    robot.mouseToggle("up"); 
    //robot.moveMouse(originalPos.x, originalPos.y);
  })


  //////////////////////////////////////////////////////////////////////
  // Use attributes from javascript keyboard event to fetch robotMods //
  //////////////////////////////////////////////////////////////////////
  ipcMain.on('emit-key', async (event, arg) => {

    var rawKey = arg.event.key.toLowerCase();
    var key = robotKeyMap[rawKey] || arg.event.key

    if(robotMods.includes(key)){
      
      if(arg.event.type == 'keyup'){

        if(currentMods.indexOf(key) != -1)
          currentMods.splice(currentMods.indexOf(key), 1);

        robot.keyToggle(key,'up');
      
      } else if(arg.event.type == 'keydown'){

        if(currentMods.indexOf(key) == -1)
          currentMods.push(key)

        robot.keyToggle(key,'down');
      }

    }  else if(arg.event.type == 'keydown'){

      if(Object.keys(robotKeyMap).includes(rawKey)){

        robot.keyTap(key, currentMods);
      
      } else {
        if(currentMods.includes('control')){

          robot.keyTap(key.toLowerCase(), currentMods);

        } else {

          robot.typeString(key);
        }
      }
    }
  })
}

///////////////////
// Auto upadater //
///////////////////
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

autoUpdater.logger = require("electron-log")
autoUpdater.logger.transports.file.level = "info";

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox(mainWindow, {message: 'A new update has been downloaded. Restart the app to install.'});
})

app.on('ready', () => {
  //autoUpdater.checkForUpdates();
  autoUpdater.checkForUpdatesAndNotify();
  createWindow();
})

app.on('window-all-closed', () => {
  // if (process.platform !== 'darwin') {
  //   app.quit()
  // }

  app.quit()
})

app.on('activate', () => {
  if (mainWindow === null) {
    Menu.setApplicationMenu(menu);
    createWindow()
  }
})

app.setLoginItemSettings({
  openAtLogin: true
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