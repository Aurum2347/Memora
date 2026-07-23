function Tooltip({ text, children }) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0, align: 'center' });
  const [mounted, setMounted] = useState(false);
  const timeoutRef = useRef(null);
  const tooltipRef = useRef(null);

  const calculatePosition = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const minMargin = 12;
    
    const tooltipWidth = tooltipRef.current 
      ? tooltipRef.current.offsetWidth 
      : 150;
    
    // Сверху от иконки, со смещением вправо
    let x = rect.left + rect.width / 2 + 80; // +80 смещает правее
    let y = rect.top - 40; // -40 поднимает выше
    let align = 'center';
    
    // Проверяем левую границу
    if (x - tooltipWidth / 2 < minMargin) {
      x = minMargin;
      align = 'left';
    }
    // Проверяем правую границу
    else if (x + tooltipWidth / 2 > window.innerWidth - minMargin) {
      x = window.innerWidth - minMargin;
      align = 'right';
    }
    
    return { x, y, align };
  };

  const handleMouseEnter = (e) => {
    const pos = calculatePosition(e);
    setPosition(pos);
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  useEffect(() => {
    setMounted(true);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const getTransform = () => {
    if (position.align === 'left') return 'translateX(0)';
    if (position.align === 'right') return 'translateX(-100%)';
    return 'translateX(-50%)';
  };

  if (!mounted) return null;

  return (
    <>
      <div 
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: 'pointer', display: 'inline-block' }}
      >
        {children}
      </div>
      {isVisible && (
        <div 
          ref={tooltipRef}
          className="custom-tooltip"
          style={{
            position: 'fixed',
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: getTransform(),
            whiteSpace: 'nowrap',
            zIndex: 10000,
            pointerEvents: 'none'
          }}
        >
          {text}
        </div>
      )}
    </>
  );
}

window.Tooltip = Tooltip;