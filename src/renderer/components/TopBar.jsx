function TopBar({ subtitle }) {
  const handleMinimize = () => {
    window.electronAPI?.minimizeWindow();
  };

  const handleMaximize = () => {
    window.electronAPI?.maximizeWindow();
  };

  const handleClose = () => {
    window.electronAPI?.closeWindow();
  };

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-logo">MEMORA</div>
      </div>
      <div className="topbar-center">
        <div className="topbar-subtitle">{subtitle}</div>
      </div>
      <div className="topbar-right">
        <div className="window-controls">
          <button className="control-btn" onClick={handleMinimize}>
            <svg width="12" height="12" viewBox="0 0 12 12">
              <rect x="0" y="5.5" width="12" height="1" fill="currentColor"/>
            </svg>
          </button>
          <button className="control-btn" onClick={handleMaximize}>
            <svg width="12" height="12" viewBox="0 0 12 12">
              <rect x="0" y="0" width="12" height="12" stroke="currentColor" strokeWidth="1" fill="none"/>
            </svg>
          </button>
          <button className="control-btn" onClick={handleClose}>
            <svg width="12" height="12" viewBox="0 0 12 12">
              <path d="M0 0L12 12M12 0L0 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}