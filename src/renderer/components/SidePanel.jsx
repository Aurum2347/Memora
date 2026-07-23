
function SidePanel({ 
  searchQuery = '', 
  onSearchChange = () => {}, 
  onTagClick = () => {}, 
  allTags = [], 
  selectedDate = null, 
  onDateClick = () => {}, 
  selectedTag = null, 
  onClearFilters = () => {},
  daysWithNotes = [] 
}) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [calendarKey, setCalendarKey] = useState(0);
  const [slideDirection, setSlideDirection] = useState('');
  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

  const handleClearSearch = () => onSearchChange('');

  const isToday = (day) => {
    return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
  };

  const isSelectedDate = (day) => {
    if (!selectedDate) return false;
    const d = new Date(selectedDate);
    return day === d.getDate() && currentMonth === d.getMonth() && currentYear === d.getFullYear();
  };

  const hasNoteOnDay = (day) => {
    if (!daysWithNotes || daysWithNotes.length === 0) return false;
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return daysWithNotes.includes(dateStr);
  };

  const goToPrevMonth = () => {
    setSlideDirection('right');
    setCalendarKey(k => k + 1);
    setTimeout(() => {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(y => y - 1);
      } else {
        setCurrentMonth(m => m - 1);
      }
    }, 150);
  };

  const goToNextMonth = () => {
    setSlideDirection('left');
    setCalendarKey(k => k + 1);
    setTimeout(() => {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(y => y + 1);
      } else {
        setCurrentMonth(m => m + 1);
      }
    }, 150);
  };

  return (
    <div className="side-panel">
      <div className="search-box">
        <div className="search-input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input 
            type="text" 
            placeholder="Поиск..." 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear-btn" onClick={handleClearSearch} title="Очистить">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
          <span className="kbd">⌘K</span>
        </div>
      </div>

      <div className="calendar-section">
        <div className="calendar-header">
          <h3>{monthNames[currentMonth]} {currentYear}</h3>
          <div className="calendar-nav">
            <button onClick={goToPrevMonth}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <button onClick={goToNextMonth}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>
        <div className={`calendar-grid-wrapper ${slideDirection}`}>
          <div className="calendar-grid" key={calendarKey}>
            {dayNames.map(d => <div key={d} className="day-name">{d}</div>)}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`pad-${i}`} className="day empty"></div>
            ))}
            {daysArray.map(day => {
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              return (
                <div
                  key={day}
                  className={`day ${isToday(day) ? 'today' : ''} ${isSelectedDate(day) ? 'selected' : ''} ${hasNoteOnDay(day) ? 'has-notes' : ''}`}
                  onClick={() => onDateClick(isSelectedDate(day) ? null : dateStr)}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="section-header">
        <h4>Теги</h4>
        {(selectedTag || selectedDate) && (
          <button className="clear-filters-btn" onClick={onClearFilters} title="Сбросить фильтры">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      <div className="tags-list-dynamic">
        {allTags.length === 0 && <div className="empty-hint">Нет тегов</div>}
        {allTags.map(({ tag, count }) => (
          <span
            key={tag}
            className={`tag clickable ${selectedTag === tag ? 'active' : ''}`}
            onClick={() => onTagClick(selectedTag === tag ? null : tag)}
          >
            #{tag} <span className="count">({count})</span>
          </span>
        ))}
      </div>
    </div>
  );
}