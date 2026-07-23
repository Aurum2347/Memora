function App() {
  const [showLoading, setShowLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [nickname, setNickname] = useState('');
  const [storagePath, setStoragePath] = useState(null);

  useEffect(() => {
    const savedNickname = localStorage.getItem('memora_nickname');
    if (savedNickname) {
      setNickname(savedNickname);
    }

    // Слушаем событие сброса данных от трея
    window.electronAPI?.onResetData(() => {
      localStorage.clear();
      window.location.reload();
    });
  }, []);

  const handleLoadingComplete = async () => {
    setShowLoading(false);

    try {
      const status = await window.electronAPI?.checkAppStatus();
      
      if (status?.isFirstLaunch || !status?.storagePath) {
        setShowOnboarding(true);
      } else {
        setStoragePath(status.storagePath);
        const savedNickname = localStorage.getItem('memora_nickname');
        if (!savedNickname) {
          setShowWelcome(true);
        }
      }
    } catch (err) {
      console.error('Ошибка проверки статуса:', err);
      setShowOnboarding(true);
    }
  };

  const handleOnboardingComplete = (path) => {
    setStoragePath(path);
    setShowOnboarding(false);
    
    const savedNickname = localStorage.getItem('memora_nickname');
    if (!savedNickname) {
      setShowWelcome(true);
    }
  };

  const handleWelcomeComplete = (newNickname) => {
    setNickname(newNickname);
    setShowWelcome(false);
  };

  if (showLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  if (showOnboarding) {
    return (
      <>
        <TopBar subtitle="Первичная настройка" />
        <Onboarding onComplete={handleOnboardingComplete} />
      </>
    );
  }

  if (showWelcome) {
    return (
      <>
        <TopBar subtitle="Добро пожаловать" />
        <WelcomeScreen onComplete={handleWelcomeComplete} />
      </>
    );
  }

  return (
    <MainScreen nickname={nickname} storagePath={storagePath} />
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);