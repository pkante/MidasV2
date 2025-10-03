import { app, BrowserWindow, ipcMain, screen } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { streamMessageToGemini } from './gemini.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let floatingIconWindow = null;
let chatWindow = null;

function createFloatingIcon() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  const preloadPath = path.join(__dirname, 'preload.cjs');
  console.log('Preload path:', preloadPath);
  
  floatingIconWindow = new BrowserWindow({
    width: 60,
    height: 60,
    x: width - 80,
    y: height - 80,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    movable: true,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // Make window float above ALL applications (including others)
  floatingIconWindow.setAlwaysOnTop(true, 'floating', 1);
  floatingIconWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  if (process.env.NODE_ENV === 'development') {
    floatingIconWindow.loadURL('http://localhost:5173/#/icon');
    // Open DevTools for debugging
    floatingIconWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    floatingIconWindow.loadFile(path.join(__dirname, '../dist/index.html'), {
      hash: 'icon',
    });
  }

  floatingIconWindow.setIgnoreMouseEvents(false);
  
  // Debug: Log when page finishes loading
  floatingIconWindow.webContents.on('did-finish-load', () => {
    console.log('✓ Floating icon window loaded successfully');
    console.log('✓ Preload path:', path.join(__dirname, 'preload.cjs'));
  });
  
  console.log('Floating icon window created at position:', width - 80, height - 80);
}

function createChatWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  const preloadPath = path.join(__dirname, 'preload.cjs');
  
  chatWindow = new BrowserWindow({
    width: 400,
    height: 600,
    x: width - 420,
    y: height - 620,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: true,
    show: false,
    minWidth: 300,
    minHeight: 400,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // Make chat window float above ALL applications
  chatWindow.setAlwaysOnTop(true, 'floating', 1);
  chatWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  if (process.env.NODE_ENV === 'development') {
    chatWindow.loadURL('http://localhost:5173/#/chat');
    // Open DevTools for debugging
    chatWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    chatWindow.loadFile(path.join(__dirname, '../dist/index.html'), {
      hash: 'chat',
    });
  }

  chatWindow.on('close', (e) => {
    e.preventDefault();
    chatWindow.hide();
  });
  
  // Debug: Log when page finishes loading
  chatWindow.webContents.on('did-finish-load', () => {
    console.log('✓ Chat window loaded successfully');
  });
  
  console.log('Chat window created at position:', width - 420, height - 620);
}

app.whenReady().then(() => {
  createFloatingIcon();
  createChatWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createFloatingIcon();
      createChatWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers
ipcMain.on('toggle-chat', () => {
  console.log('\n=================================');
  console.log('📨 Toggle chat IPC received!');
  console.log('Chat window exists?', !!chatWindow);
  console.log('Chat window visibility:', chatWindow ? chatWindow.isVisible() : 'N/A');
  
  if (!chatWindow) {
    console.error('❌ Chat window does not exist!');
    return;
  }
  
  if (chatWindow.isVisible()) {
    console.log('➡️  Hiding chat window, showing icon');
    chatWindow.hide();
    floatingIconWindow.show();
  } else {
    console.log('➡️  Showing chat window, hiding icon');
    const bounds = chatWindow.getBounds();
    console.log('Chat window bounds:', bounds);
    floatingIconWindow.hide();
    chatWindow.show();
    chatWindow.focus();
    console.log('✓ Chat window should now be visible, icon hidden');
  }
  console.log('=================================\n');
});

ipcMain.on('close-chat', () => {
  console.log('📨 Close chat IPC received');
  console.log('➡️  Hiding chat window, showing icon');
  chatWindow.hide();
  floatingIconWindow.show();
});

ipcMain.on('start-drag', () => {
  floatingIconWindow.setIgnoreMouseEvents(false);
});

ipcMain.on('icon-clicked', () => {
  console.log('🖱️  ICON CLICKED EVENT RECEIVED');
});

// Gemini AI streaming handler
ipcMain.on('send-to-gemini-stream', async (event, userMessage) => {
  console.log('📨 Received message for Gemini streaming:', userMessage);
  
  try {
    const stream = streamMessageToGemini(userMessage, (chunk) => {
      // Send each chunk back to the renderer
      event.reply('gemini-stream-chunk', chunk);
    });
    
    // Consume the stream
    for await (const chunk of stream) {
      // Chunks are already sent via onChunk callback
    }
  } catch (error) {
    console.error('❌ Error in streaming handler:', error);
    event.reply('gemini-stream-chunk', {
      type: 'error',
      error: error.message,
    });
  }
});

