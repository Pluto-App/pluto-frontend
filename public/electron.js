const { app, BrowserWindow, ipcMain, protocol, screen, Menu } = require('electron')
const path = require('path')
const isDev = require('electron-is-dev');
const url = require('url')
const { PythonShell } = require( 'python-shell');
const robot = require('robotjs');

if (isDev) {
  require('electron-reload')
}

let mainWindow

let videoCallWindow

let initScreenShareWindow
let streamScreenShareWindow
let screenShareContainerWindow
let screenShareControlsWindow

let settings_page

const isWindows = process.platform === 'win32'
const isMac = process.platform === "darwin";

const activeWin = require('active-win');
const runApplescript = require('run-applescript');

// TODO Now we can add external window for settings.
// TODO Add support for App Signing.

const minWidth = 330;
const minHeight = 500;

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
var scaleFactor = 1;

async function runPythonScript(py_script){

  return new Promise(function (resolve, reject) {
    PythonShell.run(py_script, null, function (err, results) {

      if (err) throw err;
      resolve(results[0]);
    });
  })
}

async function getTabUrl (activeWinInfo){

  var url = activeWinInfo ? activeWinInfo.url : undefined;

  if(activeWinInfo && !url) {
    
    if(activeWinInfo.platform == 'macos') {

      if(activeWinInfo.owner.bundleId == 'com.google.Chrome') {
      
        url = await runApplescript('tell application "Google Chrome" to return URL of active tab of front window');
     
      } else if(activeWinInfo.owner.bundleId == 'com.apple.Safari') {
        
        url = await runApplescript('tell app "Safari" to get URL of front document');
      }

    } else if (activeWinInfo.platform == 'windows') {

      var py_script;

      if (isDev) 
        py_script = path.join(app.getAppPath(), 'src/scripts/windows_chrome_active_tab_url.py');
      else
        py_script = path.join(app.getAppPath(), '..', 'src/scripts/windows_chrome_active_tab_url.py');

      url = await runPythonScript(py_script);
      url = url == 'null' ? undefined : url;
    }
  }

  return url;
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

  if(isWindows)
    scaleFactor = primaryDisplay.scaleFactor;

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
    mainWindow.loadURL(isDev ? process.env.ELECTRON_START_URL : startPageUrl);
    mainWindow.setSize(minWidth, minHeight)
  })

  ipcMain.on('resize-login', (event, arg) => {
    mainWindow.setSize(minWidth, minHeight)
  })

  ipcMain.on('resize-normal', (event, arg) => {
    mainWindow.setSize(minWidth, 700)
    mainWindow.center();
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
        plugins: true,
        enableRemoteModule: true
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
      settings_page = undefined;
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

  ipcMain.on('init-video-call-window', (event, data) => {

    if (videoCallWindow) {
      try{
        videoCallWindow.close();
      } catch (error) {
        console.error(error);
      }
    }

    let display = screen.getPrimaryDisplay();
    let swidth = display.bounds.width;
    let sheight = display.bounds.height;

    // create the window
    videoCallWindow = new BrowserWindow({
      show: true,
      width: 200,
      height: 150,
      resizable: false,
      frame: false,
      title: "VideoWindow",
      alwaysOnTop: true,
      x: swidth - 270,
      y: sheight - 870,
      webPreferences: {
        nodeIntegration: true,
        plugins: true,
        enableRemoteModule: true
      }
    })

    videoCallWindow.setAlwaysOnTop(true, 'screen');
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
          if(screenShareControlsWindow)
            screenShareControlsWindow.close();
        } catch (error) {
          console.error(error);
        }

       try{
          if(streamScreenShareWindow)
            streamScreenShareWindow.close();
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
      
      let display = screen.getPrimaryDisplay();
      let swidth = display.bounds.width;
      let sheight = display.bounds.height;

      videoCallWindow.setPosition(0,0);
      videoCallWindow.setSize(swidth - 100, sheight - 100);
      videoCallWindow.setResizable(true);
    }
  });

  ipcMain.on('collapse-video-call-window', (event, height) => {
    if (videoCallWindow) {

      let display = screen.getPrimaryDisplay();
      let swidth = display.bounds.width;
      let sheight = display.bounds.height;

      videoCallWindow.setPosition(swidth - 270,sheight - 870);
      videoCallWindow.setResizable(false);
      videoCallWindow.setSize(200, height);
    }
  });

  ipcMain.on('set-video-player-height', (event, height) => {
    if(videoCallWindow)
      videoCallWindow.setSize(videoCallWindow.getSize()[0], height);
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

  ipcMain.on('stream-screenshare', (event, arg) => {

    let swidth = primaryDisplay.bounds.width;
    let sheight = primaryDisplay.bounds.height;

    if(streamScreenShareWindow){
      try{
        streamScreenShareWindow.close();
      } catch (error) {
        console.error(error);
      }

      if(videoCallWindow){

        videoCallWindow.setPosition(swidth - 270, sheight - 870)
      }
    }

    streamScreenShareWindow = new BrowserWindow({
        width: 1088,
        height: 720,
        show: false,
        frame: true,
        title: "ScreenShare",
        webPreferences: {
          nodeIntegration: true,
          plugins: true,
          enableRemoteModule: true
        }
    });

    streamScreenShareWindow.setMenu(null);

    const screenShareWindowUrl = url.format({
      pathname: path.join(__dirname, '../build/index.html'),
      hash: '/stream-screenshare',
      protocol: 'file:',
      slashes: true
    });

    streamScreenShareWindow.loadURL(isDev ? process.env.ELECTRON_START_URL + '#/stream-screenshare' : screenShareWindowUrl);

    //streamScreenShareWindow.maximize();
    streamScreenShareWindow.show();

    if (isDev) {
      //streamScreenShareWindow.setSize(500,400);
    }

    streamScreenShareWindow.on('closed', () => {
      streamScreenShareWindow = undefined;
    })

    if (isDev) {
       // streamScreenShareWindow.webContents.openDevTools();
    }

  })

  ipcMain.on('sharing-screen', (event, arg) => {

    if(initScreenShareWindow) {

      // ScreenShare Container
      let workArea = primaryDisplay.bounds;
      let displayWidth = workArea.width;
      let displayHeight = workArea.height;

      initScreenShareWindow.hide();

      screenShareContainerWindow = new BrowserWindow({
        x: 0,
        y: 0,
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
        }
      });

      const screenshareContainerUrl = url.format({
        pathname: path.join(__dirname, '../build/index.html'),
        hash: '/screenshare-container',
        protocol: 'file:',
        slashes: true
      })

      screenShareContainerWindow.loadURL(isDev ? process.env.ELECTRON_START_URL + '#/screenshare-container' : screenshareContainerUrl);
      screenShareContainerWindow.setIgnoreMouseEvents(true);
      screenShareContainerWindow.setSize(displayWidth, displayHeight);

      if (isDev) {
       
        // screenShareContainerWindow.webContents.openDevTools();
      }

      // ScreenShare Controls
      let windowWidth = 460;
      let windowHeight = 80;

      screenShareControlsWindow = new BrowserWindow({
        width: windowWidth,
        height: windowHeight,
        x: displayWidth/2 - windowWidth/2,
        y: displayHeight - 80,
        movable: true,
        minimizable: false,
        maximizable: false,
        resizable: false,
        alwaysOnTop: true,
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

      screenShareControlsWindow.setMenu(null);

      const screenShareControlsUrl = url.format({
        pathname: path.join(__dirname, '../build/index.html'),
        hash: '/screenshare-controls',
        protocol: 'file:',
        slashes: true
      })

      screenShareControlsWindow.loadURL(isDev ? process.env.ELECTRON_START_URL + '#/screenshare-controls'  : screenShareControlsUrl);

      screenShareControlsWindow.on('closed', () => {

        screenShareControlsWindow = undefined;
        try{

            screenShareContainerWindow.close();
            initScreenShareWindow.close();

        } catch (error) {
          console.error(error);
        }
      })

      if (isDev) {
        screenShareControlsWindow.webContents.openDevTools();
      }
    }
  })

  ipcMain.on('stop-screenshare', (event, arg) => {

    try{

        if(screenShareControlsWindow)
          screenShareControlsWindow.close();

        if(streamScreenShareWindow)
          streamScreenShareWindow.close();

      } catch (error) {
        console.error(error);
      }
  })

  ipcMain.on('screen-size', async (event, arg) => {

      event.returnValue = primaryDisplay.size;
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
    robot.moveMouse(arg.cursor.x * scaleFactor, arg.cursor.y * scaleFactor);
    robot.mouseClick();
    robot.moveMouse(originalPos.x, originalPos.y);

  })

  ipcMain.on('emit-scroll', async (event, arg) => {

    originalPos = robot.getMousePos();
    robot.moveMouse(arg.cursor.x * scaleFactor, arg.cursor.y * scaleFactor);

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
    robot.moveMouse(originalPos.x, originalPos.y);
  })

  ipcMain.on('emit-drag', async (event, arg) => {

    originalPos = robot.getMousePos();

    robot.moveMouse(arg.event.start_x * scaleFactor, arg.event.start_y * scaleFactor);
    robot.mouseToggle("down");
    robot.dragMouse(arg.cursor.x * scaleFactor, arg.cursor.y * scaleFactor);
    robot.mouseToggle("up");
    
    robot.moveMouse(originalPos.x, originalPos.y);
  })

  ipcMain.on('emit-mousedown', async (event, arg) => {

    originalPos = robot.getMousePos();
    robot.moveMouse(arg.cursor.x * scaleFactor, arg.cursor.y * scaleFactor);
    robot.mouseToggle("down");
    //robot.moveMouse(originalPos.x, originalPos.y);

  })

  ipcMain.on('emit-mouseup', async (event, arg) => {

    originalPos = robot.getMousePos();
    robot.moveMouse(arg.cursor.x * scaleFactor, arg.cursor.y * scaleFactor);
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