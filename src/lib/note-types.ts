import fs from 'fs';
import path from 'path';
import { NoteTypeDefinition } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const TYPES_FILE = path.join(DATA_DIR, 'note-types.json');

export const DEFAULT_NOTE_TYPES: NoteTypeDefinition[] = [
  {
    key: 'concept',
    label: 'Ushul & Konsep',
    icon: 'FileText',
    color: '#0284c7',
    description: 'Prinsip pokok, kaidah ushul fiqih, atau definisi konseptual',
  },
  {
    key: 'hukum',
    label: 'Hukum Syariat & Fiqih',
    icon: 'Scale',
    color: '#d97706',
    description: 'Ketetapan hukum syar\'i (wajib, sunnah, mubah, makruh, haram)',
  },
  {
    key: 'dalil',
    label: 'Dalil (Qur\'an & Sunnah)',
    icon: 'BookOpen',
    color: '#059669',
    description: 'Ayat Al-Qur\'an, Hadits Nabi, atau riwayat atsari',
  },
  {
    key: 'kitab',
    label: 'Kitab & Referensi',
    icon: 'Bookmark',
    color: '#7c3aed',
    description: 'Rujukan kitab turats klasik, kitab kontemporer, atau karya ulama',
  },
  {
    key: 'tokoh',
    label: 'Tokoh & Ulama',
    icon: 'Users',
    color: '#e11d48',
    description: 'Biografi sahabat, imam madzhab, perawi, dan fuqaha',
  },
];

export function getNoteTypes(): NoteTypeDefinition[] {
  if (!fs.existsSync(TYPES_FILE)) {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TYPES_FILE, JSON.stringify(DEFAULT_NOTE_TYPES, null, 2), 'utf8');
    return DEFAULT_NOTE_TYPES;
  }

  try {
    const raw = fs.readFileSync(TYPES_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_NOTE_TYPES;
  } catch (err) {
    console.error('Error reading note types from file, fallback to default:', err);
    return DEFAULT_NOTE_TYPES;
  }
}

export function saveNoteTypes(types: NoteTypeDefinition[]): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(TYPES_FILE, JSON.stringify(types, null, 2), 'utf8');
}

export function addNoteType(type: NoteTypeDefinition): NoteTypeDefinition {
  const current = getNoteTypes();
  const safeKey = type.key.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  
  if (!safeKey) {
    throw new Error('Kode tipe (key) tidak boleh kosong');
  }

  if (current.some((t) => t.key.toLowerCase() === safeKey)) {
    throw new Error(`Tipe dengan kode "${safeKey}" sudah ada`);
  }

  const newType: NoteTypeDefinition = {
    key: safeKey,
    label: type.label.trim(),
    icon: type.icon || 'FileText',
    color: type.color || '#0284c7',
    description: type.description?.trim() || '',
  };

  current.push(newType);
  saveNoteTypes(current);
  return newType;
}

export function updateNoteType(key: string, updates: Partial<NoteTypeDefinition>): NoteTypeDefinition {
  const current = getNoteTypes();
  const index = current.findIndex((t) => t.key.toLowerCase() === key.toLowerCase());

  if (index === -1) {
    throw new Error(`Tipe dengan kode "${key}" tidak ditemukan`);
  }

  const existing = current[index];
  const updated: NoteTypeDefinition = {
    ...existing,
    label: updates.label ? updates.label.trim() : existing.label,
    icon: updates.icon || existing.icon,
    color: updates.color || existing.color,
    description: updates.description !== undefined ? updates.description.trim() : existing.description,
  };

  current[index] = updated;
  saveNoteTypes(current);
  return updated;
}

export function deleteNoteType(key: string): boolean {
  const current = getNoteTypes();
  const filtered = current.filter((t) => t.key.toLowerCase() !== key.toLowerCase());

  if (filtered.length === current.length) {
    throw new Error(`Tipe dengan kode "${key}" tidak ditemukan`);
  }

  if (filtered.length === 0) {
    throw new Error('Tidak dapat menghapus semua tipe. Minimal harus ada 1 tipe catatan.');
  }

  saveNoteTypes(filtered);
  return true;
}
