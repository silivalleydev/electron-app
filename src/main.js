const { app, BrowserWindow, ipcMain, desktopCapturer } = require('electron') 
const path = require('path') 
const { SEND_MAIN_PING } =require('./constants')
const {takeScreenshot} = require("electron-screencapture");
const fs = require('fs')

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
    var _this = this;
    this.callback = callback;
    imageFormat = imageFormat || 'image/jpeg';
    
    this.handleStream = (stream) => {
        // Create hidden video tag
        var video = document.createElement('video');
        video.style.cssText = 'position:absolute;top:-10000px;left:-10000px;';
        // Event connected to stream
        video.onloadedmetadata = function () {
            // Set video ORIGINAL height (screenshot)
            video.style.height = this.videoHeight + 'px'; // videoHeight
            video.style.width = this.videoWidth + 'px'; // videoWidth

            video.play();

            // Create canvas
            var canvas = document.createElement('canvas');
            canvas.width = this.videoWidth;
            canvas.height = this.videoHeight;
            var ctx = canvas.getContext('2d');
            // Draw video on canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            if (_this.callback) {
                // Save screenshot to jpg - base64
                _this.callback(canvas.toDataURL(imageFormat));
            } else {
                console.log('Need callback!');
            }

            // Remove hidden video tag
            video.remove();

            try {
                // Destroy connect to stream
                stream.getTracks()[0].stop();
            } catch (e) {}
        }

        video.srcObject = stream;
        document.body.appendChild(video);
    };

    this.handleError = function(e) {
        console.log(e);
    };

    desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
        console.log(sources);
        
        for (const source of sources) {
            // Filter: main screen
            if (source.name === document.title) {
                try{
                    const stream = await navigator.mediaDevices.getUserMedia({
                        audio: false,
                        video: {
                            mandatory: {
                                chromeMediaSource: 'desktop',
                                chromeMediaSourceId: source.id,
                                minWidth: 1280,
                                maxWidth: 4000,
                                minHeight: 720,
                                maxHeight: 4000
                            }
                        }
                    });

                    _this.handleStream(stream);
                } catch (e) {
                    _this.handleError(e);
                }
            }
        }
    });
}
ipcMain.on('popupPosition',async (event, arg) => {
  takeScreenshot({x: 0, y: 0, width: 800, height: 600}).then(result => {
    console.log(result);
  });
})
app.whenReady().then(() => { 
  createWindow();
  setInterval(()=>{
    console.log(`Capturing Count: ${0}`)
    //start capturing the window
    win.webContents.capturePage().then(image => 
    {
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