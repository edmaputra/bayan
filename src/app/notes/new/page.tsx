import React from 'react';
import NoteEditor from '@/components/NoteEditor';

export default function NewNotePage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Buat Catatan Baru
        </h1>
        <p className="text-xs text-slate-500">
          Tambahkan konsep hukum, dalil baru, atau rujukan kitab ke dalam Knowledge Graph.
        </p>
      </div>

      <NoteEditor isNew={true} />
    </div>
  );
}
