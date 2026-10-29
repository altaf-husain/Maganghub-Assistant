# MagangHub Assistant

Ekstensi Chrome (Manifest V3) untuk membantu peserta magang mengisi **laporan harian MagangHub**
(monev.maganghub.kemnaker.go.id) dengan bantuan **Google Gemini API**.

- ✍️ **Auto-fill laporan dengan AI.** Tulis poin aktivitas singkat. Ekstensi memanggil Gemini API untuk menyusun
  field **Uraian aktivitas**, **Pembelajaran**, dan **Kendala**, lalu content script mengisinya ke form MagangHub.
- ⏰ **Alarm Otomatis.** Notifikasi Chrome (`chrome.alarms` + `chrome.notifications`) pada jam dan hari yang
  kamu atur, hanya jika status absen hari itu belum tercatat.
- ✅ **Status absen harian.** Tercatat otomatis saat laporan diisi/dikirim, dan bisa diubah manual dari popup.

Semua konfigurasi dilakukan sendiri oleh pengguna. Tidak ada backend atau akun dari pembuat ekstensi;
setiap pengguna memakai **Gemini API key** miliknya sendiri.

> ⚠️ Proyek pribadi, **bukan** aplikasi resmi Kemnaker/MagangHub. Selalu periksa hasil generate AI sebelum submit.

---

## Pilih versi

