const { ipcRenderer, desktopCapturer } = require('electron');
const ipc = ipcRenderer;

document.getElementById('screenshot-button').addEventListener('click', () => { // The button which takes the screenshot
    desktopCapturer.getSources({ types: ['screen'] })
        .then( sources => {
            document.getElementById('screenshot-image').src = sources[0].thumbnail.toDataURL() // The image to display the screenshot
        })
})