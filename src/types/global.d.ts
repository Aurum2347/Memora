export interface ElectronAPI {
  toggleWindow: () => void;
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};