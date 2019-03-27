import { app, BrowserWindow, dialog, Menu, Tray} from 'electron'
const path = require("path");
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}
// ICON PATH FOR TRAY
let iconPath = path.join('static/icon.ico');
if (process.env.NODE_ENV !== 'development') {
  iconPath = path.join(__dirname, '/static/icon.ico').replace(/\\/g, '\\\\');
}

// 
let tray = null
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
  // tray
  tray = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'запустить',
      click: () => {
        mainWindow.webContents.send('run-from-main')
      }

    },
    { label: 'выход',
    click: () => {
      app.quit();
    }
    },
  ]);
  tray.setContextMenu(contextMenu);
  tray.setToolTip("запуск задач");

  // END CREATE WINDOW
}
// AUTO START APP WHITH WINDOWS
const exeName = app.getPath("exe");
app.setLoginItemSettings({
  openAtLogin: 'true',
  openAsHidden : 'true',
  path: exeName,
  args: [
    '--processStart', `"${exeName}"`,
    '--process-start-args', `"--hidden"`
  ]
})
// 
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
    label: 'Вид',
    submenu: [
      { role: 'reload' },
      { role: 'forcereload' },
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
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