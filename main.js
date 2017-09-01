const {
	app,
	BrowserWindow,
	ipcMain,
	protocol
} = require('electron');
const path = require('path');
const url = require('url');
const http = require('http');
const fs = require('fs');

let win, mainWin;

let userData = null,
	logged = false;


app.on('ready', createWindow);
app.on('window-all-closed', () => {
	// for macOS
	if (process.platform !== 'darwin') {
		app.quit();
	}
});
app.on('activate', () => {
	// On macOS it's common to re-create a window
	if (win === null) {
		createWindow();
	}
});

function createWindow() {
	if (logged) {
		mainWin = new BrowserWindow({
			minWidth: 800,
			minHeight: 640,
			width: 800,
			height: 640,
			show: false,
			icon: path.join(__dirname, 'images/icon/64x64.png')
		});
		//mainWin.setMenu(null);
		mainWin.loadURL(url.format({
			pathname: path.join(__dirname, 'index.html'),
			protocol: 'file:',
			slashes: true
		}));
		mainWin.webContents.on('did-finish-load', function () {
			mainWin.show();
			if (win != null)
				win.close();
		});

		// Open the DevTools.
		mainWin.webContents.openDevTools()

		mainWin.on('closed', () => {
			mainWin = null
		});
	} else {
		win = new BrowserWindow({
			minWidth: 800,
			minHeight: 640,
			width: 800,
			height: 640,
			show: false,
			icon: path.join(__dirname, 'images/icon/64x64.png')
		});
		//win.setMenu(null);
		win.loadURL(url.format({
			pathname: path.join(__dirname, 'authentication.html'),
			protocol: 'file:',
			slashes: true
		}));
		win.webContents.on('did-finish-load', function () {
			win.show();
		});

		// Open the DevTools.
		//win.webContents.openDevTools()

		win.on('closed', () => {
			win = null
		});
	}
}

/*
ipcMain.on('async' , function(event, arg){
	
	// works
	event.sender.send('async-reply', (arg*2));
	
});
*/
ipcMain.on('logged', function (event, arg) {
	userData = arg;
	logged = true;

	createWindow();
});

ipcMain.on('friends', function (event, arg) {
	event.sender.send('friendsResponse', userData);
	if (userData.imgUrl === undefined) {
		event.sender.send("uploadProfileImage", null);
	}
});
ipcMain.on('close', function (event, arg) {
	if (mainWin != null) {
		mainWin.close();
	}
});

ipcMain.on('sync', function (event, arg) {
	if (mainWin != null) {
		mainWin.reload();
	}
});

ipcMain.on('SaveFile', function (event, arg) {
	if (arg.fileData != null && arg.filePath != null) {
		fs.writeFile(arg.filePath.replace('file:///', ''), arg.fileData, function (err) {
			if (err) {
				console.log('file save error');
				return;
			} else {
				event.sender.send('EditorFileSaved', true);
			}

		});
	} else {
		console.log('file save error');
	}
});

//main 46lc problem