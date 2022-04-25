import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { SEND_MAIN_PING } from './constants';
// import { ipcRenderer } from 'electron';
function App() {
  const { ipcRenderer }  = window.require("electron");

  useEffect(() => {
    ipcRenderer.send('macScreenPermissionCheck');
    ipcRenderer.on('macScreenPermissionAlert', () => {
      alert('화면 기록 권한을 허용해주세요');
      ipcRenderer.send('openSystemPreferences');
    })
  }, [])

  const sendMain = () => {
    ipcRenderer.send('openPopup', 'send');
  }
  const orderMultiScreen = () => {
    ipcRenderer.send('electronShortcutCapture', 'send');
  }
  const desktopCapturer = () => {
    ipcRenderer.send('desktopCapturer', 'send');
  }
  const electronCaptureScreen = () => {
    ipcRenderer.send('electron-capture-screen', 'send');
  }
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Hello world!!!
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <button onClick={sendMain}>Send openPopup</button>
        <button onClick={orderMultiScreen}>electronShortcutCapture</button>
        <button onClick={desktopCapturer}>desktopCapturer</button>
        <button onClick={electronCaptureScreen}>electron-capture-screen</button>
      </header>
    </div>
  );
}

export default App;
