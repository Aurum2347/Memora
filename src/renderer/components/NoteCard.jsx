function NoteCard({ note, onClick, onContextMenu, isPinned }) {
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин. назад`;
    if (hours < 24) return `${hours} ч. назад`;
    if (days < 7) return `${days} дн. назад`;
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <div
      className={`note-card ${isPinned ? 'pinned' : ''}`}
      onClick={() => onClick(note)}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu(e.clientX, e.clientY, note);
      }}
    >
      <div className="note-header">
        <span className="note-time">{formatDate(note?.created_at)}</span>
        {isPinned && <span className="pin-indicator"></span>}
      </div>
      <div className="note-title">{note?.title || 'Без названия'}</div>
      <div className="note-body">{note?.content}</div>
      {note?.tags && note.tags.length > 0 && (
        <div className="note-tags">
          {note.tags.map((tag, i) => (
            <span key={i} className="note-tag">#{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}