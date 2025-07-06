# 📊 Smart Sheets Extension - Panduan Lengkap (Tanpa Pop-up Tab Baru)

## 🎯 Fitur Baru
- ✅ **Tidak ada tab baru** yang terbuka saat mengirim teks
- ✅ **Notifikasi langsung** di halaman web (berhasil/gagal)
- ✅ **Auto-focus** ke tab Smart Sheets yang sudah ada
- ✅ **Feedback visual** di popup extension

## 🚀 Langkah 1: Persiapan File Extension

1. **Buat folder baru** di desktop: `smart-sheets-extension`
2. **Copy semua file** ke dalam folder:
   - `manifest.json`
   - `content.js` (UPDATED)
   - `background.js` (UPDATED)
   - `popup.html` (UPDATED)

## 🔧 Langkah 2: Install/Update Extension

### Jika Extension Belum Ada:
1. Buka Chrome → `chrome://extensions/`
2. Aktifkan **"Developer mode"** (toggle kanan atas)
3. Klik **"Load unpacked"**
4. Pilih folder `smart-sheets-extension`

### Jika Extension Sudah Ada:
1. Buka Chrome → `chrome://extensions/`
2. Cari **"Smart Sheets Extension"**
3. Klik tombol **"Reload"** (ikon refresh)

## 📱 Cara Menggunakan (Metode Baru)

### Metode 1: Context Menu (Klik Kanan)
1. **Buka Smart Sheets** di tab Chrome: `https://ex-tarikan.netlify.app/`
2. **Buka website lain** di tab berbeda
3. **Pilih/highlight teks** yang ingin dikirim
4. **Klik kanan** → "📊 Kirim ke Smart Sheets"
5. **Notifikasi muncul** di halaman (berhasil/gagal)
6. **Tab Smart Sheets otomatis aktif** dengan teks terisi

### Metode 2: Popup Extension
1. **Buka Smart Sheets** di tab Chrome: `https://ex-tarikan.netlify.app/`
2. **Buka website lain** di tab berbeda
3. **Pilih/highlight teks** yang ingin dikirim
4. **Klik icon extension** di toolbar
5. **Klik "Kirim Teks Terpilih"**
6. **Status muncul di popup** (berhasil/gagal)
7. **Tab Smart Sheets otomatis aktif** dengan teks terisi

## ⚠️ Penting: Smart Sheets Harus Sudah Terbuka!

**WAJIB:** Aplikasi Smart Sheets harus sudah dibuka di salah satu tab Chrome sebelum mengirim teks.

Jika belum dibuka:
- Klik **"Buka Smart Sheets"** di popup extension
- Atau buka manual: `https://ex-tarikan.netlify.app/`

## 🎨 Notifikasi Visual

### Di Halaman Web (Context Menu):
- ✅ **Hijau**: "Teks berhasil dikirim ke Smart Sheets! 🎉"
- ❌ **Merah**: "Smart Sheets belum dibuka! Silakan buka aplikasi terlebih dahulu."

### Di Popup Extension:
- ✅ **Hijau**: "✅ Teks berhasil dikirim ke Smart Sheets!"
- ❌ **Merah**: "❌ Smart Sheets belum dibuka!"
- ❌ **Merah**: "❌ Tidak ada teks yang dipilih"

## 🔄 Workflow Ideal

1. **Buka Smart Sheets** (`https://ex-tarikan.netlify.app/`)
2. **Buka website lain** untuk mencari data
3. **Highlight teks** → **Klik kanan** → **"Kirim ke Smart Sheets"**
4. **Lihat notifikasi** di halaman
5. **Switch ke tab Smart Sheets** (otomatis aktif)
6. **Klik "Kirim ke Sheets"** untuk menyimpan

## 🐛 Troubleshooting

### Notifikasi "Smart Sheets belum dibuka":
- Pastikan tab `https://ex-tarikan.netlify.app/` terbuka
- Refresh tab Smart Sheets jika perlu
- Coba reload extension

### Teks tidak terkirim:
- Pastikan teks benar-benar terpilih/highlight
- Coba pilih teks lagi
- Refresh halaman web

### Extension tidak bekerja:
- Reload extension di `chrome://extensions/`
- Refresh semua tab yang terbuka
- Cek console browser (F12) untuk error

## 🎯 Tips Penggunaan

1. **Biarkan tab Smart Sheets tetap terbuka** saat browsing
2. **Gunakan klik kanan** untuk pengalaman tercepat
3. **Perhatikan notifikasi** untuk konfirmasi
4. **Tab akan otomatis switch** ke Smart Sheets setelah berhasil

## 📊 Keunggulan Versi Baru

- 🚫 **Tidak ada tab baru** yang mengganggu
- ⚡ **Lebih cepat** dan efisien
- 👀 **Visual feedback** yang jelas
- 🎯 **Auto-focus** ke aplikasi
- 💡 **User experience** yang lebih baik

---

**🎉 Extension siap digunakan dengan pengalaman yang lebih smooth!**