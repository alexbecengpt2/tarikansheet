# 📊 Smart Sheets Extension - Cara Install Lengkap

## 🚨 Perbaikan Error Icon dan Manifest

### Error yang Muncul:
```
Could not load icon 'icon16.png' specified in 'icons'.
Could not load manifest.
```

### ✅ Solusi:

#### 1. Hapus Referensi Icon dari Manifest
Manifest.json sudah diperbaiki tanpa referensi icon yang tidak ada.

#### 2. Struktur Folder yang Benar:
```
📁 Smartextension/
├── 📄 manifest.json (UPDATED - tanpa icons)
├── 📄 content.js
├── 📄 background.js
├── 📄 popup.html
└── 📄 README.md
```

## 🔧 Langkah Install:

### 1. Persiapan Folder
1. **Buat folder baru** di desktop: `Smartextension`
2. **Copy semua file** ke dalam folder tersebut
3. **Pastikan tidak ada file icon** (sudah dihapus dari manifest)

### 2. Install Extension
1. Buka Chrome → ketik `chrome://extensions/`
2. **Aktifkan "Developer mode"** (toggle kanan atas)
3. Klik **"Load unpacked"**
4. Pilih folder `Smartextension`
5. Extension akan ter-install tanpa error

### 3. Verifikasi Install
- Extension muncul di daftar dengan nama "Smart Sheets Extension"
- Icon default Chrome akan muncul di toolbar
- Tidak ada error message

## 🎯 Cara Menggunakan:

### Workflow Tanpa Pop-up:
1. **Buka Smart Sheets** di tab Chrome: `https://ex-tarikan.netlify.app/`
2. **Buka website lain** di tab berbeda
3. **Highlight/pilih teks** yang ingin dikirim
4. **Klik kanan** → pilih **"📊 Kirim ke Smart Sheets"**
5. **Notifikasi muncul** di halaman:
   - ✅ Hijau: "Teks berhasil dikirim ke Smart Sheets! 🎉"
   - ❌ Merah: "Smart Sheets belum dibuka! Silakan buka aplikasi terlebih dahulu."
6. **Tab Smart Sheets otomatis aktif** dengan teks sudah terisi

### Alternatif via Popup:
1. **Highlight teks** di website
2. **Klik icon extension** di toolbar Chrome
3. **Klik "Kirim Teks Terpilih"**
4. **Status muncul di popup**

## ⚠️ Syarat Penting:

### WAJIB: Smart Sheets Harus Sudah Terbuka!
- Extension tidak akan membuka tab baru
- Smart Sheets harus sudah terbuka di salah satu tab Chrome
- URL harus: `https://ex-tarikan.netlify.app/`

## 🐛 Troubleshooting:

### Jika Masih Error:
1. **Tutup semua tab Chrome**
2. **Restart Chrome**
3. **Hapus extension** (jika sudah ter-install)
4. **Install ulang** dengan langkah di atas

### Jika Extension Tidak Muncul:
1. Periksa folder `Smartextension` berisi semua file
2. Pastikan `manifest.json` ada dan benar
3. Refresh halaman `chrome://extensions/`

### Jika Context Menu Tidak Muncul:
1. **Reload extension** di `chrome://extensions/`
2. **Refresh halaman web** yang sedang dibuka
3. **Coba highlight teks lagi**

## 📱 Test Extension:

### Test Berhasil:
1. Buka Smart Sheets
2. Buka website lain (misal: Wikipedia)
3. Highlight teks → klik kanan → "Kirim ke Smart Sheets"
4. Notifikasi hijau muncul
5. Tab Smart Sheets aktif dengan teks terisi

### Test Gagal (Normal):
1. **Jangan buka** Smart Sheets
2. Highlight teks → klik kanan → "Kirim ke Smart Sheets"
3. Notifikasi merah muncul: "Smart Sheets belum dibuka!"

## 🎉 Selesai!

Extension sekarang berfungsi tanpa error dan tanpa pop-up tab baru yang mengganggu!

**💡 Tips:** Bookmark Smart Sheets (`https://ex-tarikan.netlify.app/`) agar mudah dibuka setiap kali ingin menggunakan extension.