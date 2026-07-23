import { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, shell, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import { getMemos, saveMemo, deleteMemo, getAllTags } from './fs-notes';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuiting = false;

const configPath = path.join(app.getPath('userData'), 'memora-config.json');

function getConfig() {
  if (fs.existsSync(configPath)) return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  return { storagePath: null, isFirstLaunch: true };
}

function saveConfig(config: any) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

function showTrayNotification() {
  if (tray) {
    tray.displayBalloon({
      title: 'Memora',
      content: 'Приложение скрыто в трей. Нажмите на иконку чтобы открыть.',
      icon: path.join(__dirname, '../../assets/icon.png'),
      largeIcon: true,
    });
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100, 
    height: 750, 
    minWidth: 900, 
    minHeight: 600,
    webPreferences: { 
      preload: path.join(__dirname, '../preload/index.js'), 
      contextIsolation: true, 
      nodeIntegration: false 
    },
    frame: false, 
    backgroundColor: '#111111', 
    show: false, 
    icon: path.join(__dirname, '../../assets/icon.png'),
  });
  
  // Исправленный путь для загрузки index.html
  const indexPath = path.join(__dirname, '../renderer/index.html');
  console.log('Loading from:', indexPath); // Для отладки
  mainWindow.loadFile(indexPath);
  
  mainWindow.setTitle('Memora');
  mainWindow.once('ready-to-show', () => mainWindow?.show());
  mainWindow.on('close', (event) => {
    if (!isQuiting) { 
      event.preventDefault(); 
      mainWindow?.hide(); 
      showTrayNotification(); 
    }
  });
  mainWindow.on('show', () => { if (tray) tray.setToolTip('Memora - Окно открыто'); });
  mainWindow.on('hide', () => { if (tray) tray.setToolTip('Memora - Нажмите чтобы открыть'); });
}

function createTray() {
  const icon = nativeImage.createFromPath(path.join(__dirname, '../../assets/icon.png')).resize({ width: 16, height: 16 });
  tray = new Tray(icon);
  tray.setToolTip('Memora - Нажмите чтобы открыть');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Показать Memora', click: () => { mainWindow?.show(); mainWindow?.focus(); } },
    { label: 'Сбросить данные и перезапустить', click: () => { if (mainWindow) { if (fs.existsSync(configPath)) fs.unlinkSync(configPath); mainWindow.webContents.send('reset-data'); } } },
    { type: 'separator' },
    { label: 'Exit', click: () => { isQuiting = true; app.quit(); } },
  ]));
  tray.on('click', () => { if (mainWindow && !mainWindow.isVisible()) { mainWindow.show(); mainWindow.focus(); } });
  tray.on('double-click', () => {
    if (mainWindow?.isVisible()) { mainWindow.hide(); showTrayNotification(); }
    else { mainWindow?.show(); mainWindow?.focus(); }
  });
}

ipcMain.handle('select-storage-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, { title: 'Выберите папку для хранения заметок Memora', properties: ['openDirectory', 'createDirectory'], buttonLabel: 'Выбрать папку' });
  if (!result.canceled && result.filePaths.length > 0) {
    const config = getConfig();
    config.storagePath = result.filePaths[0];
    config.isFirstLaunch = false;
    saveConfig(config);
    return { success: true, path: config.storagePath };
  }
  return { success: false };
});

ipcMain.handle('check-app-status', () => { const c = getConfig(); return { isFirstLaunch: c.isFirstLaunch, storagePath: c.storagePath }; });
ipcMain.handle('get-storage-path', () => ({ storagePath: getConfig().storagePath }));
ipcMain.handle('get-all-tags', () => getAllTags(getConfig().storagePath));

ipcMain.handle('get-memora', (_event, limit, offset, isDraft, searchQuery, targetDate, selectedTag) => {
  return getMemos(getConfig().storagePath, limit, offset, isDraft, searchQuery, targetDate, selectedTag);
});

ipcMain.handle('save-memora', (_event, memo) => saveMemo(getConfig().storagePath, memo));
ipcMain.handle('delete-memora', (_event, id) => { deleteMemo(getConfig().storagePath, id); return true; });

ipcMain.handle('open-external', async (_event, url) => shell.openExternal(url));

ipcMain.handle('show-item-in-folder', (_event, filename: string) => {
  const config = getConfig();
  if (config.storagePath && filename) {
    const fullPath = path.join(config.storagePath, filename);
    shell.showItemInFolder(fullPath);
  }
});

ipcMain.on('minimize-window', () => mainWindow?.minimize());
ipcMain.on('maximize-window', () => mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow?.maximize());
ipcMain.on('close-window', () => {
  const c = getConfig();
  if (!c.storagePath) { isQuiting = true; app.quit(); }
  else { mainWindow?.hide(); showTrayNotification(); }
});

app.whenReady().then(() => { createWindow(); createTray(); });
app.on('before-quit', () => { isQuiting = true; });