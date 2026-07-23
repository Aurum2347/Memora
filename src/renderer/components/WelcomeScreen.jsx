

function WelcomeScreen({ onComplete }) {
  const [nickname, setNickname] = useState('');
  const [isExiting, setIsExiting] = useState(false);

  const handleSubmit = () => {
    if (nickname.trim() && !isExiting) {
      localStorage.setItem('memora_nickname', nickname.trim());
      setIsExiting(true);
      
      // Ждём окончания анимации fade-out (600мс)
      setTimeout(() => {
        onComplete(nickname.trim());
      }, 600);
    }
  };

  const handleChange = (e) => {
    setNickname(e.target.value);
  };

  return (
    <div className={`welcome-screen ${isExiting ? 'fade-out' : 'fade-in'}`}>
      <div className="welcome-content">
        <h1 className="welcome-title">Добро пожаловать!</h1>
        <p className="welcome-subtitle">Как к вам обращаться?</p>
        
        <div className="input-wrapper">
          <input
            type="text"
            className="nickname-input"
            placeholder="Введите ваш никнейм"
            value={nickname}
            onChange={handleChange}
            autoFocus
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            disabled={isExiting}
          />
          <div className="input-glow"></div>
        </div>

        <div className="welcome-notice">
          <div className="notice-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>Важно!</span>
          </div>
          <p>Позже вы всегда сможете сменить никнейм в настройках если вас что-то не устраивает.</p>
        </div>

        <button 
          className={`welcome-btn ${nickname.trim() && !isExiting ? 'active' : ''}`}
          onClick={handleSubmit}
          disabled={!nickname.trim() || isExiting}
        >
          <span>Готово</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </div>
  );
}