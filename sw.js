// Service worker: simpan aplikasi di HP agar bisa dibuka tanpa internet.
// Naikkan VERSI setiap kali index.html diperbarui agar HP mengambil versi baru.
const VERSI = 'konsultasi-gizi-v22';
const FILE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
// Pustaka pembuat PDF, disimpan agar Unduh PDF bisa dipakai offline
const LIBS = ['https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js', 'https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSI).then(c => c.addAll(FILE).then(() => Promise.all(LIBS.map(u => c.add(u).catch(() => {}))))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== VERSI).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // Halaman: coba internet dulu (agar dapat versi terbaru), jika offline pakai simpanan
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(VERSI).then(x => x.put('./index.html', c)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  // Font Google & file lain: pakai simpanan, isi simpanan saat online
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
    if (r.ok || r.type === 'opaque') { const c = r.clone(); caches.open(VERSI).then(x => x.put(e.request, c)); }
    return r;
  })));
});
