# 🔧 Smart Sheets Extension - Troubleshooting Guide

## 🚨 Error Umum dan Solusinya

### 1. "Could not load icon" Error
**Penyebab:** Manifest mereferensi file icon yang tidak ada
**Solusi:** 
- Gunakan manifest.json yang sudah diperbaiki (tanpa referensi icons)
- Atau buat file icon sederhana (opsional)

### 2. "Could not load manifest" Error
**Penyebab:** Format manifest.json salah atau file corrupt
**Solusi:**
- Copy ulang manifest.json yang benar
- Pastikan format JSON valid (tanpa koma di akhir)

### 3. Extension Tidak Muncul di Toolbar
**Penyebab:** Extension tidak ter-install dengan benar
**Solusi:**
1. Buka `chrome://extensions/`
2. Pastikan extension ada dalam daftar
3. Pastikan toggle "Enabled" aktif
4. Pin extension ke toolbar (klik puzzle icon → pin)

### 4. Context Menu Tidak Muncul
**Penyebab:** Content script tidak ter-load
**Solusi:**
1. Reload extension di `chrome://extensions/`
2. Refresh halaman web
3. Pastikan teks benar-benar terpilih/highlight

### 5. Notifikasi "Smart Sheets belum dibuka"
**Penyebab:** Tab Smart Sheets tidak terbuka atau URL salah
**Solusi:**
- Buka `https://ex-tarikan.netlify.app/` di tab Chrome
- Pastikan URL lengkap dan benar
- Jangan gunakan incognito mode

### 6. Teks Tidak Terkirim ke Smart Sheets
**Penyebab:** Komunikasi antar tab gagal
**Solusi:**
1. Pastikan Smart Sheets sudah ter-load penuh
2. Refresh tab Smart Sheets
3. Coba kirim teks lagi
4. Periksa console browser (F12) untuk error

### 7. Extension Hilang Setelah Restart Chrome
**Penyebab:** Extension di-install dari folder temporary
**Solusi:**
- Pindahkan folder extension ke lokasi permanen
- Install ulang dari lokasi permanen

## 🔍 Debug Mode

### Cara Cek Error di Console:
1. **Buka Developer Tools** (F12)
2. **Tab Console**
3. **Cari pesan error** yang dimulai dengan:
   - "Smart Sheets Extension"
   - "Background script"
   - "Content script"

### Pesan Normal (Tidak Error):
```
Smart Sheets Extension loaded
Background script loaded
Text selected: [your text]
Found existing app tab: [tab_id]
Message sent to app tab successfully
```

### Pesan Error (Perlu Diperbaiki):
```
Error sending message to app tab: [error]
No app tab found
Runtime error: [error]
```

## 📞 Bantuan Lebih Lanjut

### Jika Masih Bermasalah:
1. **Screenshot error** di console
2. **Catat langkah-langkah** yang dilakukan
3. **Cek versi Chrome** (minimal v88+)
4. **Test di incognito mode** untuk isolasi masalah

### Informasi yang Dibutuhkan untuk Debug:
- Versi Chrome
- Sistem operasi
- Pesan error lengkap
- Langkah-langkah yang dilakukan
- Screenshot jika memungkinkan

---

**🎯 Tujuan:** Extension berfungsi tanpa error dan memberikan pengalaman smooth tanpa pop-up yang mengganggu!