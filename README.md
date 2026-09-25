# 🌿 Bayan (بَيَان) — Islamic Knowledge Graph & Markdown Encyclopedia

<p align="center">
  <span style="font-size: 2rem; font-weight: bold; font-family: serif;">بَيَانٌ لِّلنَّاسِ وَهُدًى وَمَوْعِظَةٌ لِّلْمُتَّقِينَ</span>
  <br />
  <em>"Sistem ensiklopedia interaktif & personal knowledge management (PKM) untuk memetakan dalil, hukum syariat, konsep ushul, kitab turats, dan ulama secara terhubung."</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.3-black?logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19.2-blue?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Storage-Local%20Markdown-emerald" alt="Markdown Local" />
  <img src="https://img.shields.io/badge/Obsidian-Compatible-7C3AED?logo=obsidian" alt="Obsidian Compatible" />
</p>

---

## 🌟 Tentang Bayan

**Bayan** (Bahasa Arab: بَيَان — *penjelasan, penerangan, atau kejelasan*) adalah platform ensiklopedia dan *Islamic Second Brain* berbasis web yang dirancang khusus untuk memfasilitasi para penuntut ilmu (*Thalibul 'Ilm*), santri, akademisi, dan peneliti keislaman.

Dengan Bayan, setiap ketetapan fiqih tidak lagi terisolasi: Anda dapat melihat langsung ayat Al-Qur'an dan hadits shahih yang menjadi landasannya, kaidah ushul fiqih yang melatarbelakanginya, serta kitab dan ulama yang membahasnya melalui **Knowledge Graph interaktif** dan **tautan dua arah (bidirectional wikilinks `[[]]`)**.

---

## 📚 Dokumentasi Lengkap

Kami telah menyusun dokumentasi terperinci untuk memandu Anda:

| Dokumen | Deskripsi |
| :--- | :--- |
| 🗺️ **[Fitur & Roadmap](docs/FEATURES_AND_ROADMAP.md)** | Penjelasan seluruh fitur v0.1.0 dan peta rencana pengembangan (Fase 1 s.d. Fase 4). |
| 📖 **[Panduan Penggunaan (How-To Guide)](docs/HOW_TO.md)** | Panduan praktis instalasi, pembuatan catatan, sintaks wikilinks, kustomisasi tipe di `/settings`, dan panduan developer. |

---

## ⚡ Fitur Utama

- 🕸️ **Interactive Knowledge Graph 2D:** Visualisasi interaktif berbasis fisika (*force-directed physics*) yang memetakan keterkaitan konsep, hukum, dan dalil dengan zoom, pan, dan drag.
- 🔗 **Bidirectional Wikilinks & Backlinks:** Hubungkan catatan secara instan dengan sintaks `[[Judul Catatan]]` dan temukan catatan lain yang merujuk balik secara otomatis (*backlinks index*).
- 🏷️ **Taksonomi & Tipe Catatan Dinamis (`/settings`):** Konfigurasi tipe catatan (Ushul/Konsep, Hukum/Fiqih, Dalil, Kitab, Tokoh), lengkap dengan pilihan warna dan ikon Lucide.
- 📜 **Metadata Frontmatter Khusus Khazanah Islam:** Mendukung perawi, derajat hadits (*Shahih*, *Hasan*), nomor referensi, status hukum syar'i, madzhab, serta teks Arab berharakat dengan tata letak RTL.
- ⚡ **Command Palette Universal (`Cmd+K` / `Ctrl+K`):** Temukan dalil, fatwa, dan rujukan kitab dalam hitungan detik langsung dari papan ketik Anda.
- 📝 **Live Dual-Pane Markdown Editor:** Tulis catatan dengan kenyamanan Markdown murni dan pratinjau instan secara berdampingan.
- 📂 **100% File-System First & Obsidian Compatible:** Berkas Anda tersimpan dalam format Markdown standar di folder `content/`. Tanpa database tertutup, sepenuhnya milik Anda.

---

## 🚀 Memulai (Quickstart)

### 1. Prasyarat
- Node.js versi `18.18+` (Direkomendasikan Node.js 20 LTS).
- Package manager: `npm`, `pnpm`, `yarn`, atau `bun`.

### 2. Jalankan di Lingkungan Lokal
```bash
# 1. Masuk ke direktori
cd bayan

# 2. Pasang dependensi
npm install

# 3. Jalankan server pengembangan
npm run dev
```

Buka peramban Anda di [http://localhost:3000](http://localhost:3000) untuk mulai menjelajahi atau menambahkan catatan pertama Anda!

---

## 🗂️ Struktur Proyek

```
bayan/
├── content/              # Direktori berkas catatan Markdown (.md)
├── data/                 # Penyimpanan konfigurasi tipe catatan (note-types.json)
├── docs/                 # Dokumentasi resmi proyek
│   ├── FEATURES_AND_ROADMAP.md
│   └── HOW_TO.md
├── src/
│   ├── app/              # Next.js App Router (Halaman & Endpoint API)
│   ├── components/       # Komponen UI (Canvas Graf, Editor, Command Palette, dll.)
│   └── lib/              # Modul resolver catatan, kalkulasi graf, dan taksonomi
└── README.md
```

---

## 🤝 Berkontribusi

Kontribusi berupa saran fitur, perbaikan bug, atau penambahan contoh data kajian sangat kami nantikan! Silakan baca panduan arsitektur pada [Panduan Penggunaan (How-To Guide)](docs/HOW_TO.md) sebelum mengajukan Pull Request.

---

## 📄 Lisensi

Proyek ini dirilis di bawah lisensi terbuka [GNU General Public License v3.0](LICENSE).
