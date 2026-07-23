import { contextBridge, ipcRenderer } from 'electron';

export interface ElectronAPI {
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  openExternal: (url: string) => Promise<void>;
  checkAppStatus: () => Promise<{ isFirstLaunch: boolean; storagePath: string | null }>;
  selectStorageFolder: () => Promise<{ success: boolean; path?: string }>;
  getStoragePath: () => Promise<{ storagePath: string | null }>;
  getAllTags: () => Promise<{ tag: string; count: number }[]>;
  getMemora: (limit: number, offset: number, isDraft: boolean, searchQuery: string, targetDate: string | null, selectedTag: string | null) => Promise<any[]>;
  saveMemora: (memo: any) => Promise<any>;
  deleteMemora: (id: string) => Promise<boolean>;
  showItemInFolder: (filename: string) => Promise<void>;
  onResetData: (callback: () => void) => void;
  onHotkeyNewNote: (callback: () => void) => void;
  onHotkeySearch: (callback: () => void) => void;
  onHotkeySettings: (callback: () => void) => void;
  onHotkeyGraph: (callback: () => void) => void;
}

const api: ElectronAPI = {
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  checkAppStatus: () => ipcRenderer.invoke('check-app-status'),
  selectStorageFolder: () => ipcRenderer.invoke('select-storage-folder'),
  getStoragePath: () => ipcRenderer.invoke('get-storage-path'),
  getAllTags: () => ipcRenderer.invoke('get-all-tags'),
  getMemora: (limit, offset, isDraft, searchQuery, targetDate, selectedTag) =>
    ipcRenderer.invoke('get-memora', limit, offset, isDraft, searchQuery, targetDate, selectedTag),
  saveMemora: (memo) => ipcRenderer.invoke('save-memora', memo),
  deleteMemora: (id) => ipcRenderer.invoke('delete-memora', id),
  showItemInFolder: (filename) => ipcRenderer.invoke('show-item-in-folder', filename),
  onResetData: (cb) => ipcRenderer.on('reset-data', () => cb()),
  onHotkeyNewNote: (cb) => ipcRenderer.on('hotkey-new-note', () => cb()),
  onHotkeySearch: (cb) => ipcRenderer.on('hotkey-search', () => cb()),
  onHotkeySettings: (cb) => ipcRenderer.on('hotkey-settings', () => cb()),
  onHotkeyGraph: (cb) => ipcRenderer.on('hotkey-graph', () => cb()),
};

contextBridge.exposeInMainWorld('electronAPI', api);