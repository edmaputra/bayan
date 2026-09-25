'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  ChevronRight,
  Hash,
  Folder,
  FolderOpen,
  Plus,
  Search,
  Layers,
  Settings,
  Tag as TagIcon,
} from 'lucide-react';
import { NoteType, NoteTypeDefinition } from '@/lib/types';
import TypeIcon from './TypeIcon';

interface NoteItem {
  slug: string;
  filePath?: string;
  title: string;
  type?: NoteType;
  category?: string;
  tags?: string[];
  arabic?: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [typeDefs, setTypeDefs] = useState<NoteTypeDefinition[]>([]);
  const [viewMode, setViewMode] = useState<'category' | 'type'>('category');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
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
  }, []);

  const toggleSection = (section: string) => {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Filter notes by search query if any
  const filteredNotes = useMemo(() => {
    if (!searchFilter.trim()) return notes;
    const q = searchFilter.toLowerCase().trim();
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        (n.category && n.category.toLowerCase().includes(q)) ||
        (n.tags && n.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }, [notes, searchFilter]);

  // Dynamic tags aggregation
  const dynamicTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const note of notes) {
      if (note.tags && Array.isArray(note.tags)) {
        for (const t of note.tags) {
          const clean = t.trim().toLowerCase();
          if (clean) {
            counts.set(clean, (counts.get(clean) || 0) + 1);
          }
        }
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [notes]);

  // Grouping by Category
  const categoryGroups = useMemo(() => {
    const groups = new Map<string, NoteItem[]>();
    for (const note of filteredNotes) {
      const cat = note.category?.trim() || 'Tanpa Kategori';
      if (!groups.has(cat)) {
        groups.set(cat, []);
      }
      groups.get(cat)!.push(note);
    }
    return Array.from(groups.entries()).sort((a, b) => {
      if (a[0] === 'Tanpa Kategori') return 1;
      if (b[0] === 'Tanpa Kategori') return -1;
      return a[0].localeCompare(b[0]);
    });
  }, [filteredNotes]);

  // Helper map for type definitions
  const typeMap = useMemo(() => {
    const map = new Map<string, NoteTypeDefinition>();
    for (const td of typeDefs) {
      map.set(td.key.toLowerCase(), td);
    }
    return map;
  }, [typeDefs]);

  const getTypeDotColor = (type?: NoteType) => {
    if (!type) return '#94a3b8';
    const def = typeMap.get(type.toLowerCase());
    return def ? def.color : '#94a3b8';
  };

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-4rem)] text-sm select-none">
      {/* Action: New Note Button */}
      <Link
        href="/notes/new"
        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition"
      >
        <Plus className="w-4 h-4" />
        <span>Catatan Baru</span>
      </Link>

      {/* View Mode Toggle: Category vs Type */}
      <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-medium">
        <button
          type="button"
          onClick={() => setViewMode('category')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition ${
            viewMode === 'category'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Folder className="w-3.5 h-3.5" />
          <span>Kategori</span>
        </button>
        <button
          type="button"
          onClick={() => setViewMode('type')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition ${
            viewMode === 'type'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Tipe</span>
        </button>
      </div>

      {/* Quick Filter Search */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Saring catatan..."
          className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-emerald-500"
        />
      </div>

      {/* Main Groups */}
      <div className="space-y-3">
        {viewMode === 'category' ? (
          /* Category Mode */
          categoryGroups.length === 0 ? (
            <div className="text-xs text-slate-400 text-center py-4 italic">
              Tidak ada catatan ditemukan
            </div>
          ) : (
            categoryGroups.map(([cat, items]) => {
              const isCollapsed = collapsed[cat];
              return (
                <div key={cat} className="space-y-1">
                  <button
                    onClick={() => toggleSection(cat)}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition font-medium text-xs group"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {isCollapsed ? (
                        <Folder className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition shrink-0" />
                      ) : (
                        <FolderOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      )}
                      <span className="truncate">{cat}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 shrink-0 ml-1">
                      <span className="text-[10px]">{items.length}</span>
                      {isCollapsed ? (
                        <ChevronRight className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </button>

                  {!isCollapsed && (
                    <div className="pl-4 space-y-0.5 border-l border-slate-100 dark:border-slate-800 ml-3">
                      {items.map((item) => {
                        const isActive = pathname === `/notes/${item.slug}`;
                        return (
                          <Link
                            key={item.slug}
                            href={`/notes/${item.slug}`}
                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition truncate ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-800 font-semibold dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: getTypeDotColor(item.type) }}
                            />
                            <span className="truncate">{item.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )
        ) : (
          /* Dynamic Type Mode */
          <>
            {typeDefs.map((t) => {
              const items = filteredNotes.filter(
                (n) => (n.type || '').toLowerCase() === t.key.toLowerCase()
              );
              const isCollapsed = collapsed[t.key];

              return (
                <div key={t.key} className="space-y-1">
                  <button
                    onClick={() => toggleSection(t.key)}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition font-medium text-xs group"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div style={{ color: t.color }}>
                        <TypeIcon name={t.icon} className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">{t.label}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 shrink-0 ml-1">
                      <span className="text-[10px]">{items.length}</span>
                      {isCollapsed ? (
                        <ChevronRight className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </button>

                  {!isCollapsed && (
                    <div className="pl-6 space-y-0.5 border-l border-slate-100 dark:border-slate-800 ml-3">
                      {items.length === 0 ? (
                        <div className="text-xs text-slate-400 py-1 italic">Belum ada catatan</div>
                      ) : (
                        items.map((item) => {
                          const isActive = pathname === `/notes/${item.slug}`;
                          return (
                            <Link
                              key={item.slug}
                              href={`/notes/${item.slug}`}
                              className={`block px-2.5 py-1.5 rounded-lg text-xs transition truncate ${
                                isActive
                                  ? 'bg-emerald-50 text-emerald-800 font-semibold dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200'
                              }`}
                            >
                              {item.title}
                            </Link>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Other / Unclassified Notes */}
            {(() => {
              const knownKeys = new Set(typeDefs.map((t) => t.key.toLowerCase()));
              const otherItems = filteredNotes.filter(
                (n) => !n.type || !knownKeys.has(n.type.toLowerCase())
              );
              if (otherItems.length === 0) return null;
              const isCollapsed = collapsed['other'];

              return (
                <div key="other" className="space-y-1">
                  <button
                    onClick={() => toggleSection('other')}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition font-medium text-xs group"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <TagIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">Lainnya / Tanpa Tipe</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 shrink-0 ml-1">
                      <span className="text-[10px]">{otherItems.length}</span>
                      {isCollapsed ? (
                        <ChevronRight className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </button>

                  {!isCollapsed && (
                    <div className="pl-6 space-y-0.5 border-l border-slate-100 dark:border-slate-800 ml-3">
                      {otherItems.map((item) => {
                        const isActive = pathname === `/notes/${item.slug}`;
                        return (
                          <Link
                            key={item.slug}
                            href={`/notes/${item.slug}`}
                            className={`block px-2.5 py-1.5 rounded-lg text-xs transition truncate ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-800 font-semibold dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                          >
                            {item.title}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}
          </>
        )}
      </div>

      {/* Dynamic Tag Explorer */}
      {dynamicTags.length > 0 && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Topik &amp; Tag
            </h3>
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="text-[10px] text-emerald-600 hover:underline"
              >
                Reset
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 px-0.5">
            {dynamicTags.map(([tag, count]) => {
              const isSelected = searchFilter.toLowerCase() === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSearchFilter(isSelected ? '' : tag)}
                  className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md transition ${
                    isSelected
                      ? 'bg-emerald-600 text-white font-medium'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Hash className="w-3 h-3 opacity-60" />
                  <span>{tag}</span>
                  <span className="text-[9px] opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Settings / Manage Types Link */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
        <Link
          href="/settings"
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition"
        >
          <Settings className="w-3.5 h-3.5 text-slate-400" />
          <span>Kelola Tipe &amp; Taksonomi</span>
        </Link>
      </div>
    </aside>
  );
}
