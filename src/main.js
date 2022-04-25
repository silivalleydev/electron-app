const { app, BrowserWindow, ipcMain, desktopCapturer, systemPreferences, globalShortcut, ipcRenderer } = require('electron') 
const path = require('path') 
const { SEND_MAIN_PING } =require('./constants')
const {takeScreenshot} = require("electron-screencapture");
const fs = require('fs')
const ElectronShortcutCapture = require('electron-shortcut-capture-patch');
const CaptureScreen = require('electron-capture-screen');
const {
  hasScreenCapturePermission,
  openSystemPreferences
} = require('mac-screen-capture-permissions');

let win;
function createWindow () { 
  win = new BrowserWindow({ 
    width: 800, 
    height: 600, 
    webPreferences: { 
      nodeIntegration: true,
      contextIsolation : false
    } 
  }) 
  win.loadURL("http://localhost:3000")
} 
let chwin;
ipcMain.on('openPopup', (event, arg) => {
  chwin = new BrowserWindow({ 
    width: 800, 
    height: 600, 
    webPreferences: { 
      nodeIntegration: true,
      contextIsolation : false
    } 
  }) 
  chwin.loadFile("./public/temp.html")
  console.log("Main.js received a ping!!!")
})

/**
* Create a screenshot of your electron app. You can modify which process to render in the conditional line #61.
* In this case, filtered using the title of the document.
*
* @param callback {Function} callback receives as first parameter the base64 string of the image
* @param imageFormat {String} Format of the image to generate ('image/jpeg' or 'image/png')
**/
function appScreenshot(callback,imageFormat) {
    this.callback = callback;
    imageFormat = imageFormat || 'image/jpeg';

    desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
        console.log(sources);
        
        for (const source of sources) {
            // Filter: main screen
            console.log('jpg??',source.thumbnail)
                try{
                    fs.writeFile(`${source.id}.png`, source.thumbnail.toPNG(), (err) => {
                      if (err) throw err
                      console.log('Image Saved')
                    })
                } catch (e) {
                  console.log(e)
                }
        }
    });
}

ipcMain.on('electron-capture-screen', () => {
  let captureWin = new BrowserWindow({ 
    width: 800, 
    height: 600, 
    webPreferences: { 
      nodeIntegration: true,
      contextIsolation : false
    } 
  }) 
  if (captureWin) {
    return
   }
   const { screen } = require('electron')
   let { width, height } = screen.getPrimaryDisplay().bounds
   captureWin = new BrowserWindow({
    // window    fullscreen, mac     undefined,     false
    fullscreen: true, // win
    width,
    height,
    x: -100,
    y: -100,
    transparent: true,
    frame: false,
    skipTaskbar: true,
    autoHideMenuBar: true,
    movable: false,
    resizable: false,
    enableLargerThanScreen: true, // mac
    hasShadow: false,
   })
   captureWin.setAlwaysOnTop(true, 'screen-saver') // mac
   captureWin.setVisibleOnAllWorkspaces(true) // mac
   captureWin.setFullScreenable(true) // mac
  
   captureWin.loadFile(path.join(__dirname, 'capture.html'))
  
   //    
   // captureWin.openDevTools()
  
   captureWin.on('closed', () => {
    captureWin = null
   })
})
ipcMain.on('desktopCapturer', () => {
  appScreenshot();
})

ipcMain.on('electronShortcutCapture',async (event, arg) => {
  const electronShortcutCapture = new ElectronShortcutCapture({
    multiScreen: true
  });
  console.log('electronShortcutCapture???', electronShortcutCapture)
  // console.log('displays???', electronShortcutCapture.onClipboard((data) => console.log('data??', data)))
  console.log('show???', electronShortcutCapture.captureWins)
  electronShortcutCapture.getScreenSources(1280, 720).then(screens => {
    let screenArray = screens;
    if (!screens) {
      screenArray = [];
    }
    screenArray.forEach((screen, idx) => {
      console.log('getSOurce????', )
      console.log('rs???', screen)
      const buffer = electronShortcutCapture.getSourcePng(screen, 1280, 720);
      fs.writeFile(`thub_${idx}.png`, buffer, (err) => {
        if (err) throw err
        console.log('Image Saved')
      })
    })
  })
})
ipcMain.on('macScreenPermissionCheck', (event) => {
  
  if (process.platform === "darwin" && hasScreenCapturePermission() === false) {
    event.sender.send('macScreenPermissionAlert');
  }
})
ipcMain.on('openSystemPreferences', (event) => {
  openSystemPreferences();
})
app.whenReady().then(() => { 
  createWindow();
  console.log('ACCESS????', systemPreferences.getMediaAccessStatus("screen"));
  console.log('OS??',hasScreenCapturePermission());

  // globalShortcut.register('Esc', () => {
  //     captureScreen.init();
  // });
  // // globalShortcut.register('Esc', () => {
  // //     captureScreen.hide();
  // // });
  // // 获取截图信息, 已写入剪切板
  // captureScreen.on('capture', dataURL => {
  //     console.log(dataURL);
  // });
  setInterval(()=>{
    console.log(`Capturing Count: ${0}`)
    //start capturing the window

    win.webContents.capturePage().then(image => 
    {
      console.log(image.toPNG())
      //writing  image to the disk
          fs.writeFile(`test${0}.png`, image.toPNG(), (err) => {
          if (err) throw err
          console.log('Image Saved')
          })
    })
    }, 10000); //tome in millis
}) 
app.on('window-all-closed', function () { 
  if (process.platform !== 'darwin') app.quit() 
})