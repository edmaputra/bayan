import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getNoteBySlug } from '@/lib/notes';
import MarkdownViewer from '@/components/MarkdownViewer';
import GraphCanvas from '@/components/GraphCanvas';
import { Edit3, ArrowLeft, BookOpen, Scale, FileText, Bookmark, Share2 } from 'lucide-react';
import { NoteType } from '@/lib/types';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function NotePage({ params }: Props) {
  const { slug } = await params;
  const note = getNoteBySlug(slug);

  if (!note) {
    notFound();
  }

  const getTypeBadge = (type?: NoteType) => {
    switch (type) {
      case 'dalil':
        return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"><BookOpen className="w-3.5 h-3.5" /> Dalil Syariat</span>;
      case 'hukum':
        return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"><Scale className="w-3.5 h-3.5" /> Hukum Fiqih</span>;
      case 'kitab':
        return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"><Bookmark className="w-3.5 h-3.5" /> Kitab Rujukan</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300"><FileText className="w-3.5 h-3.5" /> Konsep Pokok</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-16">
      {/* Main Content Column */}
      <div className="lg:col-span-8 space-y-6">
        {/* Navigation Breadcrumb / Top Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>

          <Link
            href={`/notes/${note.slug}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-800 transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Catatan</span>
          </Link>
        </div>

        {/* Note Header Card */}
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {getTypeBadge(note.metadata.type)}
            {note.metadata.category && (
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {note.metadata.category}
              </span>
            )}
            {note.metadata.grade && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950 dark:text-teal-300">
                {note.metadata.grade}
              </span>
            )}
            {note.metadata.status_hukum && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300">
                {note.metadata.status_hukum}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
            {note.title}
          </h1>

          {/* Large Arabic Banner if provided */}
          {note.metadata.arabic && (
            <div
              className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 text-right"
              dir="rtl"
            >
              <span className="font-serif text-2xl md:text-3xl text-emerald-900 dark:text-emerald-200 font-medium leading-relaxed block">
                {note.metadata.arabic}
              </span>
            </div>
          )}

          {note.metadata.translation && (
            <p className="text-sm italic text-slate-600 dark:text-slate-400">
              &quot;{note.metadata.translation}&quot;
            </p>
          )}

          {/* Metadata Grid */}
          {(note.metadata.reference || note.metadata.narrator || note.metadata.author || note.metadata.madzhab) && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              {note.metadata.reference && (
                <div>
                  <span className="text-slate-400 block">Referensi:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{note.metadata.reference}</span>
                </div>
              )}
              {note.metadata.narrator && (
                <div>
                  <span className="text-slate-400 block">Perawi:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{note.metadata.narrator}</span>
                </div>
              )}
              {note.metadata.author && (
                <div>
                  <span className="text-slate-400 block">Penyusun:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{note.metadata.author}</span>
                </div>
              )}
              {note.metadata.madzhab && (
                <div>
                  <span className="text-slate-400 block">Madzhab:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{note.metadata.madzhab}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Note Markdown Body */}
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <MarkdownViewer content={note.content} />
        </div>
      </div>

      {/* Right Column: Local Graph & Backlinks */}
      <div className="lg:col-span-4 space-y-6">
        {/* Local Graph View */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Peta Relasi Catatan Ini
            </h3>
            <span className="text-[11px] text-slate-400">Interaktif</span>
          </div>
          <GraphCanvas height={240} highlightSlug={note.slug} />
        </div>

        {/* Backlinks Card (Catatan yang merujuk ke sini) */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
            <span>Dirujuk Oleh ({note.backlinks.length})</span>
            <span className="text-[10px] text-slate-400 uppercase font-mono">Backlinks</span>
          </h3>

          {note.backlinks.length === 0 ? (
            <p className="text-xs text-slate-400 italic">
              Belum ada catatan lain yang menautkan ke halaman ini.
            </p>
          ) : (
            <div className="space-y-2">
              {note.backlinks.map((bl) => (
                <Link
                  key={bl.slug}
                  href={`/notes/${bl.slug}`}
                  className="block p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 transition">
                      {bl.title}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
                      {bl.type || 'note'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Outgoing Links Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
            <span>Tautan Keluar ({note.outgoingLinks.length})</span>
            <span className="text-[10px] text-slate-400 uppercase font-mono">Outgoing</span>
          </h3>

          {note.outgoingLinks.length === 0 ? (
            <p className="text-xs text-slate-400 italic">
              Tidak ada tautan [[...]] di catatan ini.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {note.outgoingLinks.map((target) => (
                <Link
                  key={target}
                  href={`/notes/${target}`}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-950 hover:text-emerald-800 transition"
                >
                  {target.replace(/-/g, ' ')}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
