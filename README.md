# Dokumentasi Proyek: PARDALANI - AI Courier Copilot

Aplikasi asisten kurir AI berbasis mobile (*plek-ketiplek* dengan desain Figma) menggunakan **React 19 + Tailwind CSS + Capacitor** untuk Frontend/Mobile dan **Go Fiber** untuk Backend API.

---

## 1. Spesifikasi Stack Teknologi

- **Frontend & Mobile:** React 19, Tailwind CSS v4, Vite, Capacitor Mobile
  - Source Web: `src/` (`App.tsx`, `index.css`, `main.tsx`)
  - Native Android Container: `android/`
- **Backend API:** Go Fiber (Golang) — Folder: `backend/`
- **Database:** MongoDB (Port 27017) & Redis (Port 6379) via Docker Compose

---

## 2. Cara Menjalankan Proyek

### Langkah 1: Jalankan Database (Docker)
Masuk ke folder backend lalu jalankan:
```bash
cd backend
docker compose up -d
```

### Langkah 2: Jalankan Server Backend (Go Fiber)
Buka tab terminal pertama, masuk ke folder backend dan jalankan server:
```bash
cd backend
go run main.go
```
Server backend akan aktif di `http://localhost:8080`.

### Langkah 3: Jalankan Frontend / Mobile

#### A. Preview di Browser (Cepat & Ringan)
Buka tab terminal kedua di root proyek:
```bash
npm run dev
```
Buka URL `http://localhost:5173` di browser. Gunakan mode responsive/device toolbar (`Ctrl + Shift + M`) untuk melihat tampilan dalam rasio layar HP.

#### B. Menjalankan di HP Android / Emulator (Native APK)
1. Build web dan sinkronkan ke proyek Android:
   ```bash
   npm run build:mobile
   ```
2. Buka proyek di Android Studio:
   ```bash
   npm run open:android
   ```
   Lalu klik tombol **Run** ▶️ untuk menginstal ke HP atau pilih **Build APK** untuk membuat file `.apk`.

---

## 3. Fitur Utama UI (PARDALANI)

- **Header Banner "Horas, Kurir."**: Status metrik perhentian, paket, dan estimasi waktu.
- **Quick Action Chips**: Akses cepat optimasi rute, draft WhatsApp, cek resi, dan scan alamat.
- **Dua Pilihan Tema**: Mode Terang (*Soft Grey & White*) dan Mode Gelap (*Deep Charcoal & Volt Lime Green*).
- **Sidebar Drawer**: Riwayat percakapan terkelompok (Hari ini, Kemarin, Sebelumnya) dengan opsi pin, rename, share, dan delete.
- **Modal Interaktif**:
  - *Rute Tersimpan* (MDN-01, MDN-04, MDN-07)
  - *Log Pengantaran*
  - *Profil & Pengaturan* (4 Tab: Profil, Preferensi Tema & Bahasa, Parameter AI, Pusat Bantuan)
