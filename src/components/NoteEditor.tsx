'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NoteMetadata, NoteType, NoteTypeDefinition } from '@/lib/types';
import MarkdownViewer from './MarkdownViewer';
import { Save, ArrowLeft, Eye, Edit3, Link as LinkIcon, Quote } from 'lucide-react';

interface Props {
  initialSlug?: string;
  initialMetadata?: NoteMetadata;
  initialContent?: string;
  isNew?: boolean;
}

export default function NoteEditor({
  initialSlug = '',
  initialMetadata,
  initialContent = '',
  isNew = false,
}: Props) {
  const router = useRouter();

  const [slug] = useState(initialSlug);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [availableTypes, setAvailableTypes] = useState<NoteTypeDefinition[]>([]);
  const [metadata, setMetadata] = useState<NoteMetadata>(
    initialMetadata || {
      title: '',
      type: 'concept',
      category: '',
      arabic: '',
      tags: [],
      summary: '',
      source_type: 'Al-Qur\'an',
      grade: 'Shahih',
      reference: '',
      status_hukum: 'Wajib',
    }
  );
  const [content, setContent] = useState(initialContent);
  const [tagInput, setTagInput] = useState(initialMetadata?.tags?.join(', ') || '');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    fetch('/api/notes')
      .then((res) => res.json())
      .then((data: Array<{ category?: string }>) => {
        if (Array.isArray(data)) {
          const cats = Array.from(
            new Set(data.map((d) => d.category?.trim()).filter((c): c is string => Boolean(c)))
          ).sort();
          setExistingCategories(cats);
        }
      })
      .catch((err) => console.error(err));

    fetch('/api/types')
      .then((res) => res.json())
      .then((typesData: NoteTypeDefinition[]) => {
        if (Array.isArray(typesData)) {
          setAvailableTypes(typesData);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleMetadataChange = <K extends keyof NoteMetadata>(key: K, val: NoteMetadata[K]) => {
    setMetadata((prev) => ({ ...prev, [key]: val }));
  };

  const insertText = (before: string, after: string = '') => {
    const textarea = document.getElementById('note-content-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = before + (selected || 'teks') + after;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!metadata.title.trim()) {
      alert('Judul catatan wajib diisi!');
      return;
    }

    setSaving(true);
    try {
      const tagsArray = tagInput
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const targetSlug = isNew
        ? metadata.title.trim().replace(/[\\/:\*\?"<>\|]/g, '').replace(/\s+/g, '-')
        : slug;

      const payload = {
        slug: targetSlug,
        metadata: {
          ...metadata,
          tags: tagsArray,
        },
        content,
      };

      const res = await fetch(isNew ? '/api/notes' : `/api/notes/${slug}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Gagal menyimpan catatan');
      }

      router.push(`/notes/${targetSlug}`);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan';
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header action bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Batal</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'edit'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'preview'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Pratinjau</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/30 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Menyimpan...' : 'Simpan Catatan'}</span>
          </button>
        </div>
      </div>

      {/* Metadata Configuration Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Informasi & Metadata Catatan
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Judul Catatan *
            </label>
            <input
              type="text"
              required
              value={metadata.title}
              onChange={(e) => handleMetadataChange('title', e.target.value)}
              placeholder="Contoh: Rukun Shalat, Hadits Niat..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Tipe Catatan
            </label>
            <select
              value={metadata.type || 'concept'}
              onChange={(e) => handleMetadataChange('type', e.target.value as NoteType)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
            >
              {availableTypes.length > 0 ? (
                availableTypes.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))
              ) : (
                <>
                  <option value="concept">Ushul / Konsep Pokok</option>
                  <option value="hukum">Hukum Syariat / Fiqih</option>
                  <option value="dalil">Dalil (Al-Qur&apos;an / Hadits)</option>
                  <option value="kitab">Kitab & Referensi</option>
                  <option value="tokoh">Tokoh & Ulama</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Arabic Text & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Teks Arab (Opsional)
            </label>
            <input
              type="text"
              dir="rtl"
              value={metadata.arabic || ''}
              onChange={(e) => handleMetadataChange('arabic', e.target.value)}
              placeholder="النَّصُّ العَرَبِي"
              className="w-full px-3.5 py-2 text-base font-serif rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500 text-right"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Kategori / Sub-Bab
            </label>
            <input
              type="text"
              list="category-suggestions"
              value={metadata.category || ''}
              onChange={(e) => handleMetadataChange('category', e.target.value)}
              placeholder="Contoh: Fiqih Ibadah, Aqidah, Hadits..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
            />
            <datalist id="category-suggestions">
              {existingCategories.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Pilih dari kategori yang ada atau ketik baru (berkas akan otomatis diorganisir).
            </span>
          </div>
        </div>

        {/* Dynamic Fields for Dalil / Hukum */}
        {metadata.type === 'dalil' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Sumber Dalil
              </label>
              <select
                value={metadata.source_type || 'Hadits'}
                onChange={(e) => handleMetadataChange('source_type', e.target.value as NoteMetadata['source_type'])}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="Al-Qur'an">Al-Qur&apos;an</option>
                <option value="Hadits">Hadits</option>
                <option value="Ijma'">Ijma&apos; (Konsensus)</option>
                <option value="Qiyas">Qiyas</option>
                <option value="Atsar">Atsar Sahabat</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Referensi (Kitab/Nomor)
              </label>
              <input
                type="text"
                value={metadata.reference || ''}
                onChange={(e) => handleMetadataChange('reference', e.target.value)}
                placeholder="HR. Bukhari No. 793 / QS. 2:43"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              >
              </input>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Derajat Sanad
              </label>
              <input
                type="text"
                value={metadata.grade || ''}
                onChange={(e) => handleMetadataChange('grade', e.target.value)}
                placeholder="Shahih, Hasan, Mutawatir..."
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>
        )}

        {/* Tags and Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Tags (pisahkan koma)
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="shalat, dalil, rukun..."
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Ringkasan Singkat (Muncul di hover & search)
            </label>
            <input
              type="text"
              value={metadata.summary || ''}
              onChange={(e) => handleMetadataChange('summary', e.target.value)}
              placeholder="Keterangan satu kalimat..."
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Markdown Content Area */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Editor Quick Toolbar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => insertText('[[', ']]')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 font-medium"
              title="Tautkan Catatan Lain"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>[[Tautkan Catatan]]</span>
            </button>
            <button
              type="button"
              onClick={() => insertText('> ')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-medium"
              title="Kutipan Dalil"
            >
              <Quote className="w-3.5 h-3.5" />
              <span>Kutipan/Matan</span>
            </button>
            <button
              type="button"
              onClick={() => insertText('### ')}
              className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-medium"
            >
              Sub-Judul (H3)
            </button>
          </div>
          <span className="text-slate-400 text-xs">Mendukung format Markdown &amp; [[Link]]</span>
        </div>

        {activeTab === 'edit' ? (
          <textarea
            id="note-content-editor"
            rows={18}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tulis uraian hukum, kaidah fiqih, atau penjelasan dalil di sini... Gunakan [[Nama Catatan]] untuk menghubungkannya ke catatan lain."
            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 font-mono text-sm leading-relaxed text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
          />
        ) : (
          <div className="min-h-[400px] p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <MarkdownViewer content={content || '*Belum ada isi catatan*'} />
          </div>
        )}
      </div>
    </form>
  );
}
