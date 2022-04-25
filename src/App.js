import { ipcRenderer } from 'electron';
import React, {useEffect} from 'react'

export default function App() {

    useEffect(() => {
    }, [])
    const openPopup = () => { 
        ipcRenderer.send('open_window', 'send'); 
      } 
  return (
    <button onClick={openPopup}>
     Open BrowserWindow
     </button>  )
}
