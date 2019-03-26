import { app, BrowserWindow, dialog, Menu} from 'electron'
const fs = require("fs");
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
  // openFile()
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
const template = [
  {
    label: 'Файл',
    submenu: [
      {
        label: 'Открыть файл',
        accelerator: 'CmdOrCtrl+O',
        click() {
          openFile()
        }
      },
      {
        label: 'Очистить список задач',
        accelerator: 'CmdOrCtrl+D',
        click() {
          clearList()
        }
      }
    ]
  },
  {
    label: 'Папка',
    submenu: [
      {
        label: 'путь к папке',
        accelerator: 'CmdOrCtrl+A',
        click() {
          getPath()
        }
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forcereload' },
      { role: 'toggledevtools' },
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    label: 'Developer',
    submenu: [
      {
        label: 'Toggle Developer Tools',
        accelerator:
          process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
        click() {
          mainWindow.webContents.toggleDevTools();
        }
      }
    ]
  }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

// Open File
function openFile() {
  // Opens file dialog looking for markdown
  const files = dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'exe', extensions: ['exe'] }]
  });

  // If no files
  if (!files) return;

  const file = files[0]; 

  // Send filedContent to renderer
  mainWindow.webContents.send('new-file', file);
}

function clearList() {
  mainWindow.webContents.send('clear-file');
}

function getPath() {
  // Opens file dialog looking for markdown
  const dir = dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });

  // If no dir
  if (!dir) return;

  const file = dir[0]; 
  // console.log(file);
  // Send filedContent to renderer
  mainWindow.webContents.send('get-path-dir', file);
}