# MagangHub Assistant

Ekstensi Chrome untuk membantu peserta magang mengisi **laporan harian MagangHub**
(monev.maganghub.kemnaker.go.id).

- **Isi laporan otomatis dengan AI (Gemini).** Cukup tulis 1 poin aktivitas singkat (atau 3 poin), lalu AI
  menyusun kolom *Uraian aktivitas*, *Pembelajaran*, dan *Kendala* dan mengisinya ke form.
- **Alarm Otomatis.** Notifikasi Chrome muncul di jam dan hari yang kamu atur jika kamu belum absen hari itu.
- **Status absen hari ini.** Tercatat otomatis saat laporan diisi atau dikirim, dan bisa diubah manual.

> Versi ini **tidak** memakai pengingat WhatsApp. Jika ingin pengingat lewat WhatsApp (via Fonnte),
> pakai folder [versi-whatsapp-fonnte](versi-whatsapp-fonnte/) dan ikuti README di sana.

---

## Yang dibutuhkan

- Browser **Google Chrome** di laptop/PC (bisa juga Edge, Brave, atau browser berbasis Chromium lain).
- Akun **Google** untuk membuat API key Gemini (gratis).
- Akun **MagangHub** yang aktif.

---

## Langkah 1: Unduh dan ekstrak

1. Unduh file ZIP ekstensi ini.
2. Klik kanan file ZIP, pilih **Extract All** (Ekstrak Semua).
3. Pindahkan folder hasil ekstrak ke tempat yang **tidak akan dihapus**, misalnya `Documents\MagangHub Assistant`.
   Chrome membaca ekstensi langsung dari folder ini, jadi jika folder dihapus atau dipindah, ekstensi berhenti bekerja.

Pastikan di dalam folder tersebut **langsung** ada file `manifest.json` (bukan di dalam folder lain lagi).

## Langkah 2: Pasang di Chrome

1. Buka Chrome, ketik `chrome://extensions` di kolom alamat, lalu tekan Enter.
2. Aktifkan **Developer mode** (Mode pengembang) di pojok kanan atas.
3. Klik **Load unpacked** (Muat yang belum dibuka).
4. Pilih folder dari Langkah 1 (folder yang berisi `manifest.json`), lalu klik **Select Folder**.
5. Ekstensi **MagangHub Assistant** muncul di daftar.
6. Klik ikon puzzle 🧩 di kanan atas Chrome, lalu klik ikon pin 📌 di samping **MagangHub Assistant**
   supaya ikonnya selalu tampil di toolbar.

> Untuk Edge: buka `edge://extensions`, aktifkan **Developer mode** di menu kiri, lalu **Load unpacked**.

## Langkah 3: Buat dan simpan API key Gemini

1. Buka <https://aistudio.google.com/apikey> lalu login dengan akun Google.
2. Klik **Create API key**, lalu salin kunci yang muncul.
3. Klik ikon ekstensi di toolbar. Panel **⚙ Pengaturan Gemini API** terbuka otomatis saat pertama kali dipakai.
4. Tempel kunci di kolom **Gemini API Key**.
5. Kolom **Model Gemini** biarkan kosong (ekstensi otomatis memilih model tercepat).
6. Klik **Simpan & Test Koneksi**. Jika muncul *"Koneksi sukses! Gemini siap dipakai."*, pengaturan selesai.

API key tersimpan hanya di browser kamu. **Jangan bagikan API key ke orang lain.**

## Langkah 4: Atur Alarm Otomatis

1. Di popup ekstensi, bagian **Alarm Otomatis**, pilih zona waktu (**WIB**, **WITA**, atau **WIT**).
2. Isi jam pengingat. Klik **+ Jam** untuk menambah jam lain, klik **✕** untuk menghapus.
3. Centang hari pengingat (misalnya Sen sampai Jum).
4. Klik **Simpan**.

Notifikasi hanya muncul jika kamu **belum absen** hari itu. Klik notifikasinya untuk langsung membuka MagangHub,
atau klik **✔ Sudah Absen Hari Ini** untuk mematikan pengingat hari itu.

