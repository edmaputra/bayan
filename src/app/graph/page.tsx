'use client';

import React from 'react';
import Link from 'next/link';
import GraphCanvas from '@/components/GraphCanvas';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function FullscreenGraphPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] space-y-3 pb-4">
      {/* Header bar */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </Link>
          <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800"></div>
          <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Peta Relasi Pengetahuan (Knowledge Graph)</span>
          </h1>
        </div>

        <p className="hidden md:block text-xs text-slate-400">
          Scroll untuk Zoom in/out • Klik &amp; Drag pada node untuk memindahkan • Klik node untuk membuka catatan
        </p>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 w-full relative">
        <GraphCanvas fullScreen={true} />
      </div>
    </div>
  );
}
