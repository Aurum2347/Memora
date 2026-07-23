
function SettingsModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('appearance');
  const [isClosing, setIsClosing] = useState(false);
  const [storagePath, setStoragePath] = useState(null);

  useEffect(() => {
    if (isClosing) {
      const timer = setTimeout(onClose, 300);
      return () => clearTimeout(timer);
    }
  }, [isClosing, onClose]);

  // Загружаем текущий путь при открытии вкладки "Общие"
  useEffect(() => {
    if (activeTab === 'general') {
      window.electronAPI?.getStoragePath().then(result => {
        setStoragePath(result?.storagePath);
      });
    }
  }, [activeTab]);

  const handleClose = () => {
    setIsClosing(true);
  };

  const handleOpenLink = async (url) => {
    await window.electronAPI?.openExternal(url);
  };

  const handleChangeStoragePath = async () => {
    const result = await window.electronAPI?.selectStorageFolder();
    if (result?.success) {
      setStoragePath(result.path);
    }
  };

  const tabs = [
    { id: 'appearance', label: 'Внешний вид', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20"/></svg> },
    { id: 'general', label: 'Общие', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
    { id: 'hotkeys', label: 'Горячие клавиши', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 16h10"/></svg> },
    { id: 'about', label: 'О программе', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'appearance':
        return (
          <div className="settings-tab">
            <div className="settings-section-title">Тема оформления</div>
            <div className="setting-row">
              <div className="setting-info">
                <div className="setting-label">Тема</div>
                <div className="setting-desc">Выберите цветовую схему интерфейса</div>
              </div>
              <select className="setting-select">
                <option>Тёмная</option>
                <option>Светлая</option>
                <option>Системная</option>
              </select>
            </div>
            <div className="setting-row">
              <div className="setting-info">
                <div className="setting-label">Размер шрифта</div>
                <div className="setting-desc">Базовый размер текста в интерфейсе</div>
              </div>
              <select className="setting-select">
                <option>Мелкий</option>
                <option>Средний</option>
                <option>Крупный</option>
              </select>
            </div>
            <div className="setting-row">
              <div className="setting-info">
                <div className="setting-label">Анимации</div>
                <div className="setting-desc">Плавные переходы и эффекты</div>
              </div>
              <div className="toggle on"></div>
            </div>
          </div>
        );
      case 'general':
        return (
          <div className="settings-tab">
            <div className="settings-section-title">Основные</div>
            <div className="setting-row">
              <div className="setting-info">
                <div className="setting-label">Язык интерфейса</div>
                <div className="setting-desc">Язык отображения Memora</div>
              </div>
              <select className="setting-select">
                <option>Русский</option>
                <option>English</option>
              </select>
            </div>
            <div className="setting-row">
              <div className="setting-info">
                <div className="setting-label">Автозапуск</div>
                <div className="setting-desc">Запускать Memora при старте системы</div>
              </div>
              <div className="toggle on"></div>
            </div>

            <div className="settings-section-title" style={{ marginTop: 24 }}>Хранение данных</div>
            <div className="setting-row storage-row">
              <div className="setting-info">
                <div className="setting-label">Папка хранения заметок</div>
                <div className="setting-desc storage-path">
                  {storagePath || 'Не выбрана'}
                </div>
              </div>
              <button className="change-path-btn" onClick={handleChangeStoragePath}>
                Изменить
              </button>
            </div>
            <div className="storage-warning">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span>При смене папки существующие заметки не будут перенесены автоматически.</span>
            </div>
          </div>
        );
      case 'hotkeys':
        return (
          <div className="settings-tab">
            <div className="settings-section-title">Горячие клавиши</div>
            <div className="setting-row">
              <div className="setting-info"><div className="setting-label">Новая заметка</div></div>
              <div className="kbd-display">Ctrl + N</div>
            </div>
            <div className="setting-row">
              <div className="setting-info"><div className="setting-label">Поиск</div></div>
              <div className="kbd-display">Ctrl + K</div>
            </div>
            <div className="setting-row">
              <div className="setting-info"><div className="setting-label">Настройки</div></div>
              <div className="kbd-display">Ctrl + ,</div>
            </div>
            <div className="setting-row">
              <div className="setting-info"><div className="setting-label">Граф связей</div></div>
              <div className="kbd-display">Ctrl + G</div>
            </div>
          </div>
        );
      case 'about':
        return (
          <div className="settings-tab about-tab">
            <div className="about-logo">MEMORA</div>
            <div className="about-version">Версия 0.1.0</div>
            <div className="about-author">Автор: <span className="author-name">Aurum2347</span></div>
            <div className="about-links">
              <button className="about-link" onClick={() => handleOpenLink('https://t.me/aurums2347')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-16.5 6.6c-.921.377-1.119 1.163-.125 1.513l4.125 1.455 9.563-6.033c.45-.277.863-.125.525.175l-7.725 6.9-1.05 6.525c-.15.925.625 1.3 1.375.825l3.375-2.475 6.9 2.55c1.025.375 1.975-.175 1.725-1.2l-3.3-15.15c-.225-.975-.975-1.425-1.875-1.3z"/></svg>
                Telegram канал
              </button>
              <button className="about-link" onClick={() => handleOpenLink('https://github.com/Aurum2347/Memora')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                GitHub проект
              </button>
            </div>
            <div className="about-tech">
              <div className="tech-title">Технологии:</div>
              <div className="tech-stack">
                <span className="tech-item">Electron</span>
                <span className="tech-item">React</span>
                <span className="tech-item">TypeScript</span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className={`modal-overlay ${isClosing ? 'closing' : ''}`} 
      onClick={handleClose}
    >
      <div 
        className={`modal settings-modal ${isClosing ? 'closing' : ''}`} 
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Настройки</h2>
          <button className="modal-close" onClick={handleClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
          </button>
        </div>
        <div className="settings-body">
          <div className="settings-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
          <div className="settings-content">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}