Chrome perlu dalam keadaan terbuka (boleh di latar belakang) supaya notifikasi bisa muncul.
Pastikan juga notifikasi Chrome diizinkan di pengaturan Windows (**Settings > System > Notifications**).

---

## Cara memakai

1. Login ke MagangHub dan buka **halaman form laporan harian**.
2. Klik ikon ekstensi.
3. Pilih **Mode Pengisian**:
   - **Ketik 1 Poin di Sini (AI buat 3 Form):** tulis satu aktivitas singkat. AI menyimpulkan pembelajaran dan kendala.
   - **Ketik 3 Poin di Sini (AI kembangkan):** tulis poin aktivitas, pembelajaran, dan kendala. AI mengembangkannya.
4. Klik tombol kuning **Buat & Isi Laporan dengan AI**, lalu tunggu loading bar selesai.
5. **Periksa hasilnya** di form MagangHub, ubah jika perlu, lalu klik tombol kirim di MagangHub.

Catatan:

- Kolom yang sudah berisi teks **tidak akan ditimpa**. Kosongkan dulu jika ingin diisi ulang oleh AI.
- Setelah laporan diisi, status **Absen hari ini** otomatis menjadi *Sudah*. Klik **Batalkan** jika ternyata belum
  dikirim, atau **Tandai sudah absen** jika kamu mengisi laporan secara manual.
- Jika proses terasa macet, klik tombol **⟳** di samping judul *Pengaturan Gemini API*, lalu coba lagi.

---

## Memperbarui ekstensi

1. Ganti isi folder ekstensi dengan file versi baru (folder yang sama seperti saat pemasangan).
2. Buka `chrome://extensions`, lalu klik ikon **⟳ Reload** pada kartu MagangHub Assistant.
3. Muat ulang (refresh) halaman MagangHub yang sedang terbuka.

Pengaturan (API key, alarm) tetap tersimpan selama ekstensi tidak dihapus.

## Menghapus ekstensi

Buka `chrome://extensions`, klik **Remove** pada MagangHub Assistant, lalu hapus foldernya jika sudah tidak dipakai.

---

## Jika ada masalah

| Masalah | Solusi |
|---|---|
| Muncul peringatan *"Disable developer mode extensions"* saat Chrome dibuka | Normal untuk ekstensi yang dipasang lewat Load unpacked. Klik silang/tutup saja, **jangan** klik Disable. |
| *"Manifest file is missing or unreadable"* saat Load unpacked | Folder yang dipilih salah. Pilih folder yang di dalamnya langsung ada `manifest.json`. |
| *"Koneksi gagal"* / *"API key Gemini tidak valid"* | Periksa kembali API key (tidak ada spasi tambahan), atau buat API key baru. |
| *"Buka halaman form laporan MagangHub dahulu"* | Buka halaman form laporan harian di MagangHub, lalu klik ikon ekstensi dari tab tersebut. |
| *"Tidak ada kolom yang diisi"* | Kolom form sudah berisi teks, atau form belum tampil. Kosongkan kolom / refresh halaman, lalu coba lagi. |
| *"Kuota model habis/sibuk"* / *"Semua model AI sedang gagal"* | Kuota gratis Gemini sedang habis atau server sibuk. Tunggu beberapa menit, klik ⟳, lalu coba lagi. |
| *"Gagal menyimpan jadwal"* / *"Pengaturan alarm belum aktif"* | Buka `chrome://extensions`, klik **Reload** pada ekstensi, lalu buka popup lagi. |
| Notifikasi alarm tidak muncul | Pastikan Chrome terbuka, notifikasi Chrome diizinkan di Windows, dan mode *Focus/Do not disturb* mati. |

## Privasi

- API key, jadwal alarm, dan status absen disimpan **hanya di browser kamu** (`chrome.storage.local`).
- Teks poin aktivitas yang kamu tulis dikirim ke **Google Gemini** untuk dibuatkan laporan.
- Ekstensi hanya berjalan di halaman `maganghub.kemnaker.go.id` dan tidak mengirim data ke server lain.
