

function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [isExiting, setIsExiting] = useState(false);
  const progressRef = useRef(0);
  const animationRef = useRef(null);

  const TRANSITION_TIME = 200;
  const STAGE_DURATION = 500;
  const TOTAL_DURATION = 2500; // Общее время загрузки ~2.5 секунды

  const stages = [
    {
      at: 0,
      messages: [
        "Подбираем идеальный размер шрифта",
        "Загружаем кнопки «Сохранить» и «Удалить»",
        "Ищем смысл жизни. Не нашли",
        "Проверяем, не съели ли коты ваши черновики",
        "Готовим чистый лист для ваших идей"
      ]
    },
    {
      at: 0.3,
      messages: [
        "Сортируем заметки по важности",
        "Сканируем теги на кризис",
        "Проверяем черновики"
      ]
    },
    {
      at: 0.6,
      messages: [
        "Стучимся на GitHub",
        "Проверяем обновления",
        "Ищем нового разработчика"
      ]
    },
    {
      at: 0.85,
      messages: [
        "Готово! Чистый лист ждет ваших мыслей",
        "Готово! Вдохновение уже в пути",
        "Готово! Добро пожаловать"
      ]
    }
  ];

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const getRandomMessage = (messages) => {
    return messages[Math.floor(Math.random() * messages.length)];
  };

  useEffect(() => {
    // Плавная анимация прогресс-бара
    const startTime = Date.now();

    const animateProgress = () => {
      const elapsed = Date.now() - startTime;
      const rawProgress = Math.min(elapsed / TOTAL_DURATION, 1);
      
      // Easing function для плавности (ease-in-out)
      const easedProgress = rawProgress < 0.5
        ? 2 * rawProgress * rawProgress
        : 1 - Math.pow(-2 * rawProgress + 2, 2) / 2;
      
      const currentProgress = Math.floor(easedProgress * 100);
      
      if (currentProgress !== progressRef.current) {
        progressRef.current = currentProgress;
        setProgress(currentProgress);
      }

      if (rawProgress < 1) {
        animationRef.current = requestAnimationFrame(animateProgress);
      }
    };

    animationRef.current = requestAnimationFrame(animateProgress);

    // Смена сообщений
    const runMessages = async () => {
      await sleep(300);

      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];
        const stageTime = TOTAL_DURATION * stage.at;
        const waitTime = Math.max(0, stageTime - (Date.now() - startTime));
        
        if (waitTime > 0) {
          await sleep(waitTime);
        }

        setMessage('');
        await sleep(TRANSITION_TIME);
        setMessage(getRandomMessage(stage.messages));
        
        await sleep(STAGE_DURATION);
      }

      // Ждём завершения анимации прогресса
      const remaining = TOTAL_DURATION - (Date.now() - startTime);
      if (remaining > 0) {
        await sleep(remaining + 200);
      }

      // Плавный выход
      await sleep(200);
      setIsExiting(true);
      await sleep(500);
      onComplete();
    };

    runMessages();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className={`loading-screen ${isExiting ? 'exit' : ''}`}>
      <div className="loading-content">
        <div className="logo-container">
          <div className="logo">MEMORA</div>
          <div className="logo-subtitle">Загрузка приложения</div>
        </div>

        <div className="spinner"></div>

        <div className="progress-container">
          <div className="progress-track">
            <div 
              className="progress-bar" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="progress-text">{progress}%</div>
        </div>

        <div className="message-container">
          <div className={`message ${message ? 'active' : ''}`}>
            {message}
          </div>
        </div>
      </div>
    </div>
  );
}