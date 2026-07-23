import path from 'path';
import fs from 'fs';

const INDEX_FILE = 'memora-index.json';

export interface NoteMeta {
  id: string;
  filename: string;
  title: string;
  tags: string[];
  created_at: number;
  updated_at: number;
  is_draft: boolean;
  is_pinned: boolean;
}

function getIndexFilePath(storagePath: string): string {
  return path.join(storagePath, INDEX_FILE);
}

function readIndex(storagePath: string): NoteMeta[] {
  const indexPath = getIndexFilePath(storagePath);
  if (!fs.existsSync(indexPath)) return [];
  try {
    return JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  } catch (e) {
    return [];
  }
}

function writeIndex(storagePath: string, index: NoteMeta[]): void {
  fs.writeFileSync(getIndexFilePath(storagePath), JSON.stringify(index, null, 2), 'utf-8');
}

export function getAllTags(storagePath: string | null) {
  if (!storagePath) return [];
  const index = readIndex(storagePath);
  const tagCounts: Record<string, number> = {};
  
  index.forEach(note => {
    note.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  return Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function getMemos(
  storagePath: string | null, 
  limit: number = 10, 
  offset: number = 0, 
  isDraft: boolean = false, 
  searchQuery: string = '',
  targetDate: string | null = null,
  selectedTag: string | null = null
) {
  if (!storagePath) return [];
  let filtered = readIndex(storagePath).filter(note => note.is_draft === isDraft);
  
  // Фильтр по дате
  if (targetDate) {
    const target = new Date(targetDate).toDateString();
    filtered = filtered.filter(note => new Date(note.created_at * 1000).toDateString() === target);
  }

  // Фильтр по тегу
  if (selectedTag) {
    filtered = filtered.filter(note => note.tags.includes(selectedTag));
  }

  // Фильтр по поисковому запросу
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(note => {
      const titleMatch = note.title.toLowerCase().includes(q);
      const tagMatch = note.tags.some(t => t.toLowerCase().includes(q));
      if (titleMatch || tagMatch) return true;
      
      const filePath = path.join(storagePath, note.filename);
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf-8').toLowerCase().includes(q);
      }
      return false;
    });
  }
  
  filtered.sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
    return b.updated_at - a.updated_at;
  });

  const paginated = filtered.slice(offset, offset + limit);
  
  return paginated.map(meta => {
    const filePath = path.join(storagePath, meta.filename);
    let content = '';
    if (fs.existsSync(filePath)) {
      content = fs.readFileSync(filePath, 'utf-8');
    }
    return { ...meta, content };
  });
}

export function saveMemo(storagePath: string | null, memo: any) {
  if (!storagePath) return null;
  const index = readIndex(storagePath);
  const now = Math.floor(Date.now() / 1000);
  
  let meta: NoteMeta;
  const existingIndex = index.findIndex(n => n.id === memo.id);
  
  if (existingIndex >= 0) {
    meta = { ...index[existingIndex] };
  } else {
    meta = {
      id: memo.id || Date.now().toString(),
      filename: `${memo.id || Date.now()}.md`,
      title: memo.title || 'Без названия',
      tags: memo.tags || [],
      created_at: memo.created_at || now,
      updated_at: now,
      is_draft: memo.is_draft || false,
      is_pinned: memo.is_pinned || false
    };
  }

  meta.title = memo.title || meta.title || 'Без названия';
  meta.tags = memo.tags || [];
  meta.updated_at = now;
  meta.is_draft = memo.is_draft !== undefined ? memo.is_draft : meta.is_draft;
  meta.is_pinned = memo.is_pinned !== undefined ? memo.is_pinned : meta.is_pinned;

  if (existingIndex >= 0) index[existingIndex] = meta;
  else index.push(meta);

  fs.writeFileSync(path.join(storagePath, meta.filename), memo.content || '', 'utf-8');
  writeIndex(storagePath, index);

  return { ...meta, content: memo.content || '' };
}

export function deleteMemo(storagePath: string | null, id: string) {
  if (!storagePath) return;
  const index = readIndex(storagePath);
  const noteIndex = index.findIndex(n => n.id === id);
  
  if (noteIndex >= 0) {
    const meta = index[noteIndex];
    const filePath = path.join(storagePath, meta.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    index.splice(noteIndex, 1);
    writeIndex(storagePath, index);
  }
}