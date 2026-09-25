'uselink';
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Plus, Network, Settings } from 'lucide-react';
import CommandPalette from './CommandPalette';

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition">
              <span className="font-serif font-bold text-xl leading-none">ب</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 dark:text-slate-100 tracking-tight">
                  BAYAN
                </span>
                <span className="font-serif text-sm text-emerald-600 dark:text-emerald-400 font-semibold" dir="rtl">
                  البيان
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 -mt-0.5">
                Ensiklopedia & Graph Pengetahuan Islam
              </p>
            </div>
          </Link>

          {/* Center Search Trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="hidden md:flex items-center gap-3 w-80 px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-600 dark:hover:text-slate-200 transition shadow-xs"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span className="flex-1 text-left">Cari dalil, rukun, hadits...</span>
            <kbd className="text-[10px] bg-white dark:bg-slate-700 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600 text-slate-500">
              ⌘K
            </kbd>
          </button>

          {/* Action Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link
              href="/graph"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
            >
              <Network className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Peta Graph</span>
            </Link>

            <Link
              href="/settings"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
              title="Pengaturan Tipe & Taksonomi"
            >
              <Settings className="w-4 h-4" />
            </Link>

            <Link
              href="/notes/new"
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/30 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Catatan</span>
            </Link>
          </div>
        </div>
      </header>

      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
