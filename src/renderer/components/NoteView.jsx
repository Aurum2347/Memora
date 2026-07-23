function NoteView({ note, onEdit, onBack, onContextMenu, onTagClick }) {
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const htmlContent = typeof marked !== 'undefined' ? marked.parse(note?.content || '', { breaks: true }) : (note?.content || '');

  return (
    <div className="note-view">
      <div className="note-view-header">
        <button className="back-btn" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          Назад
        </button>
        <button 
          className="edit-btn"
          onClick={onEdit}
          onContextMenu={(e) => {
            e.preventDefault();
            onContextMenu(e.clientX, e.clientY, note);
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Редактировать
        </button>
      </div>

      <div className="note-view-content">
        <div className="note-view-meta">
          <span className="note-view-date">{formatDate(note?.created_at)}</span>
          {note?.is_pinned && (
            <span className="note-view-pinned">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              Закреплено
            </span>
          )}
        </div>

        <h1 className="note-view-title">{note?.title || 'Без названия'}</h1>

        <div 
          className="note-view-body markdown-body" 
          dangerouslySetInnerHTML={{ __html: htmlContent }} 
        />

        {note?.tags && note.tags.length > 0 && (
          <div className="note-view-tags">
            {note.tags.map(tag => (
              <span 
                key={tag} 
                className="note-view-tag clickable"
                onClick={() => onTagClick && onTagClick(tag)}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}