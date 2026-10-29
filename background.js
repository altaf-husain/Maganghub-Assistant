// --- JADWAL ALARM MAGANGHUB ---
// Disimpan user lewat popup dalam bentuk { 'HH:MM': [hari, ...] }; kosong sampai user mengaturnya
// 0: Minggu, 1: Senin, 2: Selasa, 3: Rabu, 4: Kamis, 5: Jumat, 6: Sabtu

const MAGANGHUB_URL = 'https://monev.maganghub.kemnaker.go.id/dashboard';

// Zona waktu Indonesia (selisih jam dari UTC)
const TIMEZONE_OFFSETS = { WIB: 7, WITA: 8, WIT: 9 };

// Tebak zona waktu dari jam komputer; di luar Indonesia dianggap WIB
function detectTimezone() {
  const offsetHours = -new Date().getTimezoneOffset() / 60;
  return Object.keys(TIMEZONE_OFFSETS).find(zone => TIMEZONE_OFFSETS[zone] === offsetHours) || 'WIB';
}

// Waktu saat ini di zona terpilih; baca nilainya dengan getter UTC (getUTCHours, getUTCDay, dst.)
function nowInZone(timezone) {
  return new Date(Date.now() + TIMEZONE_OFFSETS[timezone] * 3600000);
}

// Tanggal hari ini (YYYY-MM-DD) di zona terpilih
function todayKey(timezone) {
  return nowInZone(timezone).toISOString().slice(0, 10);
}

// Ambil pengaturan alarm milik user dari storage
function getAlarmConfig(callback) {
  chrome.storage.local.get(['alarmSchedule', 'alarmTimezone'], (result) => {
    callback({
      schedule: result.alarmSchedule || {},
      timezone: TIMEZONE_OFFSETS[result.alarmTimezone] ? result.alarmTimezone : detectTimezone()
    });
  });
}

// Hapus hanya alarm jadwal (alarm_HH:MM)
function clearScheduleAlarms(callback) {
  chrome.alarms.getAll((alarms) => {
    const names = alarms.map(alarm => alarm.name).filter(name => name.startsWith('alarm_'));
    Promise.all(names.map(name => chrome.alarms.clear(name))).then(() => callback());
  });
}

// Fungsi untuk membuat/mereset alarm harian sesuai pengaturan user
function setupAlarms(callback) {
  getAlarmConfig((config) => {
    clearScheduleAlarms(() => {
      Object.keys(config.schedule).forEach(timeString => {
        const [hours, minutes] = timeString.split(':').map(Number);
        const now = nowInZone(config.timezone);
        const alarmTime = new Date(now.getTime());
        alarmTime.setUTCHours(hours, minutes, 0, 0);

        // Jika jam sudah terlewat hari ini, pasang untuk besok
        if (alarmTime.getTime() <= now.getTime()) {
          alarmTime.setUTCDate(alarmTime.getUTCDate() + 1);
        }

        const delayInMinutes = (alarmTime.getTime() - now.getTime()) / 60000;

        // Buat alarm yang berulang setiap 24 jam (1440 menit)
        chrome.alarms.create(`alarm_${timeString}`, {
          delayInMinutes: delayInMinutes,
          periodInMinutes: 1440
        });
      });
      console.log("Jadwal Alarm Otomatis Berhasil Diperbarui!");
      if (callback) callback();
    });
  });
}

// Pasang ulang alarm jika ada yang hilang, supaya pengingat selalu aktif
function ensureAlarms() {
  getAlarmConfig((config) => {
    chrome.alarms.getAll((alarms) => {
      const existing = alarms.map(alarm => alarm.name);
      const scheduled = existing.filter(name => name.startsWith('alarm_'));
      const expected = Object.keys(config.schedule).map(timeString => `alarm_${timeString}`);
      const complete = expected.length === scheduled.length && expected.every(name => scheduled.includes(name));
      if (!complete) setupAlarms();
    });
  });
}

// --- STATUS ABSEN HARI INI ---
// Disimpan sebagai tanggal terakhir user absen; notifikasi Chrome dilewati jika sama dengan hari ini.
function getAbsenStatus(callback) {
  getAlarmConfig((config) => {
    chrome.storage.local.get(['lastAbsenDate'], (result) => {
      callback({ done: result.lastAbsenDate === todayKey(config.timezone) });
    });
  });
}

function setAbsenStatus(done, callback) {
  getAlarmConfig((config) => {
    chrome.storage.local.set({ lastAbsenDate: done ? todayKey(config.timezone) : null }, () => {
      if (done) chrome.notifications.clear('reminderNotif');
      if (callback) callback();
    });
  });
}

// Jalankan otomatis saat ekstensi dipasang, di-refresh, atau browser dibuka
chrome.runtime.onInstalled.addListener(() => {
  setupAlarms();
});
chrome.runtime.onStartup.addListener(() => {
  setupAlarms();
});
// Setiap kali service worker terbangun, pastikan alarm masih lengkap
ensureAlarms();

// Dengarkan permintaan dari Popup dan halaman MagangHub
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'GET_ALARM_CONFIG') {
    getAlarmConfig(sendResponse);
    return true;
  }
  if (message.action === 'SAVE_ALARM_CONFIG') {
    chrome.storage.local.set({ alarmSchedule: message.schedule, alarmTimezone: message.timezone }, () => {
      setupAlarms(() => sendResponse({ success: true }));
    });
    return true;
  }
  if (message.action === 'GET_ABSEN_STATUS') {
    getAbsenStatus(sendResponse);
    return true;
  }
  if (message.action === 'SET_ABSEN_STATUS' || message.action === 'REPORT_SUBMITTED') {
    const done = message.action === 'REPORT_SUBMITTED' ? true : message.done;
    setAbsenStatus(done, () => sendResponse({ success: true, done: done }));
    return true;
  }
});

// LOGIKA SAAT ALARM BERBUNYI
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith('alarm_')) {
    const timeString = alarm.name.replace('alarm_', ''); // Contoh output: '11:30'

    getAlarmConfig((config) => {
      // Cek apakah hari ini (di zona waktu terpilih) diizinkan untuk jam tersebut
      const currentDay = nowInZone(config.timezone).getUTCDay(); // 0-6
      const allowedDays = config.schedule[timeString];
      if (!allowedDays || !allowedDays.includes(currentDay)) return;

      getAbsenStatus((status) => {
        if (status.done) return; // Sudah absen hari ini, tidak perlu diingatkan

        chrome.notifications.create('reminderNotif', {
          type: 'basic',
          iconUrl: 'icon.png', // Wajib ada file icon.png di folder
          title: '⏰ Waktunya Absen MagangHub!',
          message: 'Jangan lupa untuk mengisi laporan aktivitas magang kamu ya!',
          buttons: [{ title: '✔ Sudah Absen Hari Ini' }],
          priority: 2,
          requireInteraction: true // Notifikasi menetap sampai diklik
        });
      });
    });
  }
});

// Klik notifikasi untuk langsung buka web MagangHub
chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId === 'reminderNotif') {
    chrome.tabs.create({ url: MAGANGHUB_URL });
  }
});

// Tombol "Sudah Absen Hari Ini" di notifikasi
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (notificationId === 'reminderNotif' && buttonIndex === 0) {
    setAbsenStatus(true);
  }
});
