const electron = require('electron')
const {Menu} = require('electron')
const {globalShortcut} = require('electron')
const {ipcMain} = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')
const {dialog} = require('electron')
const fs = require('fs');
const Config = require('electron-config');
const config = new Config();
const moment = require('moment');

if(process.env.NODE_ENV == 'development'){
    require('electron-reload')(__dirname,{
      hardResetMethod: 'exit'
    });
};

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let taskWindow



function createWindow () {
  // Create the browser window.
  if(process.platform === 'darwin'){
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        minHeight: 300,
        minWidth: 520,
        titleBarStyle: 'hidden',
        title: 'Mindbug',
        vibrancy: 'dark'
      });
  } else {
      mainWindow = new BrowserWindow({
          width: 800,
          height: 600,
          minHeight: 300,
          minWidth: 520,
          titleBarStyle: 'hidden',
          title: 'Mindbug',
        });
  }


  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  })

  // Hook to open links in default browser
  var handleRedirect = (e, url) => {
    if(url != mainWindow.webContents.getURL()) {
        e.preventDefault()
        require('electron').shell.openExternal(url)
    }
  }
  mainWindow.webContents.on('will-navigate', handleRedirect)
  mainWindow.webContents.on('new-window', handleRedirect)

  const template = [
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
          click (item, focusedWindow) {
            if (focusedWindow) focusedWindow.webContents.toggleDevTools()
          }
        },
        {
          type: 'separator'
        },
        {
          role: 'resetzoom'
        },
        {
          role: 'zoomin'
        },
        {
          role: 'zoomout'
        },
        {
          type: 'separator'
        },
        {
          role: 'togglefullscreen'
        }
      ]
    },
    {
      role: 'window',
      submenu: [
        {
          role: 'minimize'
        },
        {
          role: 'close'
        }
      ]
    },
    {
      label: 'Edit',
      submenu : [
        { label: 'Add a task',accelerator: 'CommandOrControl+Shift+T',click (){createTaskWindow()} },
        { label: 'Export database',click (){exportDatabase()} },
        { label: 'Import database',click (){importDatabase()} },
        { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Visit at github',
          click () { require('electron').shell.openExternal('https://github.com/alexanderwe/mindbug') }
        }
      ]
    }
  ]

  if (process.platform === 'darwin') {
    const name = app.getName()
    template.unshift({
      label: name,
      submenu: [
        {
          role: 'about'
        },
        {
          type: 'separator'
        },
        {
          label: 'Preferences',
          accelerator: 'CommandOrControl+,',
          click(){console.log("preferences");}
        },
        {
          type: 'separator'
        },
        {
          role: 'hide'
        },
        {
          role: 'hideothers'
        },
        {
          role: 'unhide'
        },
        {
          type: 'separator'
        },
        {
          role: 'quit'
        }
      ]
    })
  }

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

} // .createWindow()


//Create the task window
function createTaskWindow(){
    taskWindow = new BrowserWindow({
        width: 520,
        height: 350,
        minHeight: 350,
        minWidth: 520,
        titleBarStyle: 'hidden',
        title: 'Mindbug - Create a task',
        vibrancy: 'dark'
    });

    // and load the index.html of the app.
    taskWindow.loadURL(url.format({
      pathname: path.join(__dirname, './windows/createTasks/createTask.html'),
      protocol: 'file:',
      slashes: true
    }))

    taskWindow.on('closed', function () {
       // Dereference the window object, usually you would store windows
       // in an array if your app supports multi windows, this is the time
       // when you should delete the corresponding element.
       taskWindow = null;
    })
}



// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', ()=>{
    createWindow();
    const ret = globalShortcut.register('CommandOrControl+Shift+T', () => {
        createTaskWindow()
    });
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

//Init next backup if not already set in the config file
if (!config.get('next-backup')){
    config.set('next-backup',moment().add(1, 'days'));
}

//Set a 3 sec intervall to check next database backup
setInterval(()=>{
    if (moment(config.get('next-backup')).format() === moment() || moment().diff(moment(config.get('next-backup')).format()) > 0) {
        mainWindow.webContents.send('init-export' , {fileName:'./backup.json'});
        config.set('next-backup',moment().add(1 ,'days'));
    }
},3000);


/**
* Update a project
* @param {String} filepath - path to the fike
* @param {boolean} initImport - define whether the read file should be imported as a database
*/

function readFile(filepath,initImport){
    fs.readFile(filepath, 'utf-8', function (err, data) {
        if(err){
            console.log("An error ocurred reading the file :" + err.message);
            return;
        }
        if(initImport){
            mainWindow.webContents.send('init-import' , {content:data});
        }
    });
}

/*
* Import a JSON database
*/
function importDatabase() {
    dialog.showOpenDialog({
        title: 'Import database',
        filters: [{
            name: 'json',
            extensions: ['json']
            },
        ]}, function(fileNames) {
           if (fileNames === undefined){
                console.log("You didn't save the file");
                return;
           }
        readFile(fileNames[0],true);
    });
}

/*
* Export the task database to JSON
*/
function exportDatabase(){
    // You can obviously give a direct path without use the dialog (C:/Program Files/path/myfileexample.txt)
    dialog.showSaveDialog({
        title: 'Export database',
        filters: [{
            name: 'json',
            extensions: ['json']
            },
        ]}, function(fileName) {
           if (fileName === undefined){
                console.log("You didn't save the file");
                return;
           }
          mainWindow.webContents.send('init-export' , {fileName:fileName});
    });
}


/**
* COMMUNICATION OF RENDERER AND MAIN PROCESS
**/
ipcMain.on('created-task', (event, arg) => {
    mainWindow.webContents.send('insert-task' , {msg:arg});
    taskWindow.close();
})

ipcMain.on('save-to-file', (event, arg) => {
     fs.writeFile(arg.fileName, arg.content, function (err) {
        if(err){
            console.log("An error ocurred updating the file"+ err.message);
            console.log(err);
            return;
        }
        console.log("The file has been succesfully saved");
    });
})

ipcMain.on('set-app-badge',(event,arg)=>{
    if (process.platform === 'darwin') { //badge only available on macOs
        app.dock.setBadge(arg.toString());
    }
})
