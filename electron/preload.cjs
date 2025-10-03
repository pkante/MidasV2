const { contextBridge, ipcRenderer } = require('electron');

console.log('🔧 Preload script executing...');

contextBridge.exposeInMainWorld('electronAPI', {
  toggleChat: () => {
    console.log('toggleChat called from renderer');
    ipcRenderer.send('toggle-chat');
  },
  closeChat: () => {
    console.log('closeChat called from renderer');
    ipcRenderer.send('close-chat');
  },
  iconClicked: () => {
    console.log('iconClicked called from renderer');
    ipcRenderer.send('icon-clicked');
  },
  sendToGeminiStream: (message, onChunk) => {
    console.log('sendToGeminiStream called from renderer');
    
    // Send the message to start streaming
    ipcRenderer.send('send-to-gemini-stream', message);
    
    // Listen for chunks
    const handler = (event, chunk) => {
      onChunk(chunk);
    };
    
    ipcRenderer.on('gemini-stream-chunk', handler);
    
    // Return cleanup function
    return () => {
      ipcRenderer.removeListener('gemini-stream-chunk', handler);
    };
  },
});

console.log('✓ electronAPI exposed to window');

