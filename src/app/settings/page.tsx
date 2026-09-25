'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit2, Trash2, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { NoteTypeDefinition } from '@/lib/types';
import TypeIcon, { AVAILABLE_TYPE_ICONS } from '@/components/TypeIcon';

const PRESET_COLORS = [
  { name: 'Sky', hex: '#0284c7' },
  { name: 'Emerald', hex: '#059669' },
  { name: 'Amber', hex: '#d97706' },
  { name: 'Purple', hex: '#7c3aed' },
  { name: 'Rose', hex: '#e11d48' },
  { name: 'Indigo', hex: '#4f46e5' },
  { name: 'Teal', hex: '#0d9488' },
  { name: 'Cyan', hex: '#0891b2' },
  { name: 'Orange', hex: '#ea580c' },
  { name: 'Slate', hex: '#475569' },
];

export default function SettingsPage() {
  const [types, setTypes] = useState<NoteTypeDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingType, setEditingType] = useState<NoteTypeDefinition | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState<NoteTypeDefinition>({
    key: '',
    label: '',
    icon: 'FileText',
    color: '#0284c7',
    description: '',
  });

  const refreshTypes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/types');
      const data = await res.json();
      if (Array.isArray(data)) {
        setTypes(data);
      }
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetch('/api/types')
      .then((res) => res.json())
      .then((data: NoteTypeDefinition[]) => {
        if (isMounted && Array.isArray(data)) {
          setTypes(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const openCreateModal = () => {
    setIsNew(true);
    setFormData({
      key: '',
      label: '',
      icon: 'FileText',
      color: '#0284c7',
      description: '',
    });
    setEditingType({ key: '', label: '', icon: 'FileText', color: '#0284c7' });
    setMessage(null);
  };

  const openEditModal = (t: NoteTypeDefinition) => {
    setIsNew(false);
    setFormData(t);
    setEditingType(t);
    setMessage(null);
  };

  const closeModal = () => {
    setEditingType(null);
    setMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const url = '/api/types';
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Gagal menyimpan tipe catatan');
      }

      setMessage({
        type: 'success',
        text: isNew ? 'Tipe catatan baru berhasil ditambahkan!' : 'Perubahan tipe catatan berhasil disimpan!',
      });

      await refreshTypes();
      setTimeout(() => {
        closeModal();
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setMessage({ type: 'error', text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (key: string, label: string, count?: number) => {
    if (count && count > 0) {
      alert(`Tidak dapat menghapus tipe "${label}" karena sedang digunakan oleh ${count} catatan.`);
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin menghapus tipe catatan "${label}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/types?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal menghapus tipe');
      }

      await refreshTypes();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus tipe';
      alert(msg);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Kelola Tipe &amp; Taksonomi Catatan
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Konfigurasi tipe catatan (seperti Konsep, Hukum, Dalil, Kitab, Tokoh), sesuaikan warna visual graf, dan ikon rujukan.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/30 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Tipe Baru</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            {types.length}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Tipe Aktif Terdaftar</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-2xl font-extrabold text-emerald-600">
            {types.reduce((acc, t) => acc + (t.count || 0), 0)}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Total Catatan Menggunakan Tipe</div>
        </div>
        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Format Fleksibel</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Tersinkronisasi otomatis ke graf &amp; editor</div>
          </div>
          <button
            onClick={refreshTypes}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Muat ulang"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Types List Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          Daftar Tipe Catatan
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {types.map((t) => (
            <div
              key={t.key}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 group hover:border-slate-300 dark:hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs"
                    style={{ backgroundColor: t.color }}
                  >
                    <TypeIcon name={t.icon} className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {t.label}
                    </h3>
                    <span className="font-mono text-[10px] text-slate-400">
                      key: {t.key}
                    </span>
                  </div>
                </div>

                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {t.count || 0} catatan
                </span>
              </div>

              {t.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t.description}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full border border-black/10 inline-block"
                    style={{ backgroundColor: t.color }}
                  />
                  <span className="font-mono text-[10px] text-slate-400">{t.color}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(t)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition text-xs"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDelete(t.key, t.label, t.count)}
                    disabled={(t.count || 0) > 0}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:bg-transparent"
                    title={
                      (t.count || 0) > 0
                        ? 'Tipe sedang digunakan oleh catatan'
                        : 'Hapus tipe ini'
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit / Create Modal */}
      {editingType !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {isNew ? 'Tambah Tipe Catatan Baru' : `Edit Tipe: ${editingType.label}`}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm p-1"
              >
                ✕
              </button>
            </div>

            {message && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  message.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300'
                }`}
              >
                {message.type === 'success' ? (
                  <Check className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Key ID */}
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Kode Identifikasi (Key / ID) *
                </label>
                <input
                  type="text"
                  required
                  disabled={!isNew}
                  value={formData.key}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      key: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
                    }))
                  }
                  placeholder="Contoh: kaidah, fatwa, istilah"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs outline-none focus:border-emerald-500 disabled:opacity-60"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {isNew
                    ? 'Digunakan di berkas markdown (misal: type: kaidah). Hanya huruf kecil dan tanda hubung.'
                    : 'Kode identifikasi tidak dapat diubah setelah dibuat.'}
                </span>
              </div>

              {/* Label */}
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nama Label Tampilan *
                </label>
                <input
                  type="text"
                  required
                  value={formData.label}
                  onChange={(e) => setFormData((prev) => ({ ...prev, label: e.target.value }))}
                  placeholder="Contoh: Kaidah Fiqhiyyah, Fatwa Ulama"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:border-emerald-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi Singkat (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Penjelasan mengenai tipe catatan ini..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              {/* Color Picker */}
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Warna Identitas (Graf &amp; Badge)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, color: c.hex }))}
                      className={`w-7 h-7 rounded-lg transition border flex items-center justify-center ${
                        formData.color.toLowerCase() === c.hex.toLowerCase()
                          ? 'border-slate-900 dark:border-white scale-110 shadow-sm'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {formData.color.toLowerCase() === c.hex.toLowerCase() && (
                        <Check className="w-3.5 h-3.5 text-white" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                    className="w-7 h-7 rounded-lg border-0 cursor-pointer p-0"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                    className="w-24 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-xs bg-slate-50 dark:bg-slate-800"
                  />
                  <span className="text-[11px] text-slate-400">Kode warna hex</span>
                </div>
              </div>

              {/* Icon Selector */}
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Pilih Ikon
                </label>
                <div className="grid grid-cols-6 sm:grid-cols-9 gap-1.5 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 max-h-32 overflow-y-auto">
                  {Object.keys(AVAILABLE_TYPE_ICONS).map((iconKey) => {
                    const isSelected = formData.icon === iconKey;
                    return (
                      <button
                        key={iconKey}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, icon: iconKey }))}
                        className={`p-2 rounded-lg flex items-center justify-center transition ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        title={iconKey}
                      >
                        <TypeIcon name={iconKey} className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Preview */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Pratinjau Badge:</span>
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white shadow-xs"
                  style={{ backgroundColor: formData.color }}
                >
                  <TypeIcon name={formData.icon} className="w-3.5 h-3.5" />
                  <span>{formData.label || 'Nama Tipe'}</span>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : isNew ? 'Tambah Tipe' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
