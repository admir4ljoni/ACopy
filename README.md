# Auto Copy Google Form Submission

Skrip Google Apps Script untuk mengotomatisasi penyalinan file/folder dari Google Drive setiap kali ada pengiriman formulir.

## Fitur Utama

- **Otomatis**: Berjalan otomatis saat ada pengiriman formulir baru
- **Kategorisasi**: Mengelompokkan submission berdasarkan subtema
- **Struktur Folder Terorganisir**: Membuat struktur folder yang rapi dengan format:
  ```
  📁 WorkArt 2026/
  ├── 📁 Subtema 1/
  │   ├── 📁 KODE - Nama - email/
  │   │   ├── 📁 1st Submission/
  │   │   └── 📁 2nd Submission/
  └── 📁 Subtema 2/
  ```

---

**Catatan**: Script ini akan terus berjalan di background selama trigger aktif. Tidak perlu menjalankan manual setiap kali ada submission baru.

---

## Persyaratan Form

Pastikan form Anda memiliki field-field berikut (judul field bisa bervariasi, script akan mencocokkan berdasarkan kata kunci):

- **Email** (kata kunci: `email`)
- **Kode Peserta** (kata kunci: `kode`)
- **Nama Lengkap** (kata kunci: `nama`)
- **Subtema yang Dipilih** (kata kunci: `subtema`)
- **Link Folder Drive** (kata kunci: `link`)

## Cara Instalasi

### 1. Buka Apps Script Editor
1. Buka Google Form Anda
2. Klik menu `⋮` (tiga titik) di pojok kanan atas
3. Pilih **"Apps Script"**

### 2. Salin Kode
1. Hapus semua kode yang ada di editor
2. Salin seluruh kode dari file `auto_copy.gs`
3. Paste ke editor Apps Script
4. Klik ikon **Simpan** (disket)

### 3. Setup Trigger
1. Dari menu dropdown di atas editor, pilih fungsi `setupTrigger`
2. Klik tombol **▶ Run**
3. **PENTING**: Akan muncul popup otorisasi, klik **"Review permissions"**
4. Pilih akun Google Anda
5. Centang semua opsi
6. Klik **"Allow"** untuk memberikan izin

## Konfigurasi

### Mengubah Folder Tujuan
Edit baris ke-11 untuk mengubah nama folder utama:
```javascript
const DESTINATION_FOLDER_NAME = "Submission Test 2 - BYTEFEST 2026";
```

### Menyesuaikan Field Form
Edit baris 15-20 untuk menyesuaikan kata kunci pencarian field:
```javascript
const FIELD_EMAIL    = "email";
const FIELD_KODE     = "kode";      // "Kode peserta"
const FIELD_NAMA     = "nama";      // "Nama lengkap"
const FIELD_SUBTEMA  = "subtema";   // "Subtema yang dipilih"
const FIELD_LINK     = "link";      // "Link folder drive"
```

## 📁 Struktur Folder yang Dibuat

Script akan membuat struktur folder sebagai berikut:

```
📁 [DESTINATION_FOLDER_NAME]/
├── 📁 [Subtema 1]/
│   ├── 📁 [KODE] - [Nama] - [email]/
│   │   ├── 📁 1st Submission/
│   │   │   ├── 📄 [file yang disalin]
│   │   │   └── 📁 [folder yang disalin]
│   │   └── 📁 2nd Submission/
└── 📁 [Subtema 2]/
    └── ...
```

## Cara Kerja

1. **Trigger**: Script berjalan otomatis saat ada pengiriman form baru
2. **Validasi**: Memastikan semua field required terisi
3. **Pembuatan Folder**: Membuat folder utama jika belum ada
4. **Kategorisasi**: Membuat folder subtema di dalam folder utama
5. **Folder Peserta**: Membuat folder untuk setiap peserta
6. **Submission**: Membuat folder submission dengan nomor urut (1st, 2nd, 3rd, dst)
7. **Penyalinan**: Menyalin semua file/folder dari link Drive yang diberikan

## Format Link Drive yang Didukung

Script dapat membaca berbagai format link Google Drive:
- `https://drive.google.com/drive/folders/[ID]`
- `https://drive.google.com/file/d/[ID]/view`
- `https://drive.google.com/open?id=[ID]`
- `https://drive.google.com/d/[ID]`

## Troubleshooting

### Masalah Umum

**1. Error saat menjalankan setupTrigger**
- Pastikan Anda sudah mengklik "Allow" saat popup otorisasi muncul
- Coba refresh halaman dan jalankan kembali

**2. Folder tidak terbuat**
- Cek log di Apps Script (View → Logs)
- Pastikan semua field form terisi dengan benar

**3. File tidak tersalin**
- Pastikan link Drive yang diberikan valid dan bisa diakses
- Cek apakah file/folder sudah dipindahkan atau dihapus

### Melihat Log
1. Buka Apps Script editor
2. Dari menu, pilih **View → Logs**
3. Atau tekan `Ctrl + Enter` (Windows/Linux) atau `Cmd + Enter` (Mac)

## Update & Maintenance

### Mengubah Konfigurasi
1. Buka Apps Script editor
2. Edit kode sesuai kebutuhan
3. Klik **Simpan**
4. Tidak perlu setup ulang trigger

### Mematikan Script
1. Buka Apps Script editor
2. Di menu sebelah kiri, pilih **Triggers**
3. Hapus trigger dengan nama Function `onFormSubmit` dengan klik menu `⋮` (tiga titik) di pojok kanan
4. Pilih **Delete trigger**
5. Pilih **DELETE FOREVER** di konfirmasi

## Bantuan

Jika mengalami masalah:
1. Cek log error di Apps Script
2. Pastikan semua field form terisi
3. Verifikasi link Drive valid
4. Pastikan izin akses file/folder sudah benar

Apabila langkah-langkah di atas tidak menyelesaikan masalah yang ditemui, mohon hubungi pemilik repository.
