function UnsavedModal({ onSave, onDraft, onDelete, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal unsaved-modal" onClick={e => e.stopPropagation()}>
        <div className="unsaved-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        
        <h2 className="unsaved-title">Несохраненные изменения</h2>
        <p className="unsaved-message">
          У вас есть несохраненные изменения. Что вы хотите сделать?
        </p>

        <div className="unsaved-actions">
          <button className="unsaved-btn unsaved-btn-save" onClick={onSave}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            Сохранить
          </button>
          
          <button className="unsaved-btn unsaved-btn-draft" onClick={onDraft}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            В черновики
          </button>
          
          <button className="unsaved-btn unsaved-btn-delete" onClick={onDelete}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            Удалить
          </button>
        </div>

        <button className="unsaved-cancel" onClick={onClose}>
          Отмена
        </button>
      </div>
    </div>
  );
}