const { app, BrowserWindow, ipcMain, desktopCapturer, systemPreferences, globalShortcut, ipcRenderer } = require('electron') 
const path = require('path') 
const { SEND_MAIN_PING } =require('./constants')
const {takeScreenshot} = require("electron-screencapture");
const fs = require('fs')
const fsExtra = require('fs-extra');
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

  desktopCapturer.getSources({ 
    types: ['window', 'screen'],
    thumbnailSize: {
      width: 1280,
      height: 720
    } 
  }).then(async sources => {
      let imageNameList = [];

      // fs.existsSync 디렉토리 존재하는지 확인
      const isExists = fs.existsSync( './capture' );
      if(!isExists ) {
        // fs.mkdirSync 폴더 만드는 것
        fs.mkdirSync( './capture', { recursive: true } );
        setTimeout(() => {
          for (const [idx, source] of sources.entries()) {
              let fileName = `${source.id.startsWith('screen') ? 'screen' : 'image'}_${idx}`;
                        try{
                          //  파일을 생성하는것 <-- 첫번째에는 경로 + 파일명.확장자
                          const pngBuffer = source.thumbnail.toPNG();// Buffer 자료형의 데이터로 이미지를 제공해줌
                          console.log('pngBuffer ==> ', pngBuffer)
                            fs.writeFile(`capture/${fileName}d.png`, pngBuffer, (err) => {
                              if (err) throw err
                              console.log('Image Saved');
                            })

                            // 그 폴더에 있는 파일리스트를 줌
                            const files = fs.readdirSync('./capture', {withFileTypes: true});
                            /**
                             * [
                             *  {
                             *    name: screen_0d.png
                             *  },
                             *  {
                             *    name: screen_2d.png
                             *  },
                             *  {
                             *    name: image_0d.png
                             *  },
                             *  {
                             *    name: image_0d.png
                             *  },
                             *  {
                             *    name: image_1d.png
                             *  },
                             * ]
                             */
                            imageNameList = files.filter(file => file.name.startsWith("screen_")).map(file => `./capture/${file.name}`);
                            /**
                             * ["./capture/screen_0d.png", "./capture/screen_2d.png"]
                             */
                        } catch (e) {
                          console.log(e)
                        }
                }
                setTimeout(() => {
                  const combineImage = require('combine-image');
                  console.log('imageNameList??', imageNameList)
        
                  combineImage(imageNameList)
                    .then((img) => {
                      // Save image as file
                      const isExists = fs.existsSync( './captureFullscreen' );
                      if( !isExists ) {
                          fs.mkdirSync( './captureFullscreen', { recursive: true } );
                          setTimeout(() => {
                            img.write('./captureFullscreen/out.png', () => {
                              console.log('done')
                              // 파일을 읽는 것 <-- 이미지를 버퍼 데이터로 제공해주는것
                              fs.readFile("./captureFullscreen/out.png", function (err, buff) {
                                if (err) throw err;
                                
                                const resultFullScreenBuffer = buff;
                                console.log('풀스크린 결과 버퍼값 =>', resultFullScreenBuffer)
                            });
                            });
                        }, 500)
                      } else {
                        fs.rmdir('./captureFullscreen', { recursive: true }, (err) => {
                          if (err) {
                              throw err;
                          }
                          fs.mkdirSync( './captureFullscreen', { recursive: true });
                          setTimeout(() => {
                              img.write('./captureFullscreen/out.png', () => {
                                console.log('done')
                                fs.readFile("./captureFullscreen/out.png", function (err, buff) {
                                  if (err) throw err;
                                  
                                  const resultFullScreenBuffer = buff;
                                  console.log('풀스크린 결과 버퍼값 =>', resultFullScreenBuffer)
                              });
                              });
                          }, 500)
                        })
                        }
                    });
                }, 500)
        }, 500)
      } else {
        // fs.rmdir 폴더 지워주는 함수
        fs.rmdir('./capture', { recursive: true }, (err) => {
          if (err) {
              throw err;
          }
          fs.mkdirSync( './capture', { recursive: true });
          setTimeout(() => {
            for (const [idx, source] of sources.entries()) {
                let fileName = `${source.id.startsWith('screen') ? 'screen' : 'image'}_${idx}`;
                          try{
                              fs.writeFile(`capture/${fileName}d.png`, source.thumbnail.toPNG(), (err) => {
                                if (err) throw err
                                console.log('Image Saved');
                              })
                              const files = fs.readdirSync('./capture', {withFileTypes: true});
                              imageNameList = files.filter(file => file.name.startsWith("screen_")).map(file => `./capture/${file.name}`)
                          } catch (e) {
                            console.log(e)
                          }
                  }
                  setTimeout(() => {
                    const combineImage = require('combine-image');
                    console.log('imageNameList??', imageNameList)
          
                    combineImage(imageNameList)
                      .then((img) => {
                        // Save image as file
                        const isExists = fs.existsSync( './captureFullscreen' );
                        if( !isExists ) {
                            fs.mkdirSync( './captureFullscreen', { recursive: true } );
                            setTimeout(() => {
                              img.write('./captureFullscreen/out.png', () => {
                                console.log('done')
                                fs.readFile("./captureFullscreen/out.png", function (err, buff) {
                                  if (err) throw err;
                                  
                                  const resultFullScreenBuffer = buff;
                                  console.log('풀스크린 결과 버퍼값 =>', resultFullScreenBuffer)
                              });
                              });
                          }, 500)
                        } else {
                          fs.rmdir('./captureFullscreen', { recursive: true }, (err) => {
                            if (err) {
                                throw err;
                            }
                            fs.mkdirSync( './captureFullscreen', { recursive: true });
                            setTimeout(() => {
                                img.write('./captureFullscreen/out.png', () => {
                                  console.log('done')
                                  fs.readFile("./captureFullscreen/out.png", function (err, buff) {
                                    if (err) throw err;
                                    
                                    const resultFullScreenBuffer = buff;
                                    console.log('풀스크린 결과 버퍼값 =>', resultFullScreenBuffer)
                                });
                                });
                            }, 500)
                          })
                          }
                      });
                  }, 500)
          }, 500)
        });
      }
  });
}

ipcMain.on('desktopCapturer', () => {
  appScreenshot();
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
}) 
app.on('window-all-closed', function () { 
  if (process.platform !== 'darwin') app.quit() 
})