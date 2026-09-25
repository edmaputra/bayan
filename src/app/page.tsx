import Link from 'next/link';
import { getAllNotes } from '@/lib/notes';
import { getNoteTypes } from '@/lib/note-types';
import GraphCanvas from '@/components/GraphCanvas';
import TypeIcon from '@/components/TypeIcon';
import { FileText, ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
  const notes = getAllNotes();
  const types = getNoteTypes();

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-950 text-white p-8 md:p-12 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Islamic Knowledge Graph & Encyclopedia</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Menelusuri Hukum & Dalil Secara Terhubung
          </h1>

          <p className="text-emerald-100/80 text-sm md:text-base leading-relaxed">
            Sistem ensiklopedia interaktif yang memetakan relasi antara konsep Islam, rincian hukum syariat, ayat Al-Qur&apos;an, hadits shahih, dan pandangan para ulama.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href={notes.length > 0 ? `/notes/${notes[0].slug}` : '/notes/new'}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition shadow-lg shadow-emerald-500/30"
            >
              <span>{notes.length > 0 ? 'Mulai Jelajah Catatan' : 'Buat Catatan Pertama'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/graph"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm backdrop-blur-md border border-white/10 transition"
            >
              <span>Buka Peta Graf Lengkap</span>
            </Link>
          </div>
        </div>

        {/* Subtle Arabic Calligraphy Background */}
        <div
          className="absolute -right-8 -bottom-16 text-emerald-500/10 text-9xl font-serif select-none pointer-events-none"
          dir="rtl"
        >
          بَيَان
        </div>
      </section>

      {/* Interactive Knowledge Graph Preview */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Peta Keterhubungan Pengetahuan</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Setiap lingkaran adalah catatan. Garis menandakan hubungan dalil, hukum, dan konsep. Klik untuk menjelajah!
            </p>
          </div>
          <Link
            href="/graph"
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            Layar Penuh →
          </Link>
        </div>

        <GraphCanvas height={380} />
      </section>

      {/* Category Stats Grid */}
      <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {types.map((t) => {
          const count = notes.filter(
            (n) => (n.metadata.type || '').toLowerCase() === t.key.toLowerCase()
          ).length;
          return (
            <div
              key={t.key}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                style={{ backgroundColor: t.color }}
              >
                <TypeIcon name={t.icon} className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{count}</div>
                <div className="text-xs text-slate-500 truncate" title={t.label}>
                  {t.label}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Featured / Recent Notes List */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Daftar Catatan Utama
        </h2>

        {notes.length === 0 ? (
          <div className="text-center py-12 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Belum ada catatan</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Mulai bangun Knowledge Graph Anda dengan menambahkan konsep syariat, ayat Al-Qur&apos;an, atau rujukan fiqih.
            </p>
            <Link
              href="/notes/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition"
            >
              + Buat Catatan Pertama
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.map((note) => (
              <Link
                key={note.slug}
                href={`/notes/${note.slug}`}
                className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-600 transition shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {note.metadata.category || note.metadata.type}
                    </span>
                    {note.metadata.arabic && (
                      <span className="font-serif text-sm text-emerald-700 dark:text-emerald-400" dir="rtl">
                        {note.metadata.arabic}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                    {note.title}
                  </h3>

                  {note.metadata.summary && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                      {note.metadata.summary}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-400">
                  <span>{note.outgoingLinks.length} tautan keluar</span>
                  <span>{note.backlinks.length} dirujuk</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
