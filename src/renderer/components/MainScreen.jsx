const PAGE_SIZE = 10;

function MainScreen({ nickname, storagePath }) {
  const [activeView, setActiveView] = useState('memora');
  const [viewMode, setViewMode] = useState('list');
  const [viewingNote, setViewingNote] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [toast, setToast] = useState(null);
  const [highlightDate, setHighlightDate] = useState(null);
  const [libraryTitle, setLibraryTitle] = useState('Библиотека');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [allTags, setAllTags] = useState([]);
  const [daysWithNotes, setDaysWithNotes] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);

  const [notes, setNotes] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [hasMoreDrafts, setHasMoreDrafts] = useState(true);
  const notesListRef = useRef(null);

  const notesRef = useRef(notes);
  const draftsRef = useRef(drafts);
  const searchQueryRef = useRef(searchQuery);
  const selectedDateRef = useRef(selectedDate);
  const selectedTagRef = useRef(selectedTag);

  useEffect(() => { notesRef.current = notes; }, [notes]);
  useEffect(() => { draftsRef.current = drafts; }, [drafts]);
  useEffect(() => { searchQueryRef.current = searchQuery; }, [searchQuery]);
  useEffect(() => { selectedDateRef.current = selectedDate; }, [selectedDate]);
  useEffect(() => { selectedTagRef.current = selectedTag; }, [selectedTag]);

  const loadMemora = useCallback(async (isDraft = false, append = false) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const currentList = isDraft ? draftsRef.current : notesRef.current;
      const q = searchQueryRef.current;
      const d = selectedDateRef.current;
      const t = selectedTagRef.current;
      const offset = (append && !q && !d && !t) ? currentList.length : 0;
      const loaded = await window.electronAPI?.getMemora(PAGE_SIZE, offset, isDraft, q, d, t);
      const shouldAppend = append && !q && !d && !t;
      if (isDraft) {
        setDrafts(shouldAppend ? [...draftsRef.current, ...loaded] : loaded);
        setHasMoreDrafts(loaded.length === PAGE_SIZE);
      } else {
        setNotes(shouldAppend ? [...notesRef.current, ...loaded] : loaded);
        setHasMore(loaded.length === PAGE_SIZE);
      }
    } catch (err) {
      console.error('Ошибка загрузки заметок:', err);
      setToast('Ошибка загрузки заметок');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const loadDaysWithNotes = useCallback(async () => {
    if (!storagePath) return;
    try {
      const allNotes = await window.electronAPI?.getMemora(1000, 0, false, '', null, null);
      const days = [...new Set(allNotes.map(n => {
        const d = new Date(n.created_at * 1000);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }))];
      setDaysWithNotes(days);
    } catch (err) {
      console.error('Ошибка загрузки дней:', err);
    }
  }, [storagePath]);

  useEffect(() => {
    if (storagePath) {
      loadMemora(false);
      loadMemora(true);
      window.electronAPI?.getAllTags().then(tags => setAllTags(tags || []));
      loadDaysWithNotes();
    }
  }, [storagePath]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop - clientHeight < 100 && !isLoading) {
      if (activeView === 'memora' && hasMore) loadMemora(false, true);
      else if (activeView === 'drafts' && hasMoreDrafts) loadMemora(true, true);
    }
  };

  useEffect(() => {
    setIsFiltering(true);
    const timer = setTimeout(() => {
      loadMemora(false);
      loadMemora(true);
      setTimeout(() => setIsFiltering(false), 300);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedDate, selectedTag]);

  useEffect(() => {
    const improperClose = localStorage.getItem('memora_improper_close');
    if (improperClose === 'true') {
      setNotifications([{
        id: 'improper-close',
        type: 'warning',
        title: 'Некорректное закрытие',
        message: 'Программа была закрыта некорректно. Несохраненные изменения могут быть потеряны.',
        date: new Date().toISOString(),
      }]);
      localStorage.removeItem('memora_improper_close');
    }
    localStorage.setItem('memora_improper_close', 'true');
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => localStorage.removeItem('memora_improper_close');
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    window.electronAPI?.onHotkeyNewNote?.(() => { if (viewMode === 'list') handleNewNote(); });
    window.electronAPI?.onHotkeySearch?.(() => { document.querySelector('.search-input-wrap input')?.focus(); });
    window.electronAPI?.onHotkeySettings?.(() => setShowSettings(true));
    window.electronAPI?.onHotkeyGraph?.(() => setShowGraph(true));
  }, [viewMode]);

  useEffect(() => {
    if (activeView === 'library') setLibraryTitle(Math.random() < 0.2 ? 'Библиотепка' : 'Библиотека');
  }, [activeView]);

  const getPageTitle = () => {
    switch (activeView) {
      case 'memora': return 'Мои заметки';
      case 'drafts': return 'Мои черновики';
      case 'library': return libraryTitle;
      case 'resources': return 'Ресурсы';
      case 'attachments': return 'Вложения';
      case 'notifications': return 'Уведомления';
      default: return 'Memora';
    }
  };

  const pageTitle = useMemo(() => getPageTitle(), [activeView, libraryTitle]);

  const handleNewNote = () => { setEditingNote(null); setViewMode('editor'); setHasUnsavedChanges(false); };
  const handleViewNote = (note) => { setViewingNote(note); setViewMode('view'); };
  const handleEditNote = (note) => { setEditingNote(note); setViewMode('editor'); setHasUnsavedChanges(false); };
  const handleBackRequest = () => { if (hasUnsavedChanges) setShowUnsavedModal(true); else handleBackToList(); };
  const handleBackToList = () => { setViewMode('list'); setViewingNote(null); setEditingNote(null); setHasUnsavedChanges(false); };
  const handleBackToView = () => { setViewMode('view'); setEditingNote(null); setHasUnsavedChanges(false); };

  const handleSaveNote = async (noteData, closeAfterSave = true) => {
    try {
      const saved = await window.electronAPI?.saveMemora(noteData);
      if (saved) {
        if (noteData.is_draft) {
          setDrafts(prev => {
            const idx = prev.findIndex(n => n.id === saved.id);
            if (idx >= 0) { const u = [...prev]; u[idx] = saved; return u; }
            return [saved, ...prev];
          });
        } else {
          setNotes(prev => {
            const idx = prev.findIndex(n => n.id === saved.id);
            if (idx >= 0) { const u = [...prev]; u[idx] = saved; return u; }
            return [saved, ...prev];
          });
          setViewingNote(saved);
        }
        setHasUnsavedChanges(false);
        setToast(noteData.is_draft ? 'Черновик сохранён' : 'Запись сохранена');
        window.electronAPI?.getAllTags().then(tags => setAllTags(tags || []));
        loadDaysWithNotes();
        if (closeAfterSave) {
          if (noteData.is_draft) handleBackToList();
          else handleBackToView();
        }
      }
    } catch (err) { console.error('Ошибка сохранения:', err); setToast('Ошибка сохранения'); }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await window.electronAPI?.deleteMemora(noteId);
      setNotes(prev => prev.filter(n => n.id !== noteId));
      setDrafts(prev => prev.filter(n => n.id !== noteId));
      setToast('Заметка удалена');
      window.electronAPI?.getAllTags().then(tags => setAllTags(tags || []));
      loadDaysWithNotes();
    } catch (err) { setToast('Ошибка удаления'); }
  };

  const handleUnsavedSave = () => {
    handleSaveNote({ id: editingNote?.id || Date.now().toString(), title: 'Без названия', content: '', tags: [], is_draft: false, is_pinned: false });
    setShowUnsavedModal(false);
    handleBackToList();
  };

  const handleUnsavedDraft = () => {
    handleSaveNote({ id: editingNote?.id || Date.now().toString(), title: 'Черновик', content: '', tags: [], is_draft: true, is_pinned: false });
    setShowUnsavedModal(false);
    setToast('Сохранено в черновики');
    handleBackToList();
  };

  const handleUnsavedDelete = () => { setHasUnsavedChanges(false); setShowUnsavedModal(false); setToast('Изменения отменены'); handleBackToList(); };
  const handleContextMenu = (x, y, note) => setContextMenu({ x, y, note });

  const handleContextAction = async (action, note) => {
    setContextMenu(null);
    if (action === 'edit') handleEditNote(note);
    else if (action === 'pin') { handleSaveNote({ ...note, is_pinned: !note.is_pinned }); setToast(note.is_pinned ? 'Заметка откреплена' : 'Заметка закреплена'); }
    else if (action === 'location') {
      if (note?.filename) {
        await window.electronAPI?.showItemInFolder(note.filename);
      }
    }
    else if (action === 'delete') handleDeleteNote(note.id);
  };

  const handleTagClick = (tag) => { setSelectedTag(tag); if (viewMode !== 'list') handleBackToList(); };
  const handleDateClick = (dateStr) => { setSelectedDate(dateStr); if (viewMode !== 'list') handleBackToList(); };
  const clearFilters = () => { setSearchQuery(''); setSelectedDate(null); setSelectedTag(null); };

  const sidePanelProps = {
    searchQuery,
    onSearchChange: setSearchQuery,
    onTagClick: handleTagClick,
    allTags,
    selectedDate,
    onDateClick: handleDateClick,
    selectedTag,
    onClearFilters: clearFilters,
    daysWithNotes
  };

  // РЕЖИМ ПРОСМОТРА
  if (viewMode === 'view' && viewingNote) {
    return (
      <>
        <TopBar subtitle={pageTitle} />
        <div className={`app-layout ${isVisible ? 'fade-in' : ''}`}>
          <IconSidebar activeView={activeView} onViewChange={(v) => { setActiveView(v); handleBackToList(); }} onSettingsClick={() => setShowSettings(true)} onGraphClick={() => setShowGraph(true)} />
          <SidePanel {...sidePanelProps} />
          <NoteView note={viewingNote} onEdit={() => handleEditNote(viewingNote)} onBack={handleBackToList} onContextMenu={handleContextMenu} onTagClick={handleTagClick} />
        </div>
        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
        {showGraph && <GraphModal onClose={() => setShowGraph(false)} />}
        {contextMenu && <ContextMenu x={contextMenu.x} y={contextMenu.y} note={contextMenu.note} onClose={() => setContextMenu(null)} onAction={handleContextAction} />}
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </>
    );
  }

  // РЕЖИМ РЕДАКТОРА
  if (viewMode === 'editor') {
    return (
      <>
        <TopBar subtitle="Редактор записи" />
        <div className={`app-layout ${isVisible ? 'fade-in' : ''}`}>
          <FullEditor note={editingNote} onSave={handleSaveNote} onBack={handleBackRequest} hasChanges={hasUnsavedChanges} onChangesUpdate={setHasUnsavedChanges} />
        </div>
        {showUnsavedModal && <UnsavedModal onSave={handleUnsavedSave} onDraft={handleUnsavedDraft} onDelete={handleUnsavedDelete} onClose={() => setShowUnsavedModal(false)} />}
        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
        {showGraph && <GraphModal onClose={() => setShowGraph(false)} />}
        {contextMenu && <ContextMenu x={contextMenu.x} y={contextMenu.y} note={contextMenu.note} onClose={() => setContextMenu(null)} onAction={handleContextAction} />}
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </>
    );
  }

  // ОСНОВНОЙ СПИСОК
  return (
    <>
      <TopBar subtitle={pageTitle} />
      <div className={`app-layout ${isVisible ? 'fade-in' : ''}`}>
        <IconSidebar activeView={activeView} onViewChange={setActiveView} onSettingsClick={() => setShowSettings(true)} onGraphClick={() => setShowGraph(true)} />
        <SidePanel {...sidePanelProps} />
        <div className="main-content-area">
          {(activeView === 'memora' || activeView === 'drafts') && (
            <div className="action-bar">
              <button className="action-btn primary" onClick={handleNewNote}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Написать запись...
              </button>
              <button className={`action-btn ${drafts.length > 0 ? '' : 'disabled'}`} onClick={() => drafts.length > 0 && setActiveView('drafts')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                Черновики{drafts.length > 0 ? ` (${drafts.length})` : ''}
              </button>
            </div>
          )}
          {activeView === 'memora' && (
            <div className={`notes-list ${isFiltering ? 'filtering' : ''}`} ref={notesListRef} onScroll={handleScroll}>
              {notes.map(note => (<NoteCard key={note.id} note={note} onClick={handleViewNote} onContextMenu={handleContextMenu} isPinned={note.is_pinned} />))}
              {notes.length === 0 && !isLoading && (<div className="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg><p>Нет заметок. Напишите первую!</p></div>)}
              {isLoading && (<div className="loading-more"><div className="spinner-small"></div><span>Загрузка...</span></div>)}
              {!hasMore && notes.length > 0 && (<div className="end-of-list">Вы просмотрели все заметки</div>)}
            </div>
          )}
          {activeView === 'drafts' && (
            <div className={`notes-list ${isFiltering ? 'filtering' : ''}`} ref={notesListRef} onScroll={handleScroll}>
              {drafts.map(note => (<NoteCard key={note.id} note={note} onClick={handleViewNote} onContextMenu={handleContextMenu} />))}
              {drafts.length === 0 && !isLoading && (<div className="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><p>Нет черновиков</p></div>)}
              {isLoading && (<div className="loading-more"><div className="spinner-small"></div><span>Загрузка...</span></div>)}
              {!hasMoreDrafts && drafts.length > 0 && (<div className="end-of-list">Вы просмотрели все черновики</div>)}
            </div>
          )}
          {activeView === 'library' && (<div className="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg><p>Библиотека пока в разработке</p></div>)}
          {activeView === 'resources' && (<div className="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/></svg><p>Здесь будут ваши ресурсы и ссылки</p></div>)}
          {activeView === 'attachments' && (<div className="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg><p>Здесь будут ваши вложения</p></div>)}
          {activeView === 'notifications' && (
            <div className="notifications-list">
              {notifications.length === 0 ? (<div className="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg><p>У вас нет новых уведомлений</p></div>) 
              : notifications.map(notif => (<div key={notif.id} className="notification-card"><div className="notification-icon warning"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div><div className="notification-content"><div className="notification-title">{notif.title}</div><div className="notification-message">{notif.message}</div></div></div>))}
            </div>
          )}
        </div>
      </div>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showGraph && <GraphModal onClose={() => setShowGraph(false)} />}
      {contextMenu && <ContextMenu x={contextMenu.x} y={contextMenu.y} note={contextMenu.note} onClose={() => setContextMenu(null)} onAction={handleContextAction} />}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
}