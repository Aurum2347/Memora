

function FullEditor({ note, onSave, onBack, hasChanges, onChangesUpdate }) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState(note?.tags || []);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [stats, setStats] = useState({ chars: 0, words: 0, readTime: 0, lines: 0 });
  const [isDirty, setIsDirty] = useState(false);

  const textareaRef = useRef(null);
  const autoSaveTimerRef = useRef(null);
  const initialContentRef = useRef(note?.content || '');
  const initialTitleRef = useRef(note?.title || '');

  useEffect(() => {
    const hasChanged = content !== initialContentRef.current || title !== initialTitleRef.current;
    setIsDirty(hasChanged);
    if (onChangesUpdate) onChangesUpdate(hasChanged);
  }, [content, title]);

  useEffect(() => {
    const chars = content.length;
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const readTime = Math.max(1, Math.ceil(words / 200));
    const lines = content ? content.split('\n').length : 0;
    setStats({ chars, words, readTime, lines });
  }, [content]);

  const handleSave = () => {
    if (!content.trim() && !title.trim()) return;
    setIsSaving(true);
    setSaveStatus('Сохранение...');

    const now = Math.floor(Date.now() / 1000);
    const noteData = {
      id: note?.id || Date.now().toString(),
      title: title || 'Без названия',
      content,
      tags,
      created_at: note?.created_at || now,
      updated_at: now,
      is_draft: note?.is_draft || false,
      is_pinned: note?.is_pinned || false,
    };

    // Передаем true, чтобы MainScreen закрыл редактор после сохранения
    onSave(noteData, true);
  };

  const handleAddTag = () => {
    const tagName = prompt('Введите название тега:');
    if (tagName && !tags.includes(tagName.toLowerCase().replace('#', ''))) {
      setTags([...tags, tagName.toLowerCase().replace('#', '')]);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
    if (saveStatus === 'Сохранено') setSaveStatus('');
  };

  return (
    <div className="full-editor">
      <div className="editor-topbar">
        <div className="editor-topbar-left">
          <button className="back-btn" onClick={onBack}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Назад
          </button>
        </div>
        <div className="editor-topbar-right">
          <div className="save-status">
            {saveStatus && <span className={isSaving ? 'saving' : 'saved'}>{saveStatus}</span>}
          </div>
          <div className="stats-mini">
            <span>{stats.chars} символов</span>
            <span>{stats.words} слов</span>
          </div>
          <button
            className="btn btn-save"
            onClick={handleSave}
            disabled={isSaving || (!content.trim() && !title.trim())}
          >
            Сохранить
          </button>
        </div>
      </div>

      <div className="editor-body">
        <div className="editor-sidebar">
          <div className="sidebar-section">
            <div className="section-header">
              <h3>Теги</h3>
              <button className="add-btn" onClick={handleAddTag}>+</button>
            </div>
            <div className="tags-list">
              {tags.map(tag => (
                <div key={tag} className="tag-chip">
                  <span>#{tag}</span>
                  <button onClick={() => handleRemoveTag(tag)}>×</button>
                </div>
              ))}
              {tags.length === 0 && <div className="empty-hint">Нет тегов</div>}
            </div>
          </div>
          <div className="sidebar-section">
            <div className="section-header"><h3>Статистика</h3></div>
            <div className="stats-list">
              <div className="stat-item"><span className="stat-value">{stats.chars}</span><span className="stat-label">Символов</span></div>
              <div className="stat-item"><span className="stat-value">{stats.words}</span><span className="stat-label">Слов</span></div>
              <div className="stat-item"><span className="stat-value">{stats.readTime}</span><span className="stat-label">Мин. чтения</span></div>
              <div className="stat-item"><span className="stat-value">{stats.lines}</span><span className="stat-label">Строк</span></div>
            </div>
          </div>
        </div>

        <div className="editor-main">
          <input
            className="editor-title-input"
            placeholder="Заголовок записи"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            ref={textareaRef}
            className="editor-textarea"
            placeholder="Начните писать..."
            value={content}
            onChange={handleContentChange}
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}