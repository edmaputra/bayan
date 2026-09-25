import React from 'react';
import { notFound } from 'next/navigation';
import { getNoteBySlug } from '@/lib/notes';
import NoteEditor from '@/components/NoteEditor';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function EditNotePage({ params }: Props) {
  const { slug } = await params;
  const note = getNoteBySlug(slug);

  if (!note) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Edit Catatan: {note.title}
        </h1>
        <p className="text-xs text-slate-500">
          Perubahan akan langsung disimpan ke file Markdown di folder content/.
        </p>
      </div>

      <NoteEditor
        initialSlug={note.slug}
        initialMetadata={note.metadata}
        initialContent={note.content}
        isNew={false}
      />
    </div>
  );
}
