

function Onboarding({ onComplete }) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [error, setError] = useState('');

  const handleSelectFolder = async () => {
    setIsSelecting(true);
    setError('');

    try {
      const result = await window.electronAPI?.selectStorageFolder();
      
      if (result?.success) {
        onComplete(result.path);
      } else {
        setError('Папка не была выбрана. Пожалуйста, выберите папку для продолжения.');
      }
    } catch (err) {
      setError('Произошла ошибка при выборе папки.');
    } finally {
      setIsSelecting(false);
    }
  };

  return (
    <div className="onboarding-screen">
      <div className="onboarding-content">
        <div className="onboarding-logo">MEMORA</div>
        <div className="onboarding-subtitle">Первичная настройка</div>

        <div className="onboarding-card">
          <div className="onboarding-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
          </div>

          <h2 className="onboarding-title">Выберите папку для хранения заметок</h2>
          <p className="onboarding-description">
            Memora будет хранить все ваши заметки, черновики и вложения в выбранной папке. 
            Вы сможете изменить это позже в настройках.
          </p>

          {error && (
            <div className="onboarding-error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button 
            className="onboarding-btn"
            onClick={handleSelectFolder}
            disabled={isSelecting}
          >
            {isSelecting ? (
              <>
                <div className="btn-spinner"></div>
                Выбор папки...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
                Выбрать папку
              </>
            )}
          </button>

          <div className="onboarding-hint">
            Рекомендуется создать отдельную папку, например: <span className="path-example">Документы/Memora</span>
          </div>
        </div>
      </div>
    </div>
  );
}