| Versi | Folder | Keterangan |
|---|---|---|
| **Standar** | root repositori | Pengingat lewat notifikasi Chrome saja. Tidak butuh layanan pihak ketiga selain Gemini API. |
| **WhatsApp (Fonnte)** | [`versi-whatsapp-fonnte/`](versi-whatsapp-fonnte/) | Tambahan pengingat WhatsApp lewat [Fonnte](https://fonnte.com) dengan device milik sendiri, plus server Google Apps Script opsional. |

Panduan di bawah untuk **versi standar**. Untuk versi WhatsApp, lihat
[versi-whatsapp-fonnte/README.md](versi-whatsapp-fonnte/README.md).

---

## Struktur folder

```
.
├── manifest.json      # Manifest V3: permissions, host_permissions, content script
├── background.js      # Service worker: jadwal alarm, notifikasi, status absen
├── content.js         # Content script di halaman MagangHub: deteksi tanggal & isi form
├── popup.html         # UI popup ekstensi
├── popup.js           # Logika popup: Gemini API, pemilihan model, pengaturan alarm
├── styles.css         # Style popup
├── icon.png
└── versi-whatsapp-fonnte/   # Versi dengan pengingat WhatsApp (lihat README di dalamnya)
```

## Cara kerja

1. Popup mengirim pesan `GET_DATE` ke content script untuk memastikan tab aktif adalah form MagangHub.
2. Popup memanggil endpoint `generateContent` Gemini API dengan `responseSchema` JSON (`activity`, `lesson`, `obstacle`).
3. Model dipilih otomatis dari daftar kandidat (`gemini-flash-lite-latest`, `gemini-2.5-flash-lite`,
   `gemini-flash-latest`, `gemini-2.5-flash`). Model yang terakhir sukses didahulukan; model yang terkena
   rate limit / quota / error dilewati sementara. Jika model pertama lambat, model berikutnya dijalankan paralel
   (*hedged request*) dan respons tercepat yang dipakai.
4. Hasil dikirim ke content script (`FILL_FORM`), yang mengisi `<textarea>` memakai native value setter dan
   men-dispatch event `input`/`change` agar terbaca oleh framework halaman. Field yang sudah berisi tidak ditimpa.
5. Service worker menyimpan `lastAbsenDate` dan memasang alarm harian `alarm_HH:MM` (periode 1440 menit)
   sesuai zona waktu WIB/WITA/WIT yang dipilih.

## Permissions

| Permission | Dipakai untuk |
|---|---|
| `storage` | Menyimpan API key, jadwal alarm, dan status absen di `chrome.storage.local` |
| `activeTab`, `scripting` | Menyuntikkan ulang `content.js` ke tab MagangHub yang dibuka sebelum ekstensi dipasang |
| `alarms`, `notifications` | Alarm harian dan notifikasi pengingat |
| `https://generativelanguage.googleapis.com/*` | Memanggil Gemini API |

---

## Prasyarat

- Google Chrome atau browser berbasis Chromium lain (Edge, Brave)
- Akun Google untuk membuat **Gemini API key** di Google AI Studio (ada free tier)
- Akun MagangHub

---

## Instalasi

### 1. Download source

Pilih salah satu:

- Klik **Code → Download ZIP** di halaman GitHub ini, lalu extract.
- Atau clone repositori:

  ```bash
  git clone <url-repositori-ini>
  ```

Simpan folder di lokasi permanen. Ekstensi *unpacked* dibaca langsung dari folder ini, jadi jangan dihapus atau dipindah.

### 2. Load unpacked extension

1. Buka `chrome://extensions` (Edge: `edge://extensions`).
2. Aktifkan **Developer mode**.
3. Klik **Load unpacked**, lalu pilih folder root repositori (folder yang berisi `manifest.json`).
4. Pin ekstensi lewat ikon 🧩 di toolbar agar mudah diakses.

💡 Error *"Manifest file is missing or unreadable"* berarti folder yang dipilih salah. Pilih folder yang langsung
berisi `manifest.json`.

### 3. Konfigurasi Gemini API key

1. Buat API key di **https://aistudio.google.com/apikey** (**Create API key**).
2. Buka popup ekstensi, panel **⚙ Pengaturan Gemini API**.
3. Tempel di field **Gemini API Key**, lalu klik **Simpan & Test Koneksi**.
   Ekstensi melakukan request ke endpoint model untuk memvalidasi key.

🔒 API key disimpan di `chrome.storage.local` dan hanya dikirim ke `generativelanguage.googleapis.com`.
Jangan commit atau bagikan API key.

### 4. Atur Alarm Otomatis

1. Di bagian **Alarm Otomatis**, pilih zona waktu (**WIB / WITA / WIT**). Default dideteksi dari offset jam sistem.
2. Tambahkan satu atau lebih jam (**+ Jam**) dan centang hari aktif.
3. Klik **Simpan**. Service worker akan membuat ulang semua alarm `alarm_HH:MM`.

---

## Penggunaan

1. Buka halaman form laporan harian di MagangHub.
2. Buka popup ekstensi dan pilih **Mode Pengisian**:
   - **1 poin:** isi aktivitas saja; AI menyimpulkan pembelajaran dan kendala.
   - **3 poin:** isi aktivitas, pembelajaran, dan kendala; AI mengembangkannya.
3. Klik **Buat & Isi Laporan dengan AI**. Progress bar memakai estimasi dari rata-rata durasi request sebelumnya.
4. Review hasil di form, lalu submit di MagangHub.

Catatan:

- Setelah form terisi, status absen otomatis menjadi *Sudah* sehingga alarm hari itu tidak memunculkan notifikasi.
  Content script juga menandai absen saat tombol *Kirim/Simpan* di halaman diklik. Koreksi manual tersedia lewat
  **Batalkan** / **Tandai sudah absen**.
- Tombol **⟳** membatalkan request yang sedang berjalan (`AbortController`), melakukan warm-up koneksi ke Gemini API,
  dan menyuntikkan ulang content script.
- Notifikasi hanya muncul jika Chrome sedang berjalan (service worker dibangunkan oleh `chrome.alarms`).

---

## Troubleshooting

| Gejala | Penyebab / solusi |
|---|---|
| Banner *"Disable developer mode extensions"* | Normal untuk ekstensi unpacked. Tutup saja, jangan klik *Disable*. |
| *"API key Gemini tidak valid"* / HTTP 400/401/403 | API key salah atau ada spasi. Generate ulang di AI Studio. |
| *"Kuota model … habis/sibuk"* / *"Semua model AI sedang gagal"* | Rate limit / quota free tier Gemini (HTTP 429) atau server overload (5xx). Tunggu beberapa menit, klik ⟳. |
| *"Buka halaman form laporan MagangHub dahulu"* | Content script tidak merespons; tab aktif bukan halaman MagangHub. |
| *"Tidak ada kolom yang diisi"* | Selector textarea tidak menemukan form, atau field sudah terisi. Refresh halaman. |
| *"Gagal menyimpan jadwal"* | Service worker versi lama masih aktif. Klik **Reload** di `chrome://extensions`. |
| Notifikasi tidak muncul | Cek izin notifikasi Chrome di OS dan mode *Do not disturb / Focus*. |

Untuk debugging, buka `chrome://extensions` → **Service worker** (log background) atau klik kanan popup → **Inspect**.

---

## Update

1. Pull perubahan terbaru (`git pull`) atau download ulang ZIP dan timpa file lama.
2. Klik **Reload** pada ekstensi di `chrome://extensions`, lalu refresh tab MagangHub.

Data di `chrome.storage.local` tetap tersimpan selama ekstensi tidak di-*remove*.

## Uninstall

Klik **Remove** di `chrome://extensions`. Semua data di `chrome.storage.local` ikut terhapus.

---

## Privasi

- API key, jadwal alarm, dan status absen disimpan lokal di `chrome.storage.local`.
- Teks poin aktivitas dikirim ke **Gemini API** memakai API key milik pengguna.
- Content script hanya berjalan di `https://*.maganghub.kemnaker.go.id/*`. Tidak ada data yang dikirim ke server lain.
