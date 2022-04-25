// 키보드 입력
document.addEventListener('keydown', (event) => {
    if(event.keyCode==123){ //F12
        //메인프로세스로 toggle-debug 메시지 전송 (디버그 툴 토글시켜라)
        ipcRenderer.send('toggle-debug', 'an-argument')
    }
    else if(event.keyCode==116){ //F5
        //메인프로세스로 refresh 메시지 전송 (페이지를 갱신시켜라)
        ipcRenderer.send('refresh', 'an-argument')
    }
})