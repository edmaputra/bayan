'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { NoteType, NoteTypeDefinition } from '@/lib/types';
import TypeIcon from './TypeIcon';

interface NoteItem {
  slug: string;
  title: string;
  type?: NoteType;
  category?: string;
  summary?: string;
  arabic?: string;
  tags?: string[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [typeDefs, setTypeDefs] = useState<NoteTypeDefinition[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/notes')
      .then((res) => res.json())
      .then((data: NoteItem[]) => {
        if (Array.isArray(data)) {
          setNotes(data);
        }
      })
      .catch((err) => console.error(err));

    fetch('/api/types')
      .then((res) => res.json())
      .then((data: NoteTypeDefinition[]) => {
        if (Array.isArray(data)) {
          setTypeDefs(data);
        }
      })
      .catch((err) => console.error(err));
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setQuery('');
    setSelectedIndex(0);
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleClose();
      }
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  const filteredNotes = useMemo(() => {
    const q = query.toLowerCase().trim();
    return notes.filter((n) => {
      if (selectedType !== 'all' && n.type !== selectedType) return false;
      if (!q) return true;
      return (
        n.title.toLowerCase().includes(q) ||
        (n.summary && n.summary.toLowerCase().includes(q)) ||
        (n.arabic && n.arabic.includes(q)) ||
        (n.tags && n.tags.some((t) => t.toLowerCase().includes(q)))
      );
    });
  }, [notes, query, selectedType]);

  const handleSelect = (slug: string) => {
    handleClose();
    router.push(`/notes/${slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredNotes.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredNotes.length) % (filteredNotes.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredNotes[selectedIndex]) {
        handleSelect(filteredNotes[selectedIndex].slug);
      }
    }
  };

  if (!isOpen) return null;

  const getTypeDefinition = (type?: NoteType) => {
    if (!type) return null;
    return typeDefs.find((t) => t.key.toLowerCase() === type.toLowerCase());
  };

  const getTypeIcon = (type?: NoteType) => {
    const def = getTypeDefinition(type);
    return (
      <div style={{ color: def?.color || '#0284c7' }}>
        <TypeIcon name={def?.icon || 'FileText'} className="w-4 h-4" />
      </div>
    );
  };

  const getTypeBadge = (type?: NoteType) => {
    const def = getTypeDefinition(type);
    return (
      <span
        className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white shadow-xs"
        style={{ backgroundColor: def?.color || '#0284c7' }}
      >
        {def?.label || type || 'Konsep'}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-sm">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[75vh] animate-in fade-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Cari dalil, rukun, hadits, kitab, ayat..."
            className="flex-1 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none text-base"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">ESC</kbd>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 text-xs overflow-x-auto">
          <button
            onClick={() => {
              setSelectedType('all');
              setSelectedIndex(0);
            }}
            className={`px-3 py-1 rounded-full font-medium transition shrink-0 ${
              selectedType === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            Semua
          </button>
          {typeDefs.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setSelectedType(t.key);
                setSelectedIndex(0);
              }}
              className={`px-3 py-1 rounded-full font-medium transition shrink-0 ${
                selectedType === t.key
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
          <span className="ml-auto text-slate-400 text-xs pr-1 shrink-0">
            {filteredNotes.length} hasil
          </span>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-1">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              Tidak ada catatan atau dalil yang cocok dengan &quot;{query}&quot;
            </div>
          ) : (
            filteredNotes.map((note, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={note.slug}
                  onClick={() => handleSelect(note.slug)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60'
                      : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
                    {getTypeIcon(note.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">
                        {note.title}
                      </h4>
                      {getTypeBadge(note.type)}
                      {note.arabic && (
                        <span className="ml-auto font-serif text-sm text-emerald-700 dark:text-emerald-400" dir="rtl">
                          {note.arabic}
                        </span>
                      )}
                    </div>
                    {note.summary && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {note.summary}
                      </p>
                    )}
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {note.tags.map((t) => (
                          <span key={t} className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
