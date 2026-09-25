# 📖 Panduan Penggunaan & Pengembangan (How-To Guide)

Selamat datang di panduan resmi **Bayan (بَيَان)**. Dokumen ini dirancang sebagai panduan langkah-demi-langkah bagi pengguna (Thalibul 'Ilm / peneliti) maupun pengembang (developer) yang ingin mengoperasikan, mengonfigurasi, dan mengembangkan aplikasi Bayan.

---

## 📑 Daftar Isi
1. [Instalasi & Menjalankan Aplikasi](#1-instalasi--menjalankan-aplikasi)
2. [Panduan Membuat & Mengelola Catatan](#2-panduan-membuat--mengelola-catatan)
   - [Membuat Catatan Baru lewat Antarmuka (UI)](#a-membuat-catatan-baru-lewat-antarmuka-ui)
   - [Membuat Catatan Manual via Direktori File](#b-membuat-catatan-manual-via-direktori-file)
   - [Mengisi Frontmatter & Metadata Khusus](#c-mengisi-frontmatter--metadata-khusus)
   - [Menulis Teks Arab (RTL)](#d-menulis-teks-arab-rtl)
3. [Menghubungkan Catatan dengan Wikilinks `[[]]`](#3-menghubungkan-catatan-dengan-wikilinks-)
   - [Sintaks Tautan Standar](#sintaks-tautan-standar)
   - [Sintaks Tautan dengan Alias (Custom Label)](#sintaks-tautan-dengan-alias-custom-label)
   - [Memahami Outgoing Links & Backlinks](#memahami-outgoing-links--backlinks)
4. [Menavigasi & Berinteraksi dengan Knowledge Graph](#4-menavigasi--berinteraksi-dengan-knowledge-graph)
   - [Kontrol Interaktif Graf](#kontrol-interaktif-graf)
   - [Graf Lokal vs. Graf Layar Penuh](#graf-lokal-vs-graf-layar-penuh)
5. [Mengatur Taksonomi & Tipe Catatan (`/settings`)](#5-mengatur-taksonomi--tipe-catatan-settings)
   - [Menambah Tipe Catatan Baru](#menambah-tipe-catatan-baru)
   - [Mengubah Warna & Ikon Tipe](#mengubah-warna--ikon-tipe)
   - [Ketentuan Menghapus Tipe](#ketentuan-menghapus-tipe)
6. [Navigasi Cepat dengan Command Palette (`Cmd+K`)](#6-navigasi-cepat-dengan-command-palette-cmdk)
7. [Panduan Pengembang (Developer Guide)](#7-panduan-pengembang-developer-guide)
   - [Struktur Proyek](#struktur-proyek)
   - [Alur Data & Resolusi Graf](#alur-data--resolusi-graf)
   - [Dokumentasi Endpoint API](#dokumentasi-endpoint-api)
8. [Tanya Jawab & Pemecahan Masalah (Troubleshooting)](#8-tanya-jawab--pemecahan-masalah-troubleshooting)

---

## 1. Instalasi & Menjalankan Aplikasi

### Kebutuhan Sistem
- **Node.js**: Versi `18.18.0` atau yang lebih baru (direkomendasikan Node.js 20 LTS).
- **Package Manager**: `npm`, `pnpm`, `yarn`, atau `bun`.

### Langkah-langkah Setup
1. **Buka Terminal** dan masuk ke direktori proyek:
   ```bash
   cd bayan
   ```

2. **Pasang Dependensi:**
   ```bash
   npm install
   # atau jika menggunakan pnpm:
   # pnpm install
   ```

3. **Jalankan Server Pengembangan (Dev Server):**
   ```bash
   npm run dev
   ```

4. **Buka di Peramban Web:**
   Buka alamat [http://localhost:3000](http://localhost:3000).

5. **Membangun Versi Produksi (Production Build):**
   ```bash
   npm run build
   npm run start
   ```

---

## 2. Panduan Membuat & Mengelola Catatan

Bayan mendukung dua metode pembuatan catatan: melalui formulir visual antarmuka web, atau langsung dengan membuat berkas Markdown di dalam folder `content/`.

### A. Membuat Catatan Baru lewat Antarmuka (UI)
1. Klik tombol **"+ Buat Catatan"** di bilah navigasi atas (atau kunjungi `/notes/new`).
2. Masukkan **Judul Catatan** (misal: `Rukun Shalat`).
3. Pilih **Tipe Catatan** (misal: *Hukum Syariat & Fiqih*, *Dalil*, atau *Konsep*).
4. *(Opsional)* Tentukan **Kategori / Sub-Bab** (misal: `Fiqih Ibadah/Shalat`). Berkas Markdown akan otomatis dimasukkan ke dalam folder tersebut.
5. Tuliskan isi catatan pada textarea editor.
6. Klik **"Simpan Catatan"** di pojok kanan atas.

---

### B. Membuat Catatan Manual via Direktori File
Karena Bayan berbasis sistem berkas terbuka, Anda dapat membuat berkas Markdown langsung menggunakan text editor favorit (VS Code, Obsidian, Neovim, dsb.).

1. Buat berkas baru di dalam folder `content/`, contoh:
   ```
   content/Fiqih/Rukun-Shalat.md
   ```
2. Berikan metadata frontmatter YAML di baris paling atas, diikuti oleh isi Markdown:

```markdown
---
title: Rukun Shalat
type: hukum
category: Fiqih Ibadah
arabic: أَرْكَانُ الصَّلَاةِ
status_hukum: Wajib
tags:
  - shalat
  - rukun
  - fiqih
summary: Ketetapan mengenai rukun-rukun dalam ibadah shalat fardhu dan sunnah.
---

Rukun shalat adalah bagian inti dari shalat yang tidak boleh ditinggalkan secara sengaja maupun lupa.

Di antara rukun terpenting adalah:
1. [[Niat]]
2. [[Takbiratul Ihram]]
3. [[Membaca Surat Al-Fatihah]]
4. [[Ruku' dengan Thuma'ninah]]
```

3. Simpan berkas. Bayan akan langsung memuat dan mengindeks catatan tersebut tanpa perlu me-restart server!

---

### C. Mengisi Frontmatter & Metadata Khusus

Bayan mengenali field metadata yang telah disesuaikan dengan studi keislaman:

#### 1. Untuk Catatan Dalil (`type: dalil`)
```yaml
---
title: Hadits Niat
type: dalil
source_type: Hadits         # Pilihan: Al-Qur'an, Hadits, Ijma', Qiyas, Atsar
reference: HR. Bukhari No. 1
grade: Shahih Muttafaq Alaih
narrator: Umar bin Al-Khattab
arabic: إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ
translation: "Sesungguhnya amalan itu tergantung pada niatnya."
tags: [hadits, niat, ikhlas]
---
```

#### 2. Untuk Catatan Hukum / Fiqih (`type: hukum`)
```yaml
---
title: Hukum Shalat Berjamaah
type: hukum
status_hukum: Sunnah Muakkadah / Fardhu Kifayah
madzhab: Syafi'i
category: Fiqih Ibadah
arabic: صَلَاةُ الجَمَاعَةِ
tags: [shalat, jamaah]
---
```

#### 3. Untuk Catatan Kitab (`type: kitab`)
```yaml
---
title: Matan Al-Ghayah wa At-Taqrib
type: kitab
author: Al-Qadhi Abu Syuja'
field: Fiqih Syafi'i
tags: [kitab, fiqih, turats]
---
```

---

### D. Menulis Teks Arab (RTL)
- Pada formulir editor, masukkan teks Arab pada input **"Teks Arab (Opsional)"**.
- Teks akan otomatis diformat dengan perataan kanan (*Right-to-Left*), ukuran proporsional, dan gaya font yang ramah tanda harakat (tasykil).
- Di dalam badan teks Markdown, Anda juga dapat menulis kutipan matan dengan blockquote (`> `):
  ```markdown
  > قَالَ رَسُولُ اللَّهِ ﷺ: «بُنِيَ الإِسْلاَمُ عَلَى خَمْسٍ»
  ```

---

## 3. Menghubungkan Catatan dengan Wikilinks `[[]]`

Kekuatan utama Bayan terletak pada jejaring pengetahuan (*Knowledge Graph*). Catatan dihubungkan menggunakan tanda kurung siku ganda `[[...]]`.

### Sintaks Tautan Standar
Ketik nama judul catatan yang ingin ditautkan:
```markdown
Hukum ini berlandaskan pada hadits [[Hadits Niat]].
```
*Bayan akan otomatis mengarahkan tautan ke catatan dengan slug atau judul `hadits-niat`.*

### Sintaks Tautan dengan Alias (Custom Label)
Jika Anda ingin teks yang muncul berbeda dari judul catatan asli, gunakan karakter pemisah pipa `|`:
```markdown
Silakan merujuk pada penjelasan [[Rukun-Shalat|rukun-rukun utama shalat]].
```
*Target yang dituju adalah `Rukun-Shalat`, namun pembaca akan melihat teks `rukun-rukun utama shalat`.*

### Memahami Outgoing Links & Backlinks
- **Outgoing Links (Tautan Keluar):** Daftar seluruh catatan lain yang Anda sebutkan di dalam catatan aktif.
- **Backlinks (Dirujuk Oleh):** Daftar catatan lain yang menyebutkan catatan aktif Anda. Fitur ini bekerja otomatis tanpa Anda perlu mencatat balik secara manual.

---

## 4. Menavigasi & Berinteraksi dengan Knowledge Graph

Knowledge Graph menyajikan representasi visual dari seluruh berkas di repositori dan garis relasinya.

### Kontrol Interaktif Graf
| Tindakan | Operasi Mouse / Trackpad | Fungsi |
| :--- | :--- | :--- |
| **Pindahkan Simpul** | Klik kiri & seret (drag) pada lingkaran | Menggeser posisi catatan sesuai kenyamanan visual |
| **Buka Catatan** | Klik satu kali pada lingkaran catatan | Langsung menuju ke halaman catatan terkait |
| **Geser Peta (Pan)** | Klik kiri & seret pada area kosong canvas | Menjelajahi bagian lain dari graf |
| **Zoom In / Zoom Out** | Putar roda mouse (scroll) / cubit trackpad | Memperbesar atau memperkecil tampilan peta |
| **Lihat Keterangan** | Arahkan kursor (*hover*) pada simpul | Menampilkan kartu ringkasan dan judul catatan |

### Graf Lokal vs. Graf Layar Penuh
- **Graf Lokal (Local Graph):** Terletak pada bilah samping kanan di setiap halaman detail catatan (`/notes/[slug]`). Graf ini menyorot catatan aktif dengan lingkaran emas dan hanya memvisualisasikan relasi terdekat catatan tersebut.
- **Graf Layar Penuh (Fullscreen Graph):** Dapat diakses melalui tombol **"Peta Graf"** di navbar atau menu `/graph`. Menampilkan keseluruhan semesta catatan yang Anda miliki.

---

## 5. Mengatur Taksonomi & Tipe Catatan (`/settings`)

Bayan tidak mengunci kategori catatan Anda. Anda bebas mendefinisikan taksonomi baru melalui halaman **Pengaturan Tipe** (`/settings`).

### Menambah Tipe Catatan Baru
1. Buka menu **Pengaturan** di navbar kanan atas (ikon gerigi).
2. Klik tombol **"+ Tambah Tipe Baru"**.
3. Isi informasi:
   - **Kode Identifikasi (Key / ID):** Huruf kecil tanpa spasi (misal: `kaidah-fiqih` atau `fatwa`).
   - **Nama Label:** Teks yang tampil di antarmuka (misal: `Kaidah Fiqhiyyah`).
   - **Deskripsi:** Penjelasan kegunaan tipe tersebut.
   - **Warna Identitas:** Pilih dari palet preset atau masukkan kode heksadesimal warna (misal: `#0d9488`).
   - **Pilih Ikon:** Klik salah satu ikon dari katalog yang tersedia (Book, Bookmark, Scale, Compass, Users, Sparkles, dll.).
4. Klik **"Tambah Tipe"**. Tipe baru akan seketika tersedia di formulir editor dan graf.

### Mengubah Warna & Ikon Tipe
- Klik tombol **"Edit"** pada kartu tipe yang ingin diubah di `/settings`.
- Anda dapat memperbarui label, warna, ikon, dan deskripsi tanpa merusak data catatan yang sudah ada.

### Ketentuan Menghapus Tipe
- Untuk menjaga integritas data, tombol hapus (ikon tempat sampah) akan **dinonaktifkan** apabila masih ada catatan yang menggunakan tipe tersebut.
- Ubah tipe catatan terkait terlebih dahulu sebelum menghapus tipe dari sistem.

---

## 6. Navigasi Cepat dengan Command Palette (`Cmd+K`)

Command Palette memungkinkan Anda berpindah halaman dalam hitungan detik:
1. Tekan pintasan:
   - **macOS:** `Command + K` (`⌘K`)
   - **Windows / Linux:** `Ctrl + K`
2. Ketik kata kunci yang dicari (bisa berupa judul, potongan terjemahan dalil, tagar, maupun teks Arab).
3. Gunakan tab saringan (*Semua, Ushul & Konsep, Hukum Syariat, Dalil, Kitab, Tokoh*) untuk mempersempit hasil pencarian.
4. Gunakan tombol panah `↑` dan `↓` pada keyboard untuk memilih catatan, lalu tekan `Enter` untuk membuka.
5. Tekan `Esc` untuk menutup dialog kapan saja.

---

## 7. Panduan Pengembang (Developer Guide)

### Struktur Proyek
```
bayan/
├── content/              # Direktori penyimpanan berkas catatan Markdown (.md)
│   ├── Fiqih/            # Contoh subfolder kategori
│   └── test.md
├── data/
│   └── note-types.json   # Konfigurasi skema taksonomi dinamis (JSON)
├── docs/                 # Dokumentasi proyek
│   ├── FEATURES_AND_ROADMAP.md
│   └── HOW_TO.md
├── src/
│   ├── app/              # Next.js App Router (Halaman & API Routes)
│   │   ├── api/
│   │   │   ├── graph/    # Endpoint topologi graf (/api/graph)
│   │   │   ├── notes/    # Endpoint CRUD catatan (/api/notes)
│   │   │   └── types/    # Endpoint CRUD taksonomi (/api/types)
│   │   ├── graph/        # Halaman visualisasi graf layar penuh
│   │   ├── notes/        # Halaman baca, buat, dan edit catatan
│   │   └── settings/     # Halaman manajemen tipe & taksonomi
│   ├── components/       # Komponen UI React
│   │   ├── CommandPalette.tsx  # Modal pencarian cepat Cmd+K
│   │   ├── GraphCanvas.tsx     # Engine visualisasi graf 2D berbasis HTML5 Canvas
│   │   ├── MarkdownViewer.tsx  # Renderer Markdown & Parser Wikilinks
│   │   ├── NoteEditor.tsx      # Editor dual-pane dan input metadata
│   │   └── Sidebar.tsx         # Navigasi pohon direktori & kategori
│   └── lib/              # Logika murni server & tipe data
│       ├── graph.ts      # Kalkulasi keterhubungan simpul & edges
│       ├── note-types.ts # Driver pembacaan/penyimpanan note-types.json
│       ├── notes.ts      # File-system crawler, parser gray-matter & backlinks
│       └── types.ts      # TypeScript Interfaces & Types
└── package.json
```

### Alur Data & Resolusi Graf
1. **Ekstraksi File (`src/lib/notes.ts`):** Fungsi `getAllNotes()` menelusuri folder `content/` secara rekursif, membaca frontmatter dengan `gray-matter`, dan mengekstrak semua kemunculan regex `\[\[(.*?)\]\]`.
2. **Kalkulasi Backlinks:** Map tautan dua arah dibangun dalam memori untuk mencocokkan target link ke slug catatan asal.
3. **Penyusunan Graf (`src/lib/graph.ts`):** `getGraphData()` menghasilkan kumpulan `nodes` (dengan bobot koneksi) dan `links` (pasangan relasi unik tanpa duplikasi timbal balik).

### Dokumentasi Endpoint API

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/api/notes` | Mengambil seluruh daftar catatan ringkas beserta kategorinya. |
| `POST` | `/api/notes` | Menyimpan catatan baru ke dalam berkas `.md` di `content/`. |
| `GET` | `/api/notes/[slug]` | Mengambil detail lengkap catatan (isi markdown + metadata + backlinks). |
| `PUT` | `/api/notes/[slug]` | Memperbarui berkas catatan yang sudah ada. |
| `GET` | `/api/graph` | Mengambil data node dan tautan untuk dirender di Graph Canvas. |
| `GET` | `/api/types` | Mengambil seluruh tipe catatan beserta jumlah berkas yang memakainya. |
| `POST` | `/api/types` | Menambahkan tipe catatan baru ke `data/note-types.json`. |
| `PUT` | `/api/types` | Memperbarui label, ikon, atau warna tipe catatan. |
| `DELETE` | `/api/types?key=[key]` | Menghapus tipe catatan jika jumlah penggunaannya bernilai 0. |

---

## 8. Tanya Jawab & Pemecahan Masalah (Troubleshooting)

**Q: Mengapa catatan baru saya belum muncul di graf?**  
A: Pastikan catatan baru tersebut memiliki tautan `[[...]]` ke catatan lain, atau dirujuk oleh catatan lain. Jika berdiri sendiri tanpa relasi, catatan akan tetap muncul sebagai simpul terpisah di kanvas graf.

**Q: Apakah saya bisa membuka folder `content/` di aplikasi Obsidian?**  
A: **Bisa.** Folder `content/` sepenuhnya kompatibel dengan Obsidian Vault. Format wikilinks `[[...]]` dan frontmatter YAML akan terbaca secara sempurna di Obsidian tanpa konfigurasi tambahan.

**Q: Bagaimana jika saya ingin mengubah slug atau nama berkas catatan?**  
A: Ubah nama berkas `.md` di direktori `content/` atau edit judul catatan di editor web. Bayan akan otomatis menyesuaikan *slug* sesuai aturan penamaan aman URL.

**Q: Bagaimana cara menjalankan linter proyek?**  
A: Jalankan perintah berikut di terminal:
```bash
npm run lint
```
