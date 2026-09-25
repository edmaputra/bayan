'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Scale, FileText, Bookmark, ChevronDown, ChevronRight, Hash } from 'lucide-react';
import { NoteType } from '@/lib/types';

interface NoteItem {
  slug: string;
  title: string;
  type?: NoteType;
  category?: string;
  tags?: string[];
  arabic?: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('/api/notes')
      .then((res) => res.json())
      .then((data) => setNotes(data))
      .catch((err) => console.error(err));
  }, []);

  const toggleSection = (section: string) => {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const sections: Array<{ key: NoteType; title: string; icon: React.ReactNode }> = [
    { key: 'concept', title: 'Ushul & Konsep', icon: <FileText className="w-4 h-4 text-sky-600" /> },
    { key: 'hukum', title: 'Hukum Syariat & Fiqih', icon: <Scale className="w-4 h-4 text-amber-600" /> },
    { key: 'dalil', title: 'Dalil (Qur\'an & Sunnah)', icon: <BookOpen className="w-4 h-4 text-emerald-600" /> },
    { key: 'kitab', title: 'Kitab & Referensi', icon: <Bookmark className="w-4 h-4 text-purple-600" /> },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)] text-sm">
      <div>
        <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-2">
          Katalog Pengetahuan
        </h3>

        <div className="space-y-4">
          {sections.map(({ key, title, icon }) => {
            const items = notes.filter((n) => n.type === key);
            const isCollapsed = collapsed[key];

            return (
              <div key={key} className="space-y-1">
                <button
                  onClick={() => toggleSection(key)}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition font-medium text-xs"
                >
                  <div className="flex items-center gap-2">
                    {icon}
                    <span>{title}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <span className="text-[10px]">{items.length}</span>
                    {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
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
        </div>
      </div>

      {/* Quick Tag Explorer */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
        <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5 px-2">
          Topik Populer
        </h3>
        <div className="flex flex-wrap gap-1.5 px-1">
          {['shalat', 'dalil', 'rukun', 'quran', 'hadits', 'syafii', 'fardhu-ain'].map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition"
            >
              <Hash className="w-3 h-3 text-slate-400" />
              {tag}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}
