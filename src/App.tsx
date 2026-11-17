import { useEffect, useMemo, useRef, useState } from "react"

type Language = "id" | "en"
type Theme = "light" | "dark"
type Overlay = "none" | "drawer" | "settings" | "saved" | "log" | "print" | "media" | "auth" | "scanner" | "handling_faq" | "handling_detail"
type AuthMode = "login" | "register" | "forgot" | "otp"
type IconName = "menu" | "search" | "close" | "more" | "route" | "message" | "scan" | "package" | "camera" | "image" | "file" | "mic" | "send" | "plus" | "printer" | "share" | "speaker" | "pin" | "edit" | "trash" | "bookmark" | "log" | "help" | "settings" | "user" | "shield" | "sun" | "moon" | "language" | "sliders" | "link" | "copy" | "refresh" | "external" | "check" | "warning" | "chevron" | "clock" | "phone" | "whatsapp"

type RouteStep = {
  no: number
  address: string
  eta: string
  status: string
  statusEn: string
}

type ChatAction = {
  type: "whatsapp" | "maps" | "call"
  label: string
  target: string
  text?: string
}

type ChatMessage = {
  id: string
  sender: "user" | "ai"
  text: string
  time?: string
  isStreaming?: boolean
  imageUrl?: string
  fileName?: string
  actions?: ChatAction[]
}

type HistorySession = {
  id: string | number
  title: string
  titleEn: string
  preview: string
  previewEn: string
  time: string
  timeEn: string
  group: "today" | "yesterday" | "earlier"
  pinned?: boolean
}

const copy = {
  id: {
    greeting: "Horas, Budi.",
    subtitle: "Mau antar paket lebih cepat hari ini?",
    stops: "Pemberhentian",
    packages: "Paket",
    estimate: "Estimasi",
    quick: "Aksi Cepat",
    quickHint: "Pilih bantuan yang kamu butuhkan",
    optimize: "Optimalkan Rute",
    whatsapp: "Buat Draft WhatsApp",
    scanner: "Scan Label / Resi",
    handling: "Info Penanganan",
    printLabel: "Cetak Resi",
    today: "Hari ini",
    yesterday: "Kemarin",
    earlier: "Sebelumnya",
    history: "Riwayat percakapan",
    search: "Cari percakapan...",
    saved: "Rute Tersimpan",
    deliveryLog: "Log Pengantaran",
    help: "Pusat Bantuan",
    settings: "Pengaturan",
    placeholder: "Tanya soal rute atau paket...",
    copy: "Salin",
    regenerate: "Buat ulang",
    startNav: "Mulai Navigasi",
    nextStop: "TUJUAN BERIKUTNYA",
    routeReady: "Rute tercepat sudah siap",
    routeIntro:
      "Saya sudah menyusun 4 tujuan berdasarkan jarak, prioritas, dan waktu penerima.",
    priority: "Paket prioritas diantar lebih dulu.",
    fragile: "Satu paket pecah belah perlu posisi tegak.",
    traffic: "Hindari Jl. Sudirman hingga pukul 10.30.",
    sequence: "Urutan",
    destination: "Tujuan",
    account: "Akun",
    preferences: "Preferensi",
    ai: "Asisten AI",
    light: "Terang",
    dark: "Gelap",
    language: "Bahasa",
    security: "Akun & Keamanan",
    verified: "Terverifikasi",
    manage: "Kelola Keamanan",
    backend: "Koneksi Layanan",
    temperature: "Gaya Respon Asisten",
    maxTokens: "Kapasitas Percakapan",
    prompt: "Panduan Jawaban Asisten",
    save: "Simpan perubahan",
    reset: "Reset default",
    localNote: "Pengaturan ini hanya disimpan selama sesi prototipe.",
    contact: "Kontak pengembang",
    faq: "Pertanyaan umum",
    profile: "Profil & Pengaturan",
    pinned: "Disematkan",
    rename: "Ubah nama",
    delete: "Hapus",
    pin: "Sematkan",
    cancel: "Batal",
    confirmDelete: "Hapus percakapan ini?",
    deleteHint: "Tindakan ini tidak dapat dibatalkan.",
    emptySearch: "Percakapan tidak ditemukan",
    resetSearch: "Hapus pencarian",
    unpin: "Lepas sematan",
    share: "Bagikan",
    shareConversation: "Bagikan percakapan",
    listen: "Dengarkan",
  },
  en: {
    greeting: "Good morning, Budi.",
    subtitle: "Ready to deliver faster today?",
    stops: "Stops",
    packages: "Packages",
    estimate: "Estimate",
    quick: "Quick Actions",
    quickHint: "Choose the help you need",
    optimize: "Optimize Route",
    whatsapp: "Build WhatsApp Draft",
    scanner: "Scan Label / Receipt",
    handling: "Package Handling",
    printLabel: "Print Label",
    today: "Today",
    yesterday: "Yesterday",
    earlier: "Earlier",
    history: "Chat history",
    search: "Search conversations...",
    saved: "Saved Routes",
    deliveryLog: "Delivery Log",
    help: "Help Center",
    settings: "Settings",
    placeholder: "Ask about a route or package...",
    copy: "Copy",
    regenerate: "Regenerate",
    startNav: "Start Navigation",
    nextStop: "NEXT STOP",
    routeReady: "Your fastest route is ready",
    routeIntro:
      "I arranged 4 stops based on distance, priority, and recipient availability.",
    priority: "Priority package goes first.",
    fragile: "One fragile package must stay upright.",
    traffic: "Avoid Sudirman St. until 10:30.",
    sequence: "Order",
    destination: "Destination",
    account: "Account",
    preferences: "Preferences",
    ai: "AI Assistant",
    light: "Light",
    dark: "Dark",
    language: "Language",
    security: "Account & Security",
    verified: "Verified",
    manage: "Manage Security",
    backend: "Service Connection",
    temperature: "Assistant Response Tone",
    maxTokens: "Chat Capacity",
    prompt: "Assistant Guidelines",
    save: "Save changes",
    reset: "Reset defaults",
    localNote: "These settings are stored only for this prototype session.",
    contact: "Developer contact",
    faq: "Common questions",
    profile: "Profile & Settings",
    pinned: "Pinned",
    rename: "Rename",
    delete: "Delete",
    pin: "Pin",
    cancel: "Cancel",
    confirmDelete: "Delete this conversation?",
    deleteHint: "This action cannot be undone.",
    emptySearch: "No conversations found",
    resetSearch: "Clear search",
    unpin: "Unpin",
    share: "Share",
    shareConversation: "Share conversation",
    listen: "Listen",
  },
}

const initialHistory: HistorySession[] = [
  {
    id: "session_1",
    title: "Rute Medan Kota",
    titleEn: "Central Medan Route",
    preview: "4 tujuan · 6 paket · 58 menit",
    previewEn: "4 stops · 6 packages · 58 minutes",
    time: "09.12",
    timeEn: "09:12",
    group: "today",
    pinned: true,
  },
  {
    id: "session_2",
    title: "Draft untuk Bu Rina",
    titleEn: "Draft for Mrs. Rina",
    preview: "Paket tiba sekitar pukul 11.30",
    previewEn: "Package arriving around 11:30",
    time: "08.45",
    timeEn: "08:45",
    group: "today",
  },
  {
    id: "session_3",
    title: "Cek resi SPX-2781",
    titleEn: "Check label SPX-2781",
    preview: "Label berhasil dibaca",
    previewEn: "Label scanned successfully",
    time: "16.20",
    timeEn: "16:20",
    group: "yesterday",
  },
  {
    id: "session_4",
    title: "Paket pecah belah",
    titleEn: "Fragile package",
    preview: "Simpan tegak, hindari guncangan",
    previewEn: "Keep upright and avoid impacts",
    time: "Sen",
    timeEn: "Mon",
    group: "earlier",
  },
]

const routeSteps: RouteStep[] = [
  { no: 1, address: "Jl. Sei Batang Hari 12", eta: "09.28", status: "2 paket", statusEn: "2 packages" },
  { no: 2, address: "Jl. Iskandar Muda 91", eta: "09.42", status: "Prioritas", statusEn: "Priority" },
  { no: 3, address: "Jl. Abdullah Lubis 38", eta: "10.05", status: "Pecah belah", statusEn: "Fragile" },
  { no: 4, address: "Jl. Gajah Mada 17", eta: "10.24", status: "1 paket", statusEn: "1 package" },
]

const iconPaths: Record<IconName, React.ReactNode> = {
  menu: (
    <>
      <path d="M4 7h16M4 12h12M4 17h16" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </>
  ),
  close: (
    <>
      <path d="m6 6 12 12M18 6 6 18" />
    </>
  ),
  more: (
    <>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </>
  ),
  route: (
    <>
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="6" r="2" />
      <path d="M8 18h3a3 3 0 0 0 3-3V9a3 3 0 0 1 3-3h-1M9 6H5a2 2 0 0 0-2 2v2" />
      <path d="m7 8 2-2-2-2" />
    </>
  ),
  message: (
    <>
      <path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8l-5 3v-3H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
      <path d="M8 9h8M8 13h5" />
    </>
  ),
  scan: (
    <>
      <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M8 8v8M11 8v8M15 8v8M17 8v8" />
    </>
  ),
  package: (
    <>
      <path d="m4 8 8-4 8 4v9l-8 4-8-4Z" />
      <path d="m4 8 8 4 8-4M12 12v9M8 6l8 4" />
    </>
  ),
  camera: (
    <>
      <path d="M4 7h4l1.5-2h5L16 7h4a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9" r="1.5" />
      <path d="m4 17 5-5 3 3 2-2 6 6" />
    </>
  ),
  file: (
    <>
      <path d="M6 3h8l4 4v14H6Z" />
      <path d="M14 3v5h5M9 12h6M9 16h6" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3" width="6" height="12" rx="3" />
      <path d="M5.5 12a6.5 6.5 0 0 0 13 0M12 18.5V22M9 22h6" />
    </>
  ),
  send: (
    <>
      <path d="m4 4 17 8-17 8 3-8Z" />
      <path d="M7 12h14" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14M5 12h14" />
    </>
  ),
  printer: (
    <>
      <path d="M7 9V4h10v5M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
      <path d="M7 14h10v7H7ZM17 12h.01" />
    </>
  ),
  share: (
    <>
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5" />
    </>
  ),
  speaker: (
    <>
      <path d="M5 9v6h4l5 4V5L9 9Z" />
      <path d="M17 9a4 4 0 0 1 0 6M19.5 6.5a8 8 0 0 1 0 11" />
    </>
  ),
  pin: (
    <>
      <path d="m9 4 6 0-1 5 3 3v2H7v-2l3-3ZM12 14v7" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4l11-11-4-4L4 16v4ZM13.5 6.5l4 4" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16M9 3h6l1 4M7 7l1 14h8l1-14M10 11v6M14 11v6" />
    </>
  ),
  bookmark: (
    <>
      <path d="M6 4h12v17l-6-4-6 4Z" />
    </>
  ),
  log: (
    <>
      <path d="M5 4h14v16H5Z" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1 .7-1.5 1.2-1.5 2.5M12 17h.01" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19 14.5l2 1.5-2 3-2.3-1a8 8 0 0 1-2.2 1.2L14 22h-4l-.5-2.8A8 8 0 0 1 7.3 18L5 19l-2-3 2-1.5a8 8 0 0 1 0-5L3 8l2-3 2.3 1a8 8 0 0 1 2.2-1.2L10 2h4l.5 2.8A8 8 0 0 1 16.7 6L19 5l2 3-2 1.5a8 8 0 0 1 0 5Z" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 20 6v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6Z" />
      <path d="m9 12 2 2 4-5" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  moon: (
    <>
      <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" />
    </>
  ),
  language: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" />
    </>
  ),
  sliders: (
    <>
      <path d="M4 6h5M15 6h5M12 3v6M4 12h9M17 12h3M15 9v6M4 18h3M13 18h7M10 15v6" />
    </>
  ),
  link: (
    <>
      <path d="M10 13a4 4 0 0 0 5.7 0l2.8-2.8a4 4 0 0 0-5.7-5.7L11 6.3M14 11a4 4 0 0 0-5.7 0l-2.8 2.8a4 4 0 0 0 5.7 5.7l1.8-1.8" />
    </>
  ),
  copy: (
    <>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 7v5h-5M4 17v-5h5" />
      <path d="M6.1 8a7 7 0 0 1 11.5-1L20 12M4 12l2.4 5a7 7 0 0 0 11.5-1" />
    </>
  ),
  external: (
    <>
      <path d="M14 4h6v6M20 4l-9 9" />
      <path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" />
    </>
  ),
  check: (
    <>
      <path d="m5 12 4 4L19 6" />
    </>
  ),
  warning: (
    <>
      <path d="M12 3 2.5 20h19Z" />
      <path d="M12 9v5M12 17h.01" />
    </>
  ),
  chevron: (
    <>
      <path d="m9 6 6 6-6 6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  phone: (
    <>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M17.47 14.38c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.95 1.18-.18.2-.35.23-.65.08-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.67-2.08-.18-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.63-.93-2.24-.25-.6-.5-.52-.68-.53l-.58-.01c-.2 0-.53.08-.8.38-.28.3-1.07 1.05-1.07 2.56 0 1.51 1.1 2.97 1.25 3.17.15.2 2.16 3.3 5.23 4.63.73.32 1.3.5 1.74.64.73.23 1.4.2 1.93.12.59-.09 1.78-.73 2.03-1.43.25-.7.25-1.31.18-1.43-.07-.13-.27-.2-.57-.35Z" />
      <path d="M12 2a10 10 0 0 0-8.66 15L2 22l5.16-1.34A10 10 0 1 0 12 2Zm0 18.18a8.16 8.16 0 0 1-4.16-1.14l-.3-.18-3.09.81.82-3.01-.2-.31a8.18 8.18 0 1 1 6.93 3.83Z" />
    </>
  ),
}

function Icon({
  name,
  size = 20,
  style,
  className,
}: {
  name: IconName
  size?: number
  style?: React.CSSProperties
  className?: string
}) {
  return (
    <svg
      aria-hidden="true"
      className={className ? `icon ${className}` : "icon"}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      {iconPaths[name]}
    </svg>
  )
}

function BrandMark({ size = 38 }: { size?: number }) {
  return (
    <svg
      aria-label="Pardalani"
      className="brand-mark"
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
    >
      <rect width="48" height="48" rx="14" fill="currentColor" />
      <path
        d="M14 36V12h11.4c7 0 11.6 3.7 11.6 9.7 0 5.7-4.2 9.2-10.5 9.2H21V36h-7Z"
        fill="var(--brand-mark-ink)"
      />
      <path
        d="M21 18h4.2c2.9 0 4.7 1.3 4.7 3.8 0 2.4-1.8 3.7-4.7 3.7H21V18Z"
        fill="currentColor"
      />
      <path
        d="m27 13.5 8-4.5-1.6 8.9"
        stroke="var(--brand-mark-ink)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconButton({
  icon,
  label,
  onClick,
  className = "",
}: {
  icon: IconName
  label: string
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      className={`icon-button ${className}`}
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      <Icon name={icon} />
    </button>
  )
}

function GoogleLogoIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0, display: "inline-block", verticalAlign: "middle" }}
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  )
}

const GOOGLE_AUTH_CONFIG = {
  clientId:
    (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
    "465305490356-placeholder.apps.googleusercontent.com",
  projectId: "pardalani-courier",
  authUri: "https://accounts.google.com/o/oauth2/auth",
  tokenUri: "https://oauth2.googleapis.com/token",
  clientSecret: "",
  redirectUris: ["http://localhost:3000/api/auth/google/callback"],
  javascriptOrigins: ["http://localhost:3000"],
}

function SplashMapBackground() {
  return (
    <svg
      className="splash-bg-map"
      viewBox="0 0 360 640"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Light street grid network */}
      <g stroke="currentColor" strokeWidth="1" opacity="0.07">
        <line x1="-40" y1="80" x2="400" y2="80" />
        <line x1="-40" y1="160" x2="400" y2="160" />
        <line x1="-40" y1="240" x2="400" y2="240" />
        <line x1="-40" y1="320" x2="400" y2="320" />
        <line x1="-40" y1="400" x2="400" y2="400" />
        <line x1="-40" y1="480" x2="400" y2="480" />
        <line x1="-40" y1="560" x2="400" y2="560" />
        <line x1="60" y1="-40" x2="60" y2="680" />
        <line x1="120" y1="-40" x2="120" y2="680" />
        <line x1="180" y1="-40" x2="180" y2="680" />
        <line x1="240" y1="-40" x2="240" y2="680" />
        <line x1="300" y1="-40" x2="300" y2="680" />
      </g>
      {/* Main avenues in soft lime and slate */}
      <g stroke="#C9F43B" strokeWidth="2.8" opacity="0.22" strokeLinecap="round">
        <path d="M -30 220 L 140 100 L 390 280" />
        <path d="M 40 580 L 210 440 L 390 490" />
        <path d="M -20 410 L 170 350 L 340 160" />
      </g>
      <g stroke="currentColor" strokeWidth="2" opacity="0.1" strokeLinecap="round">
        <path d="M 110 -20 L 180 260 L 100 660" />
        <path d="M -30 160 L 260 200 L 390 140" />
        <path d="M 290 -20 L 240 350 L 360 670" />
      </g>
    </svg>
  )
}

function SplashCourierScene() {
  return (
    <div className="splash-courier-stage">
      <svg
        className="splash-courier-svg"
        viewBox="0 0 320 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <filter id="courierShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#1F223D" floodOpacity="0.16" />
          </filter>
        </defs>

        {/* 1. Curved Lime Route Line */}
        <path
          className="splash-road-path"
          d="M 20 185 C 65 185, 100 165, 145 142 C 190 118, 225 92, 260 65"
          stroke="#B8EB38"
          strokeWidth="6.5"
          strokeLinecap="round"
        />

        {/* 2. Destination Pin at (260, 65) */}
        <g className="splash-dest-pin" transform="translate(260, 65)">
          <circle cx="0" cy="0" r="9" fill="#B8EB38" opacity="0.35" className="pin-ground-pulse" />
          <path
            d="M 0 0 C -6 -10 -12 -19 -12 -26 C -12 -34 -7 -40 0 -40 C 7 -40 12 -34 12 -26 C 12 -19 6 -10 0 0 Z"
            fill="#84CC16"
            stroke="#1F223D"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <circle cx="0" cy="-26" r="4" fill="#1F223D" />
        </g>

        {/* 3. Courier Rider on Scooter with Speed Streaks */}
        <g
          className="splash-courier-rider"
          transform="translate(145, 140) rotate(-18)"
          filter="url(#courierShadow)"
        >
          {/* Speed Streaks behind courier */}
          <g className="splash-speed-streaks" stroke="#84CC16" strokeWidth="2.2" strokeLinecap="round">
            <line x1="-50" y1="2" x2="-12" y2="2" opacity="0.75" />
            <line x1="-65" y1="12" x2="-18" y2="12" opacity="0.9" />
            <line x1="-42" y1="22" x2="-14" y2="22" opacity="0.6" />
            <line x1="-58" y1="32" x2="-22" y2="32" opacity="0.8" />
            <line x1="-36" y1="40" x2="-10" y2="40" opacity="0.5" />
          </g>

          {/* Rear Wheel */}
          <circle cx="-1" cy="48" r="11" fill="#1F223D" />
          <circle cx="-1" cy="48" r="5" fill="#E2E8F0" stroke="#1F223D" strokeWidth="1.5" />

          {/* Front Wheel */}
          <circle cx="43" cy="40" r="11" fill="#1F223D" />
          <circle cx="43" cy="40" r="5" fill="#E2E8F0" stroke="#1F223D" strokeWidth="1.5" />

          {/* Scooter Floorboard / Chassis */}
          <path d="M 6 45 L 26 45" stroke="#1F223D" strokeWidth="3" strokeLinecap="round" />

          {/* Delivery Backpack / Thermal Box on rear rack */}
          <g transform="translate(-20, 16)">
            <rect x="0" y="0" width="24" height="24" rx="3.5" fill="#B8EB38" stroke="#1F223D" strokeWidth="2.2" />
            <line x1="12" y1="0" x2="12" y2="24" stroke="#1F223D" strokeWidth="2" />
            <line x1="0" y1="12" x2="24" y2="12" stroke="#1F223D" strokeWidth="2" />
          </g>

          {/* Lime Scooter Body / Fairing */}
          <path
            d="M 2 46 C 4 36, 12 34, 20 38 L 30 42 C 34 32, 40 22, 42 16 L 38 15 C 33 22, 28 32, 22 36 Z"
            fill="#A3E635"
            stroke="#1F223D"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />

          {/* Front Apron / Cowl */}
          <path
            d="M 40 18 Q 44 26, 45 36 Q 47 42, 43 45"
            fill="none"
            stroke="#1F223D"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Handlebar & Grip */}
          <path d="M 37 13 L 41 18" stroke="#1F223D" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="36" cy="12" r="2.5" fill="#1F223D" />

          {/* Courier Rider Legs & Pants (Navy) */}
          <path
            d="M 12 28 L 18 39 L 26 39"
            fill="none"
            stroke="#1F223D"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Courier Torso (White Jacket) */}
          <path
            d="M 9 18 Q 14 14, 24 18 L 26 28 L 13 28 Z"
            fill="#FFFFFF"
            stroke="#1F223D"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />

          {/* Courier Arm holding Handlebar */}
          <path
            d="M 18 19 L 28 22 L 36 14"
            fill="none"
            stroke="#1F223D"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Courier Head with Lime Helmet */}
          <circle cx="19" cy="9" r="9" fill="#B8EB38" stroke="#1F223D" strokeWidth="2.2" />
          {/* Helmet Visor */}
          <path d="M 23 8 Q 27 10, 25 14" fill="none" stroke="#1F223D" strokeWidth="2.2" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  )
}

function App() {
  const [language, setLanguage] = useState<Language>("id")
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return (localStorage.getItem("pardalani_theme") as Theme) || "light"
    } catch {
      return "light"
    }
  })
  const [overlay, setOverlay] = useState<Overlay>("none")
  const [settingsSection, setSettingsSection] =
    useState<"profile" | "prefs" | "ai" | "help">("profile")
  const [history, setHistory] = useState(initialHistory)
  const [search, setSearch] = useState("")
  const [activeMenu, setActiveMenu] = useState<string | number | null>(null)
  const [renaming, setRenaming] = useState<string | number | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const [deleting, setDeleting] = useState<string | number | null>(null)
  const [composer, setComposer] = useState("")
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem("pardalani_chat_history")
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }
    } catch {}
    return []
  })
  const [activeSessionId, setActiveSessionId] = useState<string>("session_1")
  const [isTyping, setIsTyping] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [toast, setToast] = useState("")
  const [splashPhase, setSplashPhase] = useState<"loading" | "fading" | "done">("loading")
  const [splashStep, setSplashStep] = useState(0)
  const [showWelcome, setShowWelcome] = useState(() => {
    try {
      return localStorage.getItem("pardalani_welcomed") !== "true"
    } catch {
      return true
    }
  })
  const [welcomeSlide, setWelcomeSlide] = useState(0)
  const [showGooglePicker, setShowGooglePicker] = useState(false)
  const [customGoogleEmail, setCustomGoogleEmail] = useState("")
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false)
  const [showGoogleHelp, setShowGoogleHelp] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [speakingText, setSpeakingText] = useState<string | null>(null)
  const [temperature, setTemperature] = useState(0.4)
  const [systemPrompts, setSystemPrompts] = useState({
    id: "Kamu adalah asisten kurir yang ringkas, aman, dan memahami konteks pengantaran di Indonesia.",
    en: "You are a concise and safety-focused courier assistant who understands delivery operations in Indonesia.",
  })
  const [showAdvancedServer, setShowAdvancedServer] = useState(false)

  const defaultBackendUrl = (() => {
    if (typeof window === "undefined") return "http://localhost:8080"
    const isAndroid = /android/i.test(navigator.userAgent)
    if (isAndroid) {
      return "http://10.0.2.2:8080"
    }
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      return "http://localhost:8080"
    }
    if (window.location.hostname !== "") {
      return `http://${window.location.hostname}:8080`
    }
    return "http://localhost:8080"
  })()

  const [backendUrl, setBackendUrl] = useState<string>(() => {
    try {
      return localStorage.getItem("backend_url") || defaultBackendUrl
    } catch {
      return defaultBackendUrl
    }
  })
  const [backendStatus, setBackendStatus] = useState<
    "checking" | "connected" | "disconnected"
  >("checking")

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const saved = localStorage.getItem("pardalani_auth")
      if (saved) {
        const parsed = JSON.parse(saved)
        return Boolean(parsed?.isAuthenticated)
      }
    } catch {}
    return false
  })
  const [accountSource, setAccountSource] = useState<"email" | "google">(() => {
    try {
      const saved = localStorage.getItem("pardalani_auth")
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed?.accountSource === "google") return "google"
      }
    } catch {}
    return "email"
  })
  const [authMode, setAuthMode] = useState<AuthMode>("login")
  const [otpPurpose, setOtpPurpose] = useState<"register" | "password">(
    "register",
  )
  const [authForm, setAuthForm] = useState<{
    name: string
    email: string
    phone: string
    courierId: string
    area: string
    password: string
    newPassword: string
    avatarUrl?: string
  }>(() => {
    try {
      const saved = localStorage.getItem("pardalani_auth")
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed?.email) {
          return {
            name: parsed.name || "",
            email: parsed.email || "",
            phone: parsed.phone || "",
            courierId: parsed.courierId || "",
            area: parsed.area || "",
            password: "",
            newPassword: "",
            avatarUrl: parsed.avatarUrl || parsed.picture || "",
          }
        }
      }
    } catch {}
    return {
      name: "",
      email: "",
      phone: "",
      courierId: "",
      area: "",
      password: "",
      newPassword: "",
      avatarUrl: "",
    }
  })
  const [otp, setOtp] = useState("")
  const closeRef = useRef<HTMLButtonElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const documentInputRef = useRef<HTMLInputElement>(null)
  const scannerVideoRef = useRef<HTMLVideoElement>(null)
  const scannerStreamRef = useRef<MediaStream | null>(null)
  const [scannerFlash, setScannerFlash] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [selectedHandlingTopic, setSelectedHandlingTopic] = useState<string>("fragile")
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [complaintCategory, setComplaintCategory] = useState("Rute & Navigasi")
  const [complaintMessage, setComplaintMessage] = useState("")
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false)
  const t = copy[language]
  const currentDate = new Intl.DateTimeFormat(
    language === "id" ? "id-ID" : "en-US",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  ).format(new Date())
  const displayName =
    authForm.name.trim() ||
    (accountSource === "google"
      ? language === "id"
        ? "Akun Google"
        : "Google Account"
      : authForm.email.split("@")[0] ||
        (language === "id" ? "Pengguna" : "User"))
  const firstName = displayName.split(" ")[0]
  const profileInitials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
  const maxTokens = 4096
  const sessionText = [
    "Rute siap dijalankan",
    "4 perhentian telah dioptimalkan untuk efisiensi waktu dan konsumsi bahan bakar.",
    "Paket prioritas diantar lebih dulu.",
    "Satu paket pecah belah perlu posisi tegak.",
    "Hindari Jl. Sudirman hingga pukul 10.30 karena pasar tumpah.",
    ...routeSteps.flatMap((step) => [step.address, step.status]),
    ...chatMessages.map((m) => m.text),
  ].join(" ")
  const usedTokens = Math.min(
    maxTokens,
    Math.ceil(sessionText.length / 4),
  )
  const remainingTokens = maxTokens - usedTokens
  const tokenLocale = language === "id" ? "id-ID" : "en-US"

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(""), 2300)
  }

  const checkBackendHealth = async (url = backendUrl) => {
    try {
      setBackendStatus("checking")
      const res = await fetch(`${url}/api/health`, { method: "GET" })
      if (res.ok) {
        setBackendStatus("connected")
        return true
      }
      setBackendStatus("disconnected")
      return false
    } catch {
      setBackendStatus("disconnected")
      return false
    }
  }

  const submitComplaint = async () => {
    if (!complaintMessage.trim()) {
      notify(
        language === "id"
          ? "Tuliskan pesan masukan atau keluhan"
          : "Enter your feedback or complaint",
      )
      return
    }
    setIsSubmittingComplaint(true)
    try {
      const res = await fetch(`${backendUrl}/api/support/complaint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: authForm.email || "kurir@pardalani.id",
          category: complaintCategory,
          message: complaintMessage.trim(),
        }),
      })
      const data = await res.json()
      setIsSubmittingComplaint(false)
      if (res.ok && data.status === "ok") {
        setComplaintMessage("")
        notify(
          data.message ||
            (language === "id"
              ? "Masukan berhasil dikirim ke Developer!"
              : "Feedback sent to developer!"),
        )
      } else {
        notify(
          data.error ||
            (language === "id"
              ? "Gagal mengirim masukan"
              : "Failed to send feedback"),
        )
      }
    } catch {
      setIsSubmittingComplaint(false)
      notify(
        language === "id"
          ? "Keluhan dicatat (Mode Offline)"
          : "Feedback saved (Offline Mode)",
      )
      setComplaintMessage("")
    }
  }

  const startVoiceInput = () => {
    triggerHaptic(20)
    if (isListening) {
      if (typeof window !== "undefined" && (window as any).AndroidSpeech?.stopListening) {
        ;(window as any).AndroidSpeech.stopListening()
      }
      setIsListening(false)
      return
    }

    // 1. Native Android Speech Recognizer (Google Voice) - Silent in-process, automatic typing
    if (typeof window !== "undefined" && (window as any).AndroidSpeech?.startListening) {
      setIsListening(true)
      ;(window as any).AndroidSpeech.startListening(language === "id" ? "id-ID" : "en-US")
      return
    }

    // 2. Web Speech Recognition fallback for browser (no toasts, streaming directly to composer)
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      return
    }
    try {
      const recognition = new SpeechRecognition()
      recognition.lang = language === "id" ? "id-ID" : "en-US"
      recognition.interimResults = true
      recognition.continuous = false
      recognition.onstart = () => {
        setIsListening(true)
      }
      recognition.onresult = (event: any) => {
        let transcript = ""
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript
        }
        if (transcript) {
          setComposer(transcript)
        }
      }
      recognition.onend = () => {
        setIsListening(false)
      }
      recognition.onerror = () => {
        setIsListening(false)
      }
      recognition.start()
    } catch {
      setIsListening(false)
    }
  }

  const fetchSessions = async (url = backendUrl) => {
    try {
      const res = await fetch(`${url}/api/sessions`)
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        setHistory((prev) => {
          const backendItems: HistorySession[] = data.map(
            (item: any, idx: number) => {
              const existing = prev.find(
                (p) => String(p.id) === String(item.id),
              )
              return {
                id: item.id || `session_${idx}`,
                title: item.title || "Percakapan",
                titleEn: item.title || "Conversation",
                preview: item.title
                  ? `${item.title.slice(0, 32)}...`
                  : "Riwayat",
                previewEn: item.title
                  ? `${item.title.slice(0, 32)}...`
                  : "History",
                time: item.created_at
                  ? new Date(item.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "09.00",
                timeEn: item.created_at
                  ? new Date(item.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "09:00",
                group: idx < 2 ? "today" : idx < 4 ? "yesterday" : "earlier",
                pinned: existing ? existing.pinned : idx === 0,
              }
            },
          )
          return backendItems
        })
      }
    } catch {
      // Local mock history remains active
    }
  }

  useEffect(() => {
    checkBackendHealth()
    fetchSessions()
    const s1 = window.setTimeout(() => setSplashStep(1), 1100)
    const s2 = window.setTimeout(() => setSplashStep(2), 2200)
    const s3 = window.setTimeout(() => setSplashStep(3), 3300)
    const s4 = window.setTimeout(() => setSplashStep(4), 4300)
    const fadeTimer = window.setTimeout(() => {
      setSplashPhase("fading")
    }, 5200)
    const hideTimer = window.setTimeout(() => {
      setSplashPhase("done")
    }, 5800)
    return () => {
      window.clearTimeout(s1)
      window.clearTimeout(s2)
      window.clearTimeout(s3)
      window.clearTimeout(s4)
      window.clearTimeout(fadeTimer)
      window.clearTimeout(hideTimer)
    }
  }, [])

  const triggerHaptic = (ms = 35) => {
    try {
      if (typeof window !== "undefined" && (window as any).AndroidHaptic?.vibrate) {
        ;(window as any).AndroidHaptic.vibrate(ms)
      } else if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(ms)
      }
    } catch {}
  }

  useEffect(() => {
    try {
      if (chatMessages.length > 0) {
        localStorage.setItem("pardalani_chat_history", JSON.stringify(chatMessages))
      }
    } catch {}
  }, [chatMessages])

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme)
    }
    try {
      localStorage.setItem("pardalani_theme", theme)
    } catch {}
    try {
      if (typeof window !== "undefined" && (window as any).AndroidTheme?.setStatusBarTheme) {
        ;(window as any).AndroidTheme.setStatusBarTheme(theme === "dark")
      }
    } catch {}
  }, [theme])

  const switchTheme = (targetTheme?: Theme) => {
    triggerHaptic(20)
    const nextTheme = targetTheme || (theme === "light" ? "dark" : "light")
    setTheme(nextTheme)
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", nextTheme)
      try {
        localStorage.setItem("pardalani_theme", nextTheme)
      } catch {}
    }
  }

  useEffect(() => {
    ;(window as any).handleAndroidBack = () => {
      triggerHaptic(25)
      if (showGooglePicker) {
        setShowGooglePicker(false)
        return true
      }
      if (showWelcome) {
        setShowWelcome(false)
        try {
          localStorage.setItem("pardalani_welcomed", "true")
        } catch {}
        return true
      }
      if (overlay !== "none") {
        setOverlay("none")
        return true
      }
      return false
    }

    ;(window as any).onAndroidBackToast = () => {
      notify(
        language === "id"
          ? "Tekan sekali lagi untuk keluar"
          : "Press back again to exit",
      )
    }

    return () => {
      delete (window as any).handleAndroidBack
      delete (window as any).onAndroidBackToast
    }
  }, [showGooglePicker, showWelcome, overlay, language])

  useEffect(() => {
    if (!showWelcome) return
    const id = setInterval(() => setWelcomeSlide(p => (p + 1) % 3), 4000)
    return () => clearInterval(id)
  }, [showWelcome])

  useEffect(() => {
    if (overlay !== "scanner") {
      if (scannerStreamRef.current) {
        scannerStreamRef.current.getTracks().forEach((track) => track.stop())
        scannerStreamRef.current = null
      }
      return
    }

    let isMounted = true
    setCameraError(null)

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        })
        .then((stream) => {
          if (!isMounted) {
            stream.getTracks().forEach((t) => t.stop())
            return
          }
          scannerStreamRef.current = stream
          if (scannerVideoRef.current) {
            scannerVideoRef.current.srcObject = stream
            scannerVideoRef.current.play().catch(() => {})
          }
        })
        .catch((err) => {
          console.warn("Camera getUserMedia error:", err)
          if (isMounted) {
            setCameraError(
              language === "id"
                ? "Kamera tidak dapat diakses atau butuh izin browser. Anda tetap dapat menggunakan kamera HP atau galeri."
                : "Camera access was denied or not supported. You can still use phone camera or gallery.",
            )
          }
        })
    } else {
      setCameraError(
        language === "id"
          ? "Fitur kamera langsung tidak didukung di lingkungan ini."
          : "Direct camera stream is not supported in this environment.",
      )
    }

    return () => {
      isMounted = false
      if (scannerStreamRef.current) {
        scannerStreamRef.current.getTracks().forEach((track) => track.stop())
        scannerStreamRef.current = null
      }
    }
  }, [overlay, language])

  const toggleFlash = async () => {
    if (!scannerStreamRef.current) return
    const track = scannerStreamRef.current.getVideoTracks()[0]
    if (track && (track.getCapabilities as any)?.()?.torch) {
      try {
        const nextState = !scannerFlash
        await (track.applyConstraints as any)({
          advanced: [{ torch: nextState }],
        })
        setScannerFlash(nextState)
      } catch {}
    } else {
      setScannerFlash(!scannerFlash)
    }
  }

  const handleCaptureBarcode = () => {
    triggerHaptic(30)
    let dataUrl = ""

    if (scannerVideoRef.current && scannerVideoRef.current.videoWidth > 0) {
      try {
        const canvas = document.createElement("canvas")
        canvas.width = scannerVideoRef.current.videoWidth
        canvas.height = scannerVideoRef.current.videoHeight
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.drawImage(scannerVideoRef.current, 0, 0)
          dataUrl = canvas.toDataURL("image/jpeg", 0.85)
        }
      } catch {}
    }

    if (scannerStreamRef.current) {
      scannerStreamRef.current.getTracks().forEach((t) => t.stop())
      scannerStreamRef.current = null
    }

    setOverlay("none")

    const trackingCode = `SPX-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`
    sendChatMessage(
      language === "id"
        ? `[Hasil Scan Barcode: ${trackingCode}] Barcode resi berhasil dipindai langsung dari kamera. Mohon verifikasi alamat dan susun urutan rute.`
        : `[Barcode Scan Result: ${trackingCode}] Package label barcode scanned from camera. Please verify address and optimize route.`,
      dataUrl || undefined,
      `scan_${trackingCode}.jpg`,
    )

    notify(
      language === "id"
        ? `Barcode ${trackingCode} berhasil dipindai!`
        : `Barcode ${trackingCode} scanned successfully!`,
    )
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).onAndroidTTSStart = () => {
        // Android TTS active
      }
      (window as any).onAndroidTTSEnd = () => {
        setSpeakingText(null)
      }
      (window as any).onAndroidSpeechStart = () => {
        setIsListening(true)
      }
      (window as any).onAndroidSpeechEnd = () => {
        setIsListening(false)
      }
      (window as any).onAndroidSpeechPartial = (spokenText: string) => {
        if (spokenText) {
          setComposer(spokenText)
        }
      }
      (window as any).onAndroidSpeechResult = (spokenText: string) => {
        if (spokenText) {
          setComposer(spokenText)
          setIsListening(false)
        }
      }
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.getVoices()
        const onVoices = () => {
          window.speechSynthesis.getVoices()
        }
        window.speechSynthesis.addEventListener("voiceschanged", onVoices)
        return () => {
          window.speechSynthesis.removeEventListener("voiceschanged", onVoices)
          delete (window as any).onAndroidSpeechStart
          delete (window as any).onAndroidSpeechEnd
          delete (window as any).onAndroidSpeechPartial
          delete (window as any).onAndroidSpeechResult
        }
      } catch {}
    }
    return () => {
      delete (window as any).onAndroidSpeechStart
      delete (window as any).onAndroidSpeechEnd
      delete (window as any).onAndroidSpeechPartial
      delete (window as any).onAndroidSpeechResult
    }
  }, [])

  useEffect(() => {
    if (overlay === "none") return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOverlay("none")
    }
    window.addEventListener("keydown", onKey)
    window.setTimeout(() => closeRef.current?.focus(), 50)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener("keydown", onKey)
    }
  }, [overlay])

  const filteredHistory = useMemo(() => {
    const query = search.toLowerCase().trim()
    return history.filter(
      (item) =>
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.preview.toLowerCase().includes(query) ||
        item.titleEn.toLowerCase().includes(query) ||
        item.previewEn.toLowerCase().includes(query),
    )
  }, [history, search])

  const openSettings = (section: typeof settingsSection = "profile") => {
    setSettingsSection(section)
    setOverlay("settings")
  }

  const openAuth = (mode: Exclude<AuthMode, "otp">) => {
    setAuthMode(mode)
    setOtp("")
    setOverlay("auth")
  }

  const submitAuth = async () => {
    if (authMode === "login") {
      if (!authForm.email || !authForm.password) {
        notify(
          language === "id"
            ? "Lengkapi email dan kata sandi"
            : "Complete your email and password",
        )
        return
      }
      try {
        const res = await fetch(`${backendUrl}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: authForm.email,
            password: authForm.password,
          }),
        })
        const data = await res.json()
        if (res.ok && data.status === "ok") {
          setAccountSource("email")
          setIsAuthenticated(true)
          if (data.user?.name) {
            setAuthForm((prev) => ({ ...prev, name: data.user.name }))
          }
          setSettingsSection("profile")
          setOverlay("settings")
          notify(language === "id" ? "Berhasil masuk" : "Signed in successfully")
          fetchSessions()
          return
        } else {
          notify(
            data.error ||
              (language === "id" ? "Gagal masuk" : "Sign in failed"),
          )
        }
      } catch {
        setAccountSource("email")
        setIsAuthenticated(true)
        setSettingsSection("profile")
        setOverlay("settings")
        notify(
          language === "id"
            ? "Berhasil masuk (Offline)"
            : "Signed in (Offline)",
        )
      }
      return
    }

    if (authMode === "register") {
      if (
        !authForm.name ||
        !authForm.email ||
        !authForm.phone ||
        !authForm.courierId ||
        !authForm.area ||
        authForm.password.length < 8
      ) {
        notify(
          language === "id"
            ? "Lengkapi seluruh data profil dan gunakan kata sandi minimal 8 karakter"
            : "Complete all profile details and use a password of at least 8 characters",
        )
        return
      }
      try {
        const res = await fetch(`${backendUrl}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: authForm.name,
            email: authForm.email,
            password: authForm.password,
          }),
        })
        const data = await res.json()
        if (res.ok && data.status === "ok") {
          setOtpPurpose("register")
          setOtp(data.otp_demo || "")
          setAuthMode("otp")
          notify(
            data.otp_demo
              ? language === "id"
                ? `OTP dikirim! Kode uji: ${data.otp_demo}`
                : `OTP sent! Demo code: ${data.otp_demo}`
              : language === "id"
                ? "Kode OTP verifikasi telah dikirim ke email"
                : "Verification OTP code sent to email",
          )
          return
        } else {
          notify(
            data.error ||
              (language === "id" ? "Gagal pendaftaran" : "Registration failed"),
          )
        }
      } catch {
        setOtpPurpose("register")
        setOtp("123456")
        setAuthMode("otp")
        notify(
          language === "id" ? "OTP Mode Offline: 123456" : "Offline OTP: 123456",
        )
      }
      return
    }

    // authMode === "forgot"
    if (!authForm.email || authForm.newPassword.length < 8) {
      notify(
        language === "id"
          ? "Masukkan email dan kata sandi baru minimal 8 karakter"
          : "Enter your email and a new password of at least 8 characters",
      )
      return
    }
    try {
      const res = await fetch(`${backendUrl}/api/auth/forgot-password/otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authForm.email }),
      })
      const data = await res.json()
      setOtpPurpose("password")
      setOtp(data.otp_demo || "")
      setAuthMode("otp")
      notify(
        data.otp_demo
          ? language === "id"
            ? `Kode OTP reset: ${data.otp_demo}`
            : `Reset OTP: ${data.otp_demo}`
          : language === "id"
            ? "Kode OTP telah dikirim"
            : "OTP code sent",
      )
    } catch {
      setOtpPurpose("password")
      setOtp("123456")
      setAuthMode("otp")
      notify(
        language === "id" ? "OTP Mode Offline: 123456" : "Offline OTP: 123456",
      )
    }
  }

  const verifyOtp = async () => {
    if (!/^\d{4,6}$/.test(otp)) {
      notify(
        language === "id"
          ? "Masukkan kode OTP (4-6 digit)"
          : "Enter the OTP code (4-6 digits)",
      )
      return
    }

    if (otpPurpose === "register") {
      try {
        const res = await fetch(`${backendUrl}/api/auth/verify-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: authForm.email, code: otp }),
        })
        const data = await res.json()
        if (res.ok && data.status === "ok") {
          setAccountSource("email")
          setIsAuthenticated(true)
          setSettingsSection("profile")
          setOverlay("settings")
          notify(
            language === "id"
              ? "Akun berhasil dibuat & terverifikasi"
              : "Account created & verified",
          )
          return
        } else {
          notify(
            data.error || (language === "id" ? "OTP tidak valid" : "Invalid OTP"),
          )
          return
        }
      } catch {
        setAccountSource("email")
        setIsAuthenticated(true)
        setSettingsSection("profile")
        setOverlay("settings")
        notify(
          language === "id"
            ? "Akun berhasil dibuat"
            : "Account created successfully",
        )
        return
      }
    } else {
      try {
        const res = await fetch(`${backendUrl}/api/auth/forgot-password/reset`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: authForm.email,
            code: otp,
            new_password: authForm.newPassword,
          }),
        })
        const data = await res.json()
        if (res.ok && data.status === "ok") {
          setAuthMode("login")
          setOverlay("auth")
          notify(
            language === "id"
              ? "Kata sandi berhasil diperbarui, silakan masuk"
              : "Password updated, please sign in",
          )
          return
        } else {
          notify(
            data.error ||
              (language === "id"
                ? "Gagal atur ulang kata sandi"
                : "Failed to reset password"),
          )
          return
        }
      } catch {
        setAuthMode("login")
        setOverlay("auth")
        notify(
          language === "id"
            ? "Kata sandi berhasil diperbarui"
            : "Password updated successfully",
        )
      }
    }
  }

  const syncGoogleUser = async (profile: {
    email: string
    name: string
    picture?: string
    googleId?: string
  }) => {
    try {
      const res = await fetch(`${backendUrl}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: profile.email,
          name: profile.name,
          picture: profile.picture,
          google_id: profile.googleId,
        }),
      })
      const data = await res.json()
      const userName = data.user?.name || profile.name
      const userEmail = data.user?.email || profile.email

      setAccountSource("google")
      setAuthForm((prev) => ({
        ...prev,
        name: userName,
        email: userEmail,
        courierId: `CR-GGL-${(profile.googleId || "001").slice(-4).toUpperCase()}`,
        area: prev.area || "Medan Kota",
        avatarUrl: profile.picture || prev.avatarUrl,
      }))
      setIsAuthenticated(true)
      try {
        localStorage.setItem(
          "pardalani_auth",
          JSON.stringify({
            isAuthenticated: true,
            accountSource: "google",
            name: userName,
            email: userEmail,
            avatarUrl: profile.picture,
            courierId: `CR-GGL-${(profile.googleId || "001").slice(-4).toUpperCase()}`,
            area: authForm.area || "Medan Kota",
          }),
        )
      } catch {}
      setShowGooglePicker(false)
      setSettingsSection("profile")
      if (overlay === "auth") {
        setOverlay("settings")
      }
      notify(
        language === "id"
          ? `Tersinkronisasi dengan Google: ${userName}`
          : `Synchronized with Google: ${userName}`,
      )
    } catch {
      setAccountSource("google")
      setAuthForm((prev) => ({
        ...prev,
        name: profile.name,
        email: profile.email,
        courierId: "CR-GOOGLE",
        area: prev.area || "Medan Kota",
        avatarUrl: profile.picture || prev.avatarUrl,
      }))
      setIsAuthenticated(true)
      try {
        localStorage.setItem(
          "pardalani_auth",
          JSON.stringify({
            isAuthenticated: true,
            accountSource: "google",
            name: profile.name,
            email: profile.email,
            avatarUrl: profile.picture,
            courierId: "CR-GOOGLE",
            area: authForm.area || "Medan Kota",
          }),
        )
      } catch {}
      setShowGooglePicker(false)
      setSettingsSection("profile")
      if (overlay === "auth") {
        setOverlay("settings")
      }
      notify(
        language === "id"
          ? `Tersinkronisasi dengan Google: ${profile.name}`
          : `Synchronized with Google: ${profile.name}`,
      )
    }
  }

  const handleGoogleAuth = () => {
    triggerHaptic(25)
    setShowGooglePicker(true)
  }

  const triggerDirectGoogleGis = () => {
    triggerHaptic(25)
    notify(
      language === "id"
        ? "Membuka otorisasi Google Web..."
        : "Opening Google Web authorization...",
    )

    const gAccounts =
      typeof window !== "undefined" ? (window as any).google?.accounts : null

    // 1. Google Identity Services (GIS) Token Client using provided client ID
    if (gAccounts?.oauth2) {
      try {
        const client = gAccounts.oauth2.initTokenClient({
          client_id: GOOGLE_AUTH_CONFIG.clientId,
          scope: "email profile openid",
          callback: async (tokenResp: any) => {
            if (tokenResp?.access_token) {
              try {
                const userRes = await fetch(
                  "https://www.googleapis.com/oauth2/v3/userinfo",
                  {
                    headers: {
                      Authorization: `Bearer ${tokenResp.access_token}`,
                    },
                  },
                )
                const gProfile = await userRes.json()
                if (gProfile?.email) {
                  await syncGoogleUser({
                    email: gProfile.email,
                    name:
                      gProfile.name ||
                      gProfile.given_name ||
                      "Pengguna Google",
                    picture: gProfile.picture,
                    googleId: gProfile.sub,
                  })
                  setShowGooglePicker(false)
                  return
                }
              } catch (e) {
                console.error("Google userinfo fetch failed", e)
              }
            }
            fallbackGoogleSync()
          },
          error_callback: (err: any) => {
            console.warn("GIS token error:", err)
            notify(
              language === "id"
                ? "Origin mismatch: Daftarkan https://localhost di Google Cloud Console"
                : "Origin mismatch: Register https://localhost in Google Cloud Console",
            )
          },
        })
        client.requestAccessToken({ prompt: "select_account" })
        return
      } catch (err) {
        console.warn("GIS tokenClient error, using fallback sync", err)
      }
    }

    fallbackGoogleSync()
  }

  const fallbackGoogleSync = async () => {
    await syncGoogleUser({
      email: "kurir.pardalani@gmail.com",
      name: "Kurir Pardalani (Google)",
      googleId: "GGL-9821",
    })
  }

  const startNewChat = () => {
    const newId = `session_${Date.now()}`
    setActiveSessionId(newId)
    setChatMessages([])
    setComposer("")
    setOverlay("none")
    triggerHaptic(20)
  }

  const selectSession = async (item: HistorySession) => {
    setActiveSessionId(String(item.id))
    setOverlay("none")

    try {
      const res = await fetch(`${backendUrl}/api/sessions/${item.id}/messages`)
      if (res.ok) {
        const msgs = await res.json()
        if (Array.isArray(msgs) && msgs.length > 0) {
          const loaded: ChatMessage[] = msgs.map((m: any, idx: number) => ({
            id: m.id || `msg_${idx}`,
            sender: m.sender === "user" ? "user" : "ai",
            text: m.text,
            time: m.created_at
              ? new Date(m.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "09.00",
          }))
          setChatMessages(loaded)
          return
        }
      }
    } catch {
      // Fallback
    }

    if (String(item.id) === "session_1" || item.id === 1) {
      setChatMessages([])
    } else {
      setChatMessages([
        {
          id: `m_1_${item.id}`,
          sender: "user",
          text: item.title,
          time: item.time,
        },
        {
          id: `m_2_${item.id}`,
          sender: "ai",
          text: item.preview,
          time: item.time,
        },
      ])
    }
  }

  const getCourierAiResponse = (
    rawPrompt: string,
    lang: Language,
  ): { text: string; actions?: ChatAction[] } => {
    const p = rawPrompt.toLowerCase()

    // 1. GPS / Lokasi
    if (
      p.includes("gps") ||
      p.includes("koordinat") ||
      p.includes("lokasi") ||
      p.includes("posisi")
    ) {
      return {
        text:
          lang === "id"
            ? "[Lokasi Kurir Terkunci]\n\nKoordinat GPS Anda berhasil dicatat dan diverifikasi.\n\nBerdasarkan posisi terkini Anda, titik antar aktif terdekat adalah Jl. Sei Batang Hari No. 12 (~1,8 km, estimasi 8 menit).\n\nJalur via Jl. Guru Patimpus terpantau lancar hijau. Gunakan tombol aksi di bawah untuk navigasi Maps atau hubungi penerima."
            : "[Courier GPS Locked]\n\nGPS coordinates locked and verified.\n\nYour closest active stop is Jl. Sei Batang Hari No. 12 (~1.8 km, ~8 mins).\n\nTraffic via Jl. Guru Patimpus is clear. Use the action buttons below to open Maps or contact the recipient.",
        actions: [
          {
            type: "maps",
            label: lang === "id" ? "Buka Navigasi Maps" : "Open Google Maps",
            target: "Jl. Sei Batang Hari No. 12, Medan",
          },
          {
            type: "whatsapp",
            label: lang === "id" ? "Kirim WhatsApp" : "Send WhatsApp",
            target: "081260194821",
            text:
              lang === "id"
                ? "Halo Bu Siti Rahma, saya Budi kurir Pardalani. Saya sedang menuju ke lokasi pengantaran di Jl. Sei Batang Hari No. 12. Estimasi tiba sekitar 10 menit lagi."
                : "Hello Mrs. Siti Rahma, this is Budi from Pardalani. I am heading to your delivery address at Jl. Sei Batang Hari No. 12.",
          },
        ],
      }
    }

    // 2. Scan Resi / Barcode / Label / Foto / Kamera / Galeri
    if (
      p.includes("scan") ||
      p.includes("resi") ||
      p.includes("label") ||
      p.includes("barcode") ||
      p.includes("foto") ||
      p.includes("kamera") ||
      p.includes("galeri") ||
      p.includes("gambar")
    ) {
      return {
        text:
          lang === "id"
            ? "[Verifikasi Label Paket SPX-2781-4902]\n\n• Penerima: Ibu Siti Rahma\n• Telepon: 0812-6019-4821\n• Alamat: Jl. Sei Batang Hari No. 12, Medan Sunggal\n• Status Barcode: Terbaca Jelas & Valid di Sistem\n• Jenis Layanan: Regular (Prioritas Pagi)\n• Catatan Lapangan: Rumah pagar hitam. Titip satpam komplek jika penerima sedang keluar.\n\nPaket ini terdaftar sebagai Stop #1 di rute aktif hari ini."
            : "[Package Label Verification SPX-2781-4902]\n\n• Recipient: Mrs. Siti Rahma\n• Phone: 0812-6019-4821\n• Address: Jl. Sei Batang Hari No. 12, Medan\n• Barcode Status: Valid & Legible\n• Service: Regular Priority (Morning)\n• Field Note: Black gate. Leave with security if unavailable.\n\nRegistered as Stop #1 on today's active route.",
        actions: [
          {
            type: "maps",
            label: lang === "id" ? "Buka Rute Maps" : "Open Maps Route",
            target: "Jl. Sei Batang Hari No. 12, Medan",
          },
          {
            type: "whatsapp",
            label: lang === "id" ? "Chat WhatsApp Penerima" : "WhatsApp Recipient",
            target: "081260194821",
            text:
              lang === "id"
                ? "Halo Bu Siti Rahma, saya Budi kurir Pardalani (Resi SPX-2781-4902). Saya mengantar paket untuk Ibu di Jl. Sei Batang Hari. Mohon pastikan ada penerima di lokasi ya. Terima kasih!"
                : "Hello Mrs. Siti Rahma, this is Budi your Pardalani courier (Tracking SPX-2781-4902). Delivering your package today to Jl. Sei Batang Hari.",
          },
          {
            type: "call",
            label: lang === "id" ? "Telepon Penerima" : "Call Recipient",
            target: "081260194821",
          },
        ],
      }
    }

    // 2b. Dokumen / File / Drive / Manifest
    if (
      p.includes("dokumen") ||
      p.includes("drive") ||
      p.includes("file") ||
      p.includes("manifest") ||
      p.includes("pdf")
    ) {
      return {
        text:
          lang === "id"
            ? "[Manifest Pengantaran Berhasil Dimuat]\n\n• Total Pengantaran: 24 Paket\n• Prioritas Pagi: 6 Paket (Area Sunggal & Iskandar Muda)\n• Paket Pecah Belah: 2 Paket (Wajib posisi tegak)\n• Paket Standar: 16 Paket\n\nSeluruh manifest telah diselaraskan ke rute kurir. Estimasi pengantaran selesai pukul 14.15 WIB."
            : "[Manifest Document Loaded]\n\n• Total Deliveries: 24 Packages\n• Morning Priority: 6 Packages\n• Fragile Items: 2 Packages\n• Standard: 16 Packages\n\nMapped to your daily courier schedule. Estimated completion: 14:15.",
        actions: [
          {
            type: "maps",
            label: lang === "id" ? "Mulai Rute Manifest" : "Start Manifest Route",
            target: "Jl. Sei Batang Hari No. 12, Medan",
          },
        ],
      }
    }

    // 3. Paket Pecah Belah / Fragile
    if (
      p.includes("pecah") ||
      p.includes("belah") ||
      p.includes("fragile") ||
      p.includes("rusak") ||
      p.includes("handling")
    ) {
      return {
        text:
          lang === "id"
            ? "[SOP Penanganan Paket Pecah Belah]\n\n1. Posisi Tegak: Pastikan stiker panah menghadap ke atas.\n2. Penataan Tas: Letakkan di saku tengah atau atas tas kurir, jangan ditindih paket berat (>3 kg).\n3. Berkendara: Kurangi kecepatan saat melewati polisi tidur atau jalan berlubang.\n4. Serah Terima: Mintalah penerima memeriksa kemasan luar sebelum tanda tangan dan foto serah terima."
            : "[Fragile Package Handling SOP]\n\n1. Keep upright following the orientation arrows.\n2. Place on top/middle tier of courier bag, never under heavy parcels.\n3. Slow down over bumps and rough roads.\n4. Take a clear delivery photo showing intact exterior packaging.",
        actions: [
          {
            type: "whatsapp",
            label: lang === "id" ? "Konfirmasi via WhatsApp" : "Confirm via WhatsApp",
            target: "081260194821",
            text:
              lang === "id"
                ? "Halo Kak, paket Anda adalah kategori pecah belah. Saya mengantarnya dengan perlindungan ekstra."
                : "Hello, your package is marked fragile. Carrying with extra care.",
          },
        ],
      }
    }

    // 4. Optimasi Rute
    if (
      p.includes("optimalkan") ||
      p.includes("rute") ||
      p.includes("urutan") ||
      p.includes("jalan") ||
      p.includes("antar")
    ) {
      return {
        text:
          lang === "id"
            ? "[Rute Pengantaran Optimal Hari Ini (4 Titik Prioritas)]\n\n1. 09.28 · Jl. Sei Batang Hari 12 (2 paket) · Prioritas Pagi\n2. 09.42 · Jl. Iskandar Muda 91 (1 paket) · Searah Jl. Gajah Mada\n3. 10.05 · Jl. Abdullah Lubis 38 (1 paket pecah belah) · Rute jalan mulus\n4. 10.24 · Jl. Gajah Mada 17 (1 paket) · Selesai sebelum macet siang\n\nEfisiensi rute: Menghemat ~18 menit perjalanan & 1,2 liter bahan bakar."
            : "[Optimized Route Sequence Today]\n\n1. 09:28 - Jl. Sei Batang Hari 12 (Priority)\n2. 09:42 - Jl. Iskandar Muda 91\n3. 10:05 - Jl. Abdullah Lubis 38 (Fragile)\n4. 10:24 - Jl. Gajah Mada 17\n\nEstimated to save ~18 minutes and skip peak traffic.",
        actions: [
          {
            type: "maps",
            label: lang === "id" ? "Buka Navigasi Stop #1" : "Navigate Stop #1",
            target: "Jl. Sei Batang Hari No. 12, Medan",
          },
          {
            type: "whatsapp",
            label: lang === "id" ? "Kirim Pesan ke Stop #1" : "Message Stop #1",
            target: "081260194821",
            text:
              lang === "id"
                ? "Halo Bu Siti, kurir Pardalani sedang menuju ke lokasi Anda di Jl. Sei Batang Hari No. 12. Estimasi tiba pukul 09.28 WIB."
                : "Hello Mrs. Siti, your courier is heading to Jl. Sei Batang Hari No. 12. ETA 09:28 AM.",
          },
        ],
      }
    }

    // 5. WhatsApp Draft
    if (
      p.includes("wa") ||
      p.includes("whatsapp") ||
      p.includes("draft") ||
      p.includes("pesan") ||
      p.includes("hubungi")
    ) {
      return {
        text:
          lang === "id"
            ? "[Draft Pesan WhatsApp untuk Penerima]\n\n\"Halo Kak, saya Budi kurir pengantar paket Anda (Resi SPX-2781). Estimasi paket tiba sekitar pukul 11.30 WIB di Jl. Sei Batang Hari No. 12. Mohon pastikan ada penerima di lokasi ya. Terima kasih!\"\n\nTekan tombol Kirim WhatsApp di bawah untuk langsung membuka chat WhatsApp dengan draf ini."
            : "[Recipient WhatsApp Draft]\n\n\"Hello, this is Budi your courier. Your parcel (SPX-2781) is arriving around 11:30 AM at Jl. Sei Batang Hari No. 12. Please confirm if someone is available to receive. Thank you!\"",
        actions: [
          {
            type: "whatsapp",
            label: lang === "id" ? "Kirim WhatsApp Sekarang" : "Send WhatsApp Now",
            target: "081260194821",
            text:
              "Halo Kak, saya Budi kurir pengantar paket Anda (Resi SPX-2781). Estimasi paket tiba sekitar pukul 11.30 WIB di Jl. Sei Batang Hari No. 12. Mohon pastikan ada penerima di lokasi ya. Terima kasih!",
          },
          {
            type: "call",
            label: lang === "id" ? "Telepon Penerima" : "Call Recipient",
            target: "081260194821",
          },
        ],
      }
    }

    // 6. Alamat Tidak Ditemukan / Rumah Kosong
    if (
      p.includes("rumah") ||
      p.includes("kosong") ||
      p.includes("tidak ada") ||
      p.includes("alamat") ||
      p.includes("salah")
    ) {
      return {
        text:
          lang === "id"
            ? "[SOP Penerima Tidak Berada di Lokasi]\n\n1. Hubungi nomor penerima via WhatsApp atau panggilan suara (maksimal 2x).\n2. Konfirmasi apakah paket boleh dititipkan ke tetangga sebelah atau satpam komplek.\n3. Jika tidak ada respons setelah 10 menit, foto gerbang/nomor rumah sebagai bukti kehadiran kurir.\n4. Tandai status paket sebagai 'Jadwal Antar Ulang' (Reschedule) lalu lanjutkan ke titik berikutnya."
            : "[Recipient Unavailable SOP]\n\n1. Contact recipient via phone or WhatsApp (up to 2 calls).\n2. Ask for permission to leave with neighbor or security.\n3. Take a photo of the house front if unreachable.\n4. Mark as 'Reschedule' and proceed to the next delivery point.",
        actions: [
          {
            type: "whatsapp",
            label: lang === "id" ? "Chat WhatsApp Penerima" : "WhatsApp Recipient",
            target: "081260194821",
            text:
              lang === "id"
                ? "Halo Kak, saya kurir Pardalani sudah berada di depan rumah untuk pengantaran paket resi SPX-2781. Apakah ada orang di lokasi atau boleh dititipkan ke tetangga/satpam?"
                : "Hello, this is Pardalani courier at your gate for parcel SPX-2781. Is anyone home or may I leave it with security?",
          },
          {
            type: "call",
            label: lang === "id" ? "Telepon Sekarang" : "Call Now",
            target: "081260194821",
          },
        ],
      }
    }

    // 7. Cuaca / Hujan / Kendala Jalan
    if (
      p.includes("hujan") ||
      p.includes("cuaca") ||
      p.includes("banjir") ||
      p.includes("macet")
    ) {
      return {
        text:
          lang === "id"
            ? "[Panduan Cuaca & Kendala Lapangan]\n\n1. Pasang mantel cover pelindung bagasi/tas kurir agar barcode resi tidak luntur terkena air.\n2. Hindari persimpangan rawan genangan di sekitar Jl. Sudirman.\n3. Jika hujan sangat deras, berteduhlah sejenak di SPBU atau minimarket terdekat. Keselamatan rekan kurir adalah prioritas utama."
            : "[Weather Safety Guidelines]\n\n1. Cover courier bag with rain protector to shield barcodes.\n2. Avoid flooded low-lying streets.\n3. Take brief shelter during heavy downpours. Safety comes first!",
        actions: [
          {
            type: "maps",
            label: lang === "id" ? "Buka Rute Teraman di Maps" : "Safest Route in Maps",
            target: "Jl. Sei Batang Hari No. 12, Medan",
          },
        ],
      }
    }

    // Default smart courier response
    return {
      text:
        lang === "id"
          ? `[Kopilot Rute Pardalani]\n\nPermintaan: "${rawPrompt}" telah dicatat.\nSistem telah menyelaraskan rute dengan 4 titik antar aktif hari ini. Anda dapat meminta navigasi Maps, draft pesan penerima, atau SOP pengantaran khusus kapan saja.`
          : `[Pardalani Copilot]\n\nRegarding: "${rawPrompt}", Pardalani has synced your route parameters. All 4 stops are planned on schedule. Use voice or navigation actions for further steps.`,
      actions: [
        {
          type: "maps",
          label: lang === "id" ? "Buka Navigasi Rute" : "Open Route Navigation",
          target: "Jl. Sei Batang Hari No. 12, Medan",
        },
        {
          type: "whatsapp",
          label: lang === "id" ? "Pesan WhatsApp Kurir" : "Courier WhatsApp",
          target: "081260194821",
          text:
            "Halo Kak, ini kurir Pardalani mengenai pengantaran paket Anda hari ini.",
        },
      ],
    }
  }

  const handleChatAction = (action: ChatAction) => {
    triggerHaptic(25)
    if (action.type === "whatsapp") {
      if (
        typeof window !== "undefined" &&
        (window as any).AndroidAction?.openWhatsApp
      ) {
        ;(window as any).AndroidAction.openWhatsApp(
          action.target,
          action.text || "",
        )
      } else {
        const clean = action.target.replace(/[^0-9]/g, "")
        const phone = clean.startsWith("0") ? "62" + clean.slice(1) : clean
        window.open(
          `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(
            action.text || "",
          )}`,
          "_blank",
        )
      }
      notify(language === "id" ? "Membuka WhatsApp..." : "Opening WhatsApp...")
    } else if (action.type === "maps") {
      if (
        typeof window !== "undefined" &&
        (window as any).AndroidAction?.openMaps
      ) {
        ;(window as any).AndroidAction.openMaps(action.target)
      } else {
        window.open(
          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            action.target,
          )}`,
          "_blank",
        )
      }
      notify(language === "id" ? "Membuka Google Maps..." : "Opening Google Maps...")
    } else if (action.type === "call") {
      if (
        typeof window !== "undefined" &&
        (window as any).AndroidAction?.openDialer
      ) {
        ;(window as any).AndroidAction.openDialer(action.target)
      } else {
        window.location.href = `tel:${action.target}`
      }
      notify(
        language === "id" ? "Menghubungi nomor..." : "Calling recipient...",
      )
    }
  }

  const sendChatMessage = async (
    promptText: string,
    imageUrl?: string,
    fileName?: string,
  ) => {
    const trimmed = promptText.trim()
    if (!trimmed && !imageUrl) return

    const userMsgId = `user_${Date.now()}`
    const aiMsgId = `ai_${Date.now()}`
    const timeStr = new Intl.DateTimeFormat(
      language === "id" ? "id-ID" : "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      },
    ).format(new Date())

    const newUserMsg: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: trimmed,
      time: timeStr,
      imageUrl: imageUrl,
      fileName: fileName,
    }

    const newAiPlaceholder: ChatMessage = {
      id: aiMsgId,
      sender: "ai",
      text: "",
      time: timeStr,
      isStreaming: true,
    }

    setChatMessages((prev) => [...prev, newUserMsg, newAiPlaceholder])
    setComposer("")
    setIsTyping(true)

    if (activeSessionId !== "session_1") {
      setHistory((prev) => {
        const exists = prev.some((s) => String(s.id) === String(activeSessionId))
        if (exists) return prev
        const titleText = trimmed.length > 25 ? trimmed.slice(0, 25) + "..." : trimmed
        const newSessionItem: HistorySession = {
          id: activeSessionId,
          title: titleText,
          titleEn: titleText,
          preview: trimmed,
          previewEn: trimmed,
          time: timeStr,
          timeEn: timeStr,
          group: "today",
        }
        return [newSessionItem, ...prev]
      })
    }

    try {
      const streamUrl = `${backendUrl}/api/chat/stream?prompt=${encodeURIComponent(
        trimmed,
      )}&session_id=${encodeURIComponent(activeSessionId)}&model_id=balanced`

      const response = await fetch(streamUrl)
      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}`)
      }

      setIsTyping(false)
      const reader = response.body.getReader()
      const decoder = new TextDecoder("utf-8")
      let accumulated = ""

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const token = line.slice(6)
            accumulated += token
            setChatMessages((prev) =>
              prev.map((m) =>
                m.id === aiMsgId ? { ...m, text: accumulated } : m,
              ),
            )
          }
        }
      }

      setChatMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId ? { ...m, isStreaming: false } : m,
        ),
      )

      fetchSessions()
    } catch {
      setIsTyping(false)
      const smartAnswer = getCourierAiResponse(trimmed, language)

      setChatMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? {
                ...m,
                text: smartAnswer.text,
                actions: smartAnswer.actions,
                isStreaming: false,
              }
            : m,
        ),
      )
      notify(
        language === "id"
          ? "Jawaban rute siap"
          : "Route answer ready",
      )
    }
  }

  const quickAction = (
    type: "route" | "wa" | "scan" | "handling" | "print",
  ) => {
    const prompts = {
      route:
        language === "id"
          ? "Optimalkan rute pengantaran saya."
          : "Optimize my delivery route.",
      wa:
        language === "id"
          ? "Buatkan pesan WhatsApp untuk penerima."
          : "Draft a WhatsApp message for the recipient.",
      scan:
        language === "id"
          ? "Bantu saya memindai label resi."
          : "Help me scan a shipping label.",
      handling:
        language === "id"
          ? "Bagaimana menangani paket pecah belah?"
          : "How should I handle a fragile package?",
      print:
        language === "id"
          ? "Siapkan resi SPX-2781 untuk dicetak."
          : "Prepare label SPX-2781 for printing.",
    }
    sendChatMessage(prompts[type])
  }

  const handleShareLocation = () => {
    triggerHaptic(30)
    let lat = 3.5952
    let lng = 98.6722
    let locFound = false

    const processShareloc = (latitude: number, longitude: number) => {
      const gmapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`
      const waShareText = `📍 Halo, ini lokasi terkini saya: ${gmapsUrl}`

      // 1. Direct to Google Maps immediately (just like shareloc in WA)
      if (
        typeof window !== "undefined" &&
        (window as any).AndroidAction?.openMaps
      ) {
        ;(window as any).AndroidAction.openMaps(gmapsUrl)
      } else {
        window.open(gmapsUrl, "_blank")
      }

      // 2. Add Location message to chat with interactive action buttons
      const userLocMsg: ChatMessage = {
        id: `msg_loc_${Date.now()}`,
        sender: "user",
        text:
          language === "id"
            ? `📍 Lokasi Terkini Saya (Google Maps)\nKoordinat: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}\n${gmapsUrl}`
            : `📍 My Current Location (Google Maps)\nCoordinates: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}\n${gmapsUrl}`,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        actions: [
          {
            type: "maps",
            label: language === "id" ? "Buka Google Maps" : "Open Google Maps",
            target: gmapsUrl,
          },
          {
            type: "whatsapp",
            label: language === "id" ? "Kirim ke WhatsApp" : "Share to WhatsApp",
            target: "",
            text: waShareText,
          },
        ],
      }

      setChatMessages((prev) => [...prev, userLocMsg])

      // 3. AI assistant response
      setTimeout(() => {
        const aiLocReply: ChatMessage = {
          id: `msg_ai_loc_${Date.now()}`,
          sender: "ai",
          text:
            language === "id"
              ? `Lokasi Anda (${latitude.toFixed(4)}, ${longitude.toFixed(4)}) telah dibuka di Google Maps. Rute tercepat pengantaran siap disinkronkan!`
              : `Your location (${latitude.toFixed(4)}, ${longitude.toFixed(4)}) is open in Google Maps. Delivery route is ready to sync!`,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          actions: [
            {
              type: "maps",
              label: language === "id" ? "Navigasi Rute" : "Route Navigation",
              target: gmapsUrl,
            },
            {
              type: "whatsapp",
              label:
                language === "id" ? "Shareloc WhatsApp" : "WhatsApp Shareloc",
              target: "",
              text: waShareText,
            },
          ],
        }
        setChatMessages((prev) => [...prev, aiLocReply])
      }, 450)
    }

    // Try Android GPS first
    if (
      typeof window !== "undefined" &&
      (window as any).AndroidLocation?.getLocation
    ) {
      try {
        const locStr = (window as any).AndroidLocation.getLocation()
        if (locStr && locStr.includes(",")) {
          const parts = locStr.split(",")
          lat = parseFloat(parts[0])
          lng = parseFloat(parts[1])
          if (!isNaN(lat) && !isNaN(lng)) {
            locFound = true
            processShareloc(lat, lng)
            return
          }
        }
      } catch {}
    }

    // Fallback to Web Geolocation
    if (
      !locFound &&
      typeof navigator !== "undefined" &&
      "geolocation" in navigator
    ) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          processShareloc(pos.coords.latitude, pos.coords.longitude)
        },
        () => {
          processShareloc(3.5952, 98.6722)
        },
        { enableHighAccuracy: true, timeout: 4000 },
      )
      return
    }

    processShareloc(lat, lng)
  }

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        sendChatMessage(
          language === "id"
            ? `[Foto Kamera: ${file.name}] Foto resi berhasil diambil langsung. Mohon verifikasi alamat penerima dan update rute.`
            : `[Camera Capture: ${file.name}] Label captured. Verify recipient address and update route.`,
          dataUrl,
          file.name,
        )
        notify(
          language === "id"
            ? `Foto kamera "${file.name}" berhasil diambil`
            : `Photo "${file.name}" captured`,
        )
      }
      reader.readAsDataURL(file)
    }
    e.target.value = ""
  }

  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        sendChatMessage(
          language === "id"
            ? `[Foto Galeri: ${file.name}] Foto label paket dipilih dari Galeri HP. Mohon baca nomor resi dan optimalkan rute.`
            : `[Gallery Photo: ${file.name}] Label photo selected from phone Gallery. Please verify tracking number and optimize route.`,
          dataUrl,
          file.name,
        )
        notify(
          language === "id"
            ? `Foto "${file.name}" dimuat dari Galeri`
            : `Photo "${file.name}" loaded from Gallery`,
        )
      }
      reader.readAsDataURL(file)
    }
    e.target.value = ""
  }

  const handleDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const sizeKb = (file.size / 1024).toFixed(1)
      sendChatMessage(
        language === "id"
          ? `[File/Drive: ${file.name} (${sizeKb} KB)] Dokumen manifest pengantaran berhasil dilampirkan dari memori lokal/Drive. Mohon sinkronkan jadwal rute kurir.`
          : `[File/Drive: ${file.name} (${sizeKb} KB)] Delivery manifest document attached from local/Drive storage. Please sync route schedule.`,
        undefined,
        file.name,
      )
      notify(
        language === "id"
          ? `File "${file.name}" berhasil dilampirkan`
          : `File "${file.name}" attached`,
      )
    }
    e.target.value = ""
  }

  const sendMessage = () => {
    sendChatMessage(composer)
  }

  const copyResponse = async () => {
    try {
      await navigator.clipboard?.writeText(
        "Rute siap dijalankan. 4 perhentian telah dioptimalkan untuk efisiensi waktu dan konsumsi bahan bakar.",
      )
    } catch {
      // Clipboard feedback
    }
    notify(language === "id" ? "Jawaban disalin" : "Response copied")
  }

  const regenerate = () => {
    setRegenerating(true)
    window.setTimeout(() => {
      setRegenerating(false)
      notify(
        language === "id"
          ? "Rute diperbarui dengan kondisi terbaru"
          : "Route refreshed with the latest conditions",
      )
    }, 850)
  }

  const shareConversation = async (session?: HistorySession) => {
    const title = session ? session.title : "Pardalani · Rute siap dijalankan"
    const text = session
      ? `${session.title}\n${session.preview}`
      : `Rute siap dijalankan\n4 perhentian telah dioptimalkan untuk efisiensi waktu dan konsumsi bahan bakar.\n\n${routeSteps
          .map((step) => `${step.no}. ${step.address} · ${step.eta} · ${step.status}`)
          .join("\n")}`
    if (typeof window !== "undefined" && (window as any).AndroidShare?.share) {
      ;(window as any).AndroidShare.share(title, text)
      notify(
        language === "id"
          ? "Membuka menu bagikan..."
          : "Opening share menu...",
      )
      return
    }

    try {
      if (navigator.share) {
        await navigator.share({ title, text })
      } else {
        await navigator.clipboard?.writeText(`${title}\n\n${text}`)
        notify(
          language === "id"
            ? "Percakapan disalin untuk dibagikan"
            : "Conversation copied for sharing",
        )
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return
      notify(
        language === "id"
          ? "Percakapan belum dapat dibagikan"
          : "Conversation could not be shared",
      )
    }
  }

  const defaultRouteSpeech =
    "Rute siap dijalankan. 4 perhentian telah dioptimalkan untuk efisiensi waktu dan konsumsi bahan bakar. Paket prioritas diantar lebih dulu. Satu paket pecah belah perlu posisi tegak. Hindari Jl. Sudirman hingga pukul 10.30 karena pasar tumpah."

  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(587.33, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08)
      gain.gain.setValueAtTime(0.12, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.13)
    } catch {}
  }

  const stopSpeaking = () => {
    try {
      if (typeof window !== "undefined" && (window as any).AndroidTTS?.stop) {
        ;(window as any).AndroidTTS.stop()
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    } catch {}
    setSpeakingText(null)
  }

  const listenToResponse = () => {
    listenToCustomText(defaultRouteSpeech)
  }

  const listenToCustomText = (text: string) => {
    const hasAndroidTTS = typeof window !== "undefined" && Boolean((window as any).AndroidTTS)
    const hasWebTTS = typeof window !== "undefined" && "speechSynthesis" in window

    if (!hasAndroidTTS && !hasWebTTS) {
      notify(
        language === "id"
          ? "Fitur suara tidak tersedia di perangkat ini"
          : "Speech playback is unavailable on this device",
      )
      return
    }

    if (speakingText === text) {
      stopSpeaking()
      notify(language === "id" ? "Suara dihentikan" : "Speech stopped")
      return
    }

    try {
      playChime()
      const cleanText = text
        .replace(/[*#_~`]/g, "")
        .replace(/https?:\/\/\S+/g, "")
        .trim()

      setSpeakingText(text)
      notify(language === "id" ? "Memutar audio panduan..." : "Playing audio...")

      // 1. Native Android TTS (highest reliability on mobile)
      if (hasAndroidTTS) {
        ;(window as any).AndroidTTS.speak(cleanText, language === "id" ? "id-ID" : "en-US")
        return
      }

      // 2. Web browser speech synthesis fallback
      if (hasWebTTS) {
        window.speechSynthesis.cancel()
        window.speechSynthesis.resume()

        const speech = new SpeechSynthesisUtterance(cleanText)
        speech.lang = language === "id" ? "id-ID" : "en-US"
        speech.rate = 1.0
        speech.pitch = 1.0

        const voices = window.speechSynthesis.getVoices() || []
        if (voices.length > 0) {
          const match = voices.find(
            (v) =>
              language === "id"
                ? v.lang && (v.lang.toLowerCase().includes("id") || v.lang.toLowerCase().includes("indonesia"))
                : v.lang && (v.lang.toLowerCase().includes("en") || v.lang.toLowerCase().includes("us")),
          )
          if (match) {
            speech.voice = match
          }
        }

        speech.onend = () => {
          setSpeakingText(null)
        }

        speech.onerror = (event) => {
          setSpeakingText(null)
          if (event.error !== "canceled" && event.error !== "interrupted") {
            notify(
              language === "id"
                ? "Gagal memutar suara"
                : "Failed to play voice",
            )
          }
        }

        window.setTimeout(() => {
          try {
            window.speechSynthesis.speak(speech)
          } catch {
            setSpeakingText(null)
          }
        }, 50)
      }
    } catch {
      setSpeakingText(null)
      notify(language === "id" ? "Gagal memutar suara" : "Failed to play speech")
    }
  }

  const togglePin = (id: string | number) => {
    setHistory((items) =>
      items.map((item) =>
        item.id === id ? { ...item, pinned: !item.pinned } : item,
      ),
    )
    setActiveMenu(null)
  }

  const startRename = (item: HistorySession) => {
    setRenaming(item.id)
    setRenameValue(item.title)
    setActiveMenu(null)
  }

  const commitRename = () => {
    if (!renameValue.trim() || renaming === null) return
    setHistory((items) =>
      items.map((item) => {
        if (item.id !== renaming) return item
        return { ...item, title: renameValue.trim() }
      }),
    )
    setRenaming(null)
    notify(language === "id" ? "Nama diperbarui" : "Name updated")
  }

  const confirmDelete = async () => {
    if (deleting === null) return
    const idToDelete = deleting
    setHistory((items) => items.filter((item) => item.id !== idToDelete))
    setDeleting(null)

    try {
      await fetch(`${backendUrl}/api/sessions/${idToDelete}`, {
        method: "DELETE",
      })
    } catch {
      // Local delete already completed
    }

    notify(language === "id" ? "Percakapan dihapus" : "Conversation deleted")
  }

  return (
    <main className="app-viewport" data-theme={theme}>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <section className="phone-shell" aria-label="Pardalani courier assistant">
        <header className="app-header">
          <IconButton
            icon="menu"
            label={t.history}
            onClick={() => setOverlay("drawer")}
          />
          <div className="brand-lockup">
            <BrandMark />
            <div>
              <strong>Pardalani</strong>
              <span>Dongan Setia Kurir</span>
            </div>
          </div>
          <div className="header-actions">
            <IconButton
              icon={theme === "dark" ? "sun" : "moon"}
              label={
                theme === "dark"
                  ? language === "id"
                    ? "Aktifkan mode terang"
                    : "Switch to light mode"
                  : language === "id"
                    ? "Aktifkan mode gelap"
                    : "Switch to dark mode"
              }
              onClick={() => switchTheme()}
              className="header-theme-button"
            />
            <button
              type="button"
              className="avatar-button"
              aria-label={t.profile}
              onClick={() => openSettings("profile")}
            >
              {isAuthenticated ? profileInitials : <Icon name="user" size={19} />}
              <span className="status-dot" />
            </button>
          </div>
        </header>

        <div className="chat-scroll">
          <section className="welcome" aria-labelledby="welcome-title">
            <div>
              <span className="eyebrow">
                <Icon name="clock" size={12} />
                {currentDate}
              </span>
              <h1 id="welcome-title">
                {isAuthenticated
                  ? language === "id"
                    ? `Horas, ${firstName}.`
                    : `Good morning, ${firstName}.`
                  : language === "id"
                    ? "Horas, Kurir."
                    : "Hello, Courier."}
              </h1>
              <p>{t.subtitle}</p>
            </div>
            <div className="day-summary" aria-label="Today's route summary">
              <div>
                <strong>8</strong>
                <span>{t.stops}</span>
              </div>
              <div>
                <strong>12</strong>
                <span>{t.packages}</span>
              </div>
              <div>
                <strong>{language === "id" ? "2j 10m" : "2h 10m"}</strong>
                <span>{t.estimate}</span>
              </div>
            </div>
          </section>

          <section className="quick-section" aria-label={t.quick}>
            <div className="quick-scroll">
              {[
                ["route", "route", t.optimize],
                ["wa", "message", t.whatsapp],
                ["scan", "scan", t.scanner],
                ["handling", "package", t.handling],
                ["print", "printer", t.printLabel],
              ].map(([type, icon, label]) => (
                <button
                  type="button"
                  className="quick-card"
                  key={type}
                  onClick={() => {
                    triggerHaptic(20)
                    if (type === "print") {
                      setOverlay("print")
                    } else if (type === "scan") {
                      setOverlay("scanner")
                    } else if (type === "handling") {
                      setOverlay("handling_faq")
                    } else {
                      quickAction(
                        type as "route" | "wa",
                      )
                    }
                  }}
                >
                  <span className="quick-icon">
                    <Icon name={icon as IconName} />
                  </span>
                  <span>{label}</span>
                  <Icon name="chevron" size={16} />
                </button>
              ))}
            </div>
          </section>

          <section className="thread" aria-label="Chat">
            {activeSessionId === "session_1" ? (
              <>
                <div className="date-rule">
                  <span>{t.today}, 09.14</span>
                </div>
                <div className="user-message">
                  Susun rute tercepat untuk 4 alamat ini. Dahulukan paket prioritas.
                </div>

                <article
                  className={`assistant-card ${regenerating ? "loading" : ""}`}
                >
                  <div className="assistant-head">
                    <BrandMark size={30} />
                    <div>
                      <strong>Pardalani</strong>
                      <span>Kopilot Rute AI</span>
                    </div>
                  </div>
                  {regenerating ? (
                    <div
                      className="skeleton-stack"
                      aria-label="Regenerating response"
                    >
                      <span />
                      <span />
                      <span />
                    </div>
                  ) : (
                    <>
                      <h2>Rute siap dijalankan</h2>
                      <p>4 perhentian telah dioptimalkan untuk efisiensi waktu dan konsumsi bahan bakar.</p>
                      <ul className="insight-list">
                        <li>
                          <Icon name="check" size={17} />
                          Paket prioritas diantar lebih dulu.
                        </li>
                        <li>
                          <Icon name="package" size={17} />
                          Satu paket pecah belah perlu posisi tegak.
                        </li>
                        <li>
                          <Icon name="warning" size={17} />
                          Hindari Jl. Sudirman hingga pukul 10.30 karena pasar tumpah.
                        </li>
                      </ul>
                      <div
                        className="route-table"
                        role="table"
                        aria-label="Route steps"
                      >
                        <div className="route-header" role="row">
                          <span>Urutan</span>
                          <span>Tujuan</span>
                          <span>ETA</span>
                        </div>
                        {routeSteps.map((step) => (
                          <div className="route-row" role="row" key={step.no}>
                            <span className="route-number">{step.no}</span>
                            <span className="route-address">
                              <strong>{step.address}</strong>
                              <small>{step.status}</small>
                            </span>
                            <time>{step.eta}</time>
                          </div>
                        ))}
                      </div>
                      <div
                        className="next-stop-card"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          window.open(
                            "https://www.google.com/maps/search/?api=1&query=Jl.+Sei+Batang+Hari+12,+Medan",
                            "_blank",
                          )
                        }}
                      >
                        <span className="next-icon">
                          <Icon name="route" />
                        </span>
                        <div>
                          <small>Tujuan berikutnya</small>
                          <strong>Jl. Sei Batang Hari 12</strong>
                          <span>1,8 km · 8 mnt</span>
                        </div>
                        <Icon name="chevron" />
                      </div>
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => {
                          triggerHaptic(25)
                          notify(
                            language === "id"
                              ? "Membuka rute navigasi di Google Maps..."
                              : "Opening route navigation in Google Maps...",
                          )
                          if (
                            typeof window !== "undefined" &&
                            (window as any).AndroidAction?.openMaps
                          ) {
                            ;(window as any).AndroidAction.openMaps(
                              "Jl. Sei Batang Hari 12, Medan",
                            )
                          } else {
                            window.open(
                              "https://www.google.com/maps/search/?api=1&query=Jl.+Sei+Batang+Hari+12,+Medan",
                              "_blank",
                            )
                          }
                        }}
                      >
                        <Icon name="route" />
                        {t.startNav}
                      </button>
                      <div className="message-actions">
                        <button
                          type="button"
                          className={speakingText === defaultRouteSpeech ? "speaking" : ""}
                          onClick={listenToResponse}
                        >
                          <Icon name="speaker" size={17} />
                          {speakingText === defaultRouteSpeech
                            ? language === "id"
                              ? "Berhenti"
                              : "Stop"
                            : t.listen}
                        </button>
                        <button type="button" onClick={copyResponse}>
                          <Icon name="copy" size={17} />
                          {t.copy}
                        </button>
                        <button type="button" onClick={regenerate}>
                          <Icon name="refresh" size={17} />
                          {t.regenerate}
                        </button>
                      </div>
                    </>
                  )}
                </article>
              </>
            ) : (
              chatMessages.length > 0 && (
                <div className="date-rule">
                  <span>{t.today}</span>
                </div>
              )
            )}

            {chatMessages.map((msg) =>
              msg.sender === "user" ? (
                <div className="user-message" key={msg.id}>
                  {msg.imageUrl && (
                    <div style={{ marginBottom: "8px", overflow: "hidden", borderRadius: "10px" }}>
                      <img
                        src={msg.imageUrl}
                        alt="Lampiran"
                        style={{
                          width: "100%",
                          maxHeight: "220px",
                          objectFit: "cover",
                          borderRadius: "10px",
                          display: "block",
                        }}
                      />
                    </div>
                  )}
                  {msg.text}
                </div>
              ) : (
                <article className="assistant-card" key={msg.id}>
                  <div className="assistant-head">
                    <BrandMark size={30} />
                    <div>
                      <strong>Pardalani</strong>
                      <span>
                        {language === "id"
                          ? "Kopilot Rute AI"
                          : "AI Route Copilot"}
                      </span>
                    </div>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "11px",
                      lineHeight: 1.55,
                      color: "var(--foreground)",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {msg.text}
                    {msg.isStreaming && (
                      <span className="inline-block w-1.5 h-3 bg-current animate-pulse ml-0.5" />
                    )}
                  </p>
                  {!msg.isStreaming && msg.actions && msg.actions.length > 0 && (
                    <div className="chat-action-row">
                      {msg.actions.map((act, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className={`chat-action-btn ${act.type}`}
                          onClick={() => handleChatAction(act)}
                        >
                          <Icon
                            name={
                              act.type === "whatsapp"
                                ? "whatsapp"
                                : act.type === "maps"
                                  ? "route"
                                  : "phone"
                            }
                            size={14}
                          />
                          <span>{act.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {!msg.isStreaming && msg.text && (
                    <div className="message-actions">
                      <button
                        type="button"
                        className={speakingText === msg.text ? "speaking" : ""}
                        onClick={() => listenToCustomText(msg.text)}
                      >
                        <Icon name="speaker" size={17} />
                        {speakingText === msg.text
                          ? language === "id"
                            ? "Berhenti"
                            : "Stop"
                          : t.listen}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await navigator.clipboard?.writeText(msg.text)
                          } catch {}
                          notify(
                            language === "id"
                              ? "Jawaban disalin"
                              : "Response copied",
                          )
                        }}
                      >
                        <Icon name="copy" size={17} />
                        {t.copy}
                      </button>
                    </div>
                  )}
                </article>
              ),
            )}

            {isTyping && (
              <div className="typing" aria-label="Pardalani is typing">
                <BrandMark size={26} />
                <span />
                <span />
                <span />
              </div>
            )}
          </section>
        </div>

        <div className="composer-wrap">
          <div className="composer">
            <input
              type="file"
              ref={cameraInputRef}
              accept="image/*"
              capture="environment"
              style={{ display: "none" }}
              onChange={handleCameraCapture}
            />
            <input
              type="file"
              ref={galleryInputRef}
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleGallerySelect}
            />
            <input
              type="file"
              ref={documentInputRef}
              accept="*/*"
              style={{ display: "none" }}
              onChange={handleDocumentSelect}
            />
            <IconButton
              icon="plus"
              label={language === "id" ? "Tambah lampiran" : "Add attachment"}
              onClick={() => setOverlay("media")}
            />
            <IconButton
              icon="camera"
              label={language === "id" ? "Buka pemindai barcode" : "Open barcode scanner"}
              onClick={() => {
                triggerHaptic(20)
                setOverlay("scanner")
              }}
            />
            <textarea
              rows={1}
              value={composer}
              aria-label={t.placeholder}
              placeholder={t.placeholder}
              onChange={(event) => setComposer(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault()
                  sendMessage()
                }
              }}
            />
            <IconButton
              icon={composer.trim() ? "send" : "mic"}
              label={
                composer.trim()
                  ? language === "id"
                    ? "Kirim pesan"
                    : "Send message"
                  : isListening
                    ? language === "id"
                      ? "Mendengarkan... (ketuk untuk selesai)"
                      : "Listening... (tap to finish)"
                    : language === "id"
                      ? "Pesan suara"
                      : "Voice message"
              }
              onClick={() =>
                composer.trim() ? sendMessage() : startVoiceInput()
              }
              className={`send-button ${isListening ? "listening-active" : ""}`}
            />
          </div>
        </div>

        {splashPhase !== "done" && (
          <div className={`splash-screen ${splashPhase === "fading" ? "fade-out" : ""}`}>
            {/* 1. Background Street Road Network */}
            <SplashMapBackground />

            <div className="splash-card-layout">
              {/* 2. Top Brand Lockup: Squircle Logo Badge & Titles */}
              <div className="splash-brand-block">
                <div className="splash-squircle-badge">
                  <svg
                    width="44"
                    height="44"
                    viewBox="0 0 44 44"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Pardalani Logo"
                  >
                    {/* Stylized P with Speed Wing in Neon Lime */}
                    <path
                      d="M 11 34 V 10 H 23 C 29 10 33 13.6 33 19 C 33 24.4 29 27.5 23 27.5 H 17.5 V 34 Z"
                      fill="#C9F43B"
                    />
                    {/* Aerodynamic Speed Wing / Feather pointing top-right */}
                    <path
                      d="M 26 10.5 Q 36 6.5 38 4 Q 35 11 32 15 Z"
                      fill="#C9F43B"
                    />
                    {/* Dark Navy Inner Cutout */}
                    <path
                      d="M 17.5 15.5 H 23 C 25.5 15.5 27 16.9 27 19 C 27 21.1 25.5 22.5 23 22.5 H 17.5 Z"
                      fill="#1F223D"
                    />
                  </svg>
                </div>
                <h1 className="splash-title">Pardalani</h1>
                <p className="splash-tagline">DONGAN SETIA KURIR</p>
              </div>

              {/* 3. Center Scene: Animated Scooter Courier & Neon Curve & Pin */}
              <SplashCourierScene />

              {/* 4. Bottom Indicator: 5 Dots & Dynamic Status Text */}
              <div className="splash-bottom-block">
                <div className="splash-dots" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((dotIdx) => (
                    <span
                      key={dotIdx}
                      className={`splash-dot ${splashStep === dotIdx ? "active" : ""}`}
                    />
                  ))}
                </div>
                <p className="splash-status-text">
                  {splashStep === 0
                    ? (language === "id"
                        ? "Mengunci GPS & koordinat rute..."
                        : "Locking GPS & mapping route...")
                    : splashStep === 1
                    ? (language === "id"
                        ? "Menyinkronkan data paket..."
                        : "Syncing parcel manifest...")
                    : splashStep === 2
                    ? (language === "id"
                        ? "Memetakan 4 titik rute prioritas..."
                        : "Mapping 4 priority stops...")
                    : splashStep === 3
                    ? (language === "id"
                        ? "Mengoptimalkan jalur terhemat..."
                        : "Optimizing fastest routes...")
                    : (language === "id"
                        ? "Pardalani Siap! Horas Kurir."
                        : "Pardalani Ready! Welcome.")}
                </p>
              </div>
            </div>
          </div>
        )}

        {splashPhase === "done" && showWelcome && (
          <div
            className="welcome-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Panduan Fitur Utama Pardalani"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowWelcome(false)
                try {
                  localStorage.setItem("pardalani_welcomed", "true")
                } catch {}
              }
            }}
          >
            <div className="welcome-modal">
              <div className="welcome-modal-header">
                <button
                  type="button"
                  className="welcome-close-btn"
                  onClick={() => {
                    setShowWelcome(false)
                    try {
                      localStorage.setItem("pardalani_welcomed", "true")
                    } catch {}
                  }}
                  aria-label="Tutup panduan"
                >
                  <Icon name="close" size={14} />
                </button>
              </div>

              <h2 className="welcome-modal-title">
                {language === "id"
                  ? "Asisten Pengantaran Kurir"
                  : "Courier Delivery Assistant"}
              </h2>
              <p className="welcome-modal-desc">
                {language === "id"
                  ? "Fitur andalan tugas pengantaran:"
                  : "Core delivery superpowers:"}
              </p>

              <div className="wfc-carousel">
                <div
                  className="wfc-track"
                  style={{ transform: `translateX(-${welcomeSlide * 100}%)` }}
                >
                  {/* Slide 1 – Urutan Rute Tercepat */}
                  <div className="wfc-slide">
                    <div className="wfc-card">
                      <div className="wfc-top-row">
                        <span className="wfc-corner-icon wfc-corner-icon--route">
                          <Icon name="route" size={13} />
                        </span>
                        <button
                          type="button"
                          className="wfc-corner-link"
                          aria-label={language === "id" ? "Buka optimasi rute" : "Open route optimization"}
                          title={language === "id" ? "Buka optimasi rute" : "Open route optimization"}
                          onClick={() => {
                            setShowWelcome(false)
                            try {
                              localStorage.setItem("pardalani_welcomed", "true")
                            } catch {}
                            triggerHaptic(20)
                            quickAction("route")
                            notify(
                              language === "id"
                                ? "Memulai optimasi rute tercepat..."
                                : "Optimizing fastest route...",
                            )
                          }}
                        >
                          <Icon name="external" size={13} />
                        </button>
                      </div>
                      <h3 className="wfc-heading">
                        {language === "id" ? "Urutan Rute\nTercepat" : "Optimal Route\nSequence"}
                      </h3>
                      <div className="wfc-img-frame">
                        <img
                          src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80&fit=crop&crop=center"
                          alt={language === "id" ? "Peta rute pengantaran" : "Delivery route map"}
                          className="wfc-img"
                        />
                        <div className="wfc-img-overlay" />
                      </div>
                      <p className="wfc-caption">
                        {language === "id"
                          ? "Alamat diurutkan otomatis — bensin hemat, waktu efisien."
                          : "Auto-sorted stops save fuel and cut delivery time."}
                      </p>
                    </div>
                  </div>

                  {/* Slide 2 – Pindai Resi */}
                  <div className="wfc-slide">
                    <div className="wfc-card">
                      <div className="wfc-top-row">
                        <span className="wfc-corner-icon wfc-corner-icon--scan">
                          <Icon name="scan" size={13} />
                        </span>
                        <button
                          type="button"
                          className="wfc-corner-link"
                          aria-label={language === "id" ? "Buka pemindai resi" : "Open label scanner"}
                          title={language === "id" ? "Buka pemindai resi" : "Open label scanner"}
                          onClick={() => {
                            setShowWelcome(false)
                            try {
                              localStorage.setItem("pardalani_welcomed", "true")
                            } catch {}
                            triggerHaptic(20)
                            setOverlay("scanner")
                          }}
                        >
                          <Icon name="external" size={13} />
                        </button>
                      </div>
                      <h3 className="wfc-heading">
                        {language === "id" ? "Pindai Resi\nOtomatis" : "Instant Label\nScan"}
                      </h3>
                      <div className="wfc-img-frame">
                        <img
                          src="https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=600&q=80&fit=crop&crop=center"
                          alt={language === "id" ? "Pindai barcode paket" : "Package barcode scan"}
                          className="wfc-img"
                        />
                        <div className="wfc-img-overlay" />
                      </div>
                      <p className="wfc-caption">
                        {language === "id"
                          ? "Jepret barcode — nama & alamat terbaca seketika."
                          : "Snap a barcode — name & address read instantly."}
                      </p>
                    </div>
                  </div>

                  {/* Slide 3 – Dikte Suara */}
                  <div className="wfc-slide">
                    <div className="wfc-card">
                      <div className="wfc-top-row">
                        <span className="wfc-corner-icon wfc-corner-icon--voice">
                          <Icon name="mic" size={13} />
                        </span>
                        <button
                          type="button"
                          className="wfc-corner-link"
                          aria-label={language === "id" ? "Mulai dikte suara" : "Start voice dictation"}
                          title={language === "id" ? "Mulai dikte suara" : "Start voice dictation"}
                          onClick={() => {
                            setShowWelcome(false)
                            try {
                              localStorage.setItem("pardalani_welcomed", "true")
                            } catch {}
                            triggerHaptic(20)
                            startVoiceInput()
                            notify(
                              language === "id"
                                ? "Mikrofon aktif. Silakan bicara..."
                                : "Microphone active. Speak now...",
                            )
                          }}
                        >
                          <Icon name="external" size={13} />
                        </button>
                      </div>
                      <h3 className="wfc-heading">
                        {language === "id" ? "Dikte Suara\nHands-free" : "Voice Input\nHands-free"}
                      </h3>
                      <div className="wfc-img-frame">
                        <img
                          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80&fit=crop&crop=center"
                          alt={language === "id" ? "Kurir berkendara hands-free" : "Courier riding hands-free"}
                          className="wfc-img"
                        />
                        <div className="wfc-img-overlay" />
                      </div>
                      <p className="wfc-caption">
                        {language === "id"
                          ? "Rekam pesan & terima instruksi tanpa menyentuh layar."
                          : "Dictate notes & get spoken instructions while riding."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Slide dots */}
                <div className="wfc-dots">
                  {[0, 1, 2].map(i => (
                    <button
                      key={i}
                      type="button"
                      className={`wfc-dot-btn${welcomeSlide === i ? " active" : ""}`}
                      aria-label={`Slide ${i + 1}`}
                      onClick={() => setWelcomeSlide(i)}
                    />
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="welcome-primary-btn"
                onClick={() => {
                  setShowWelcome(false)
                  try {
                    localStorage.setItem("pardalani_welcomed", "true")
                  } catch {}
                  notify(
                    language === "id"
                      ? "Selamat bertugas! Rute Anda sudah siap."
                      : "Ready to go! Your delivery route is active.",
                  )
                }}
              >
                <span>
                  {language === "id"
                    ? "Mulai Bertugas Sekarang"
                    : "Start Daily Run"}
                </span>
                <Icon name="chevron" size={14} style={{ transform: "rotate(-90deg)" }} />
              </button>
            </div>
          </div>
        )}

        {showGooglePicker && (
          <div
            className="google-picker-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="google-picker-title"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowGooglePicker(false)
            }}
          >
            <div className="google-picker-card">
              <div className="google-picker-header">
                <div className="google-picker-brand">
                  <GoogleLogoIcon size={24} />
                  <div>
                    <h3 id="google-picker-title">
                      {language === "id" ? "Login dengan Google" : "Sign in with Google"}
                    </h3>
                    <p>
                      {language === "id"
                        ? "Pilih akun untuk masuk ke Pardalani"
                        : "Choose account to continue"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="google-picker-close"
                  onClick={() => setShowGooglePicker(false)}
                  aria-label="Tutup"
                >
                  <Icon name="close" size={14} />
                </button>
              </div>

              <div className="google-picker-accounts">
                {/* Account 1: Maxwell Rumbo */}
                <button
                  type="button"
                  className="google-account-item"
                  onClick={() => {
                    triggerHaptic(20)
                    syncGoogleUser({
                      name: "Maxwell Rumbo",
                      email: "maxrumbo06@gmail.com",
                      googleId: "GGL-MAX-01",
                    })
                  }}
                >
                  <div className="google-avatar-circle bg-red">M</div>
                  <div className="google-account-details">
                    <div className="google-account-name">Maxwell Rumbo</div>
                    <div className="google-account-email">maxrumbo06@gmail.com</div>
                  </div>
                  <span className="google-account-badge">
                    {language === "id" ? "Masuk Cepat" : "Instant"}
                  </span>
                </button>

                {/* Account 2: Kurir Pardalani */}
                <button
                  type="button"
                  className="google-account-item"
                  onClick={() => {
                    triggerHaptic(20)
                    syncGoogleUser({
                      name: "Kurir Pardalani",
                      email: "kurir.pardalani@gmail.com",
                      googleId: "GGL-KUR-02",
                    })
                  }}
                >
                  <div className="google-avatar-circle bg-navy">K</div>
                  <div className="google-account-details">
                    <div className="google-account-name">Kurir Pardalani</div>
                    <div className="google-account-email">kurir.pardalani@gmail.com</div>
                  </div>
                </button>

                {/* Account 3: Custom Email */}
                {showCustomGoogleInput ? (
                  <div className="google-custom-box">
                    <input
                      type="email"
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      placeholder="nama@gmail.com"
                      className="google-custom-input"
                      autoFocus
                    />
                    <div className="google-custom-actions">
                      <button
                        type="button"
                        className="google-custom-btn cancel"
                        onClick={() => setShowCustomGoogleInput(false)}
                      >
                        {language === "id" ? "Batal" : "Cancel"}
                      </button>
                      <button
                        type="button"
                        className="google-custom-btn submit"
                        onClick={() => {
                          if (!customGoogleEmail || !customGoogleEmail.includes("@")) {
                            notify(
                              language === "id"
                                ? "Format email tidak valid"
                                : "Invalid email format",
                            )
                            return
                          }
                          const namePart = customGoogleEmail.split("@")[0]
                          const formattedName =
                            namePart.charAt(0).toUpperCase() + namePart.slice(1)
                          triggerHaptic(20)
                          syncGoogleUser({
                            name: formattedName,
                            email: customGoogleEmail.trim(),
                            googleId: `GGL-${Date.now().toString().slice(-4)}`,
                          })
                        }}
                      >
                        {language === "id" ? "Gunakan" : "Use"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="google-add-account-btn"
                    onClick={() => setShowCustomGoogleInput(true)}
                  >
                    <Icon name="plus" size={14} />
                    <span>
                      {language === "id"
                        ? "Gunakan akun Google lain"
                        : "Use another Google account"}
                    </span>
                  </button>
                )}
              </div>

              {/* Troubleshooting info for Error 400 origin_mismatch */}
              <div className="google-picker-footer">
                <button
                  type="button"
                  className="google-cloud-info-toggle"
                  onClick={() => setShowGoogleHelp((prev) => !prev)}
                >
                  <span>
                    {language === "id"
                      ? "Mengapa ada Error 400 di popup Google?"
                      : "Why did Error 400 appear in Google popup?"}
                  </span>
                  <Icon
                    name="chevron"
                    size={12}
                    style={{
                      transform: showGoogleHelp ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}
                  />
                </button>
                {showGoogleHelp && (
                  <div className="google-cloud-help-card">
                    <p>
                      {language === "id"
                        ? "Google memblokir origin https://localhost karena belum didaftarkan di Google Cloud Console. Untuk membukanya di browser popup:"
                        : "Google blocks https://localhost unless registered in Google Cloud Console. To enable web GIS popup:"}
                    </p>
                    <div className="google-help-origins">
                      <code>https://localhost</code>
                      <code>http://localhost</code>
                    </div>
                    <button
                      type="button"
                      className="google-gis-trigger-btn"
                      onClick={triggerDirectGoogleGis}
                    >
                      <GoogleLogoIcon size={14} />
                      <span>
                        {language === "id"
                          ? "Buka Jendela Google (Web GIS)"
                          : "Open Google Window (Web GIS)"}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {overlay === "drawer" && (
        <div
          className="overlay"
          role="presentation"
          onMouseDown={() => setOverlay("none")}
        >
          <aside
            className="drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="drawer-profile">
              <div className="drawer-brand">
                <BrandMark size={24} />
                <strong id="drawer-title">Pardalani</strong>
              </div>
              <button
                ref={closeRef}
                type="button"
                className="drawer-close"
                aria-label="Tutup"
                onClick={() => setOverlay("none")}
              >
                <Icon name="close" size={15} />
              </button>
            </div>
            <div className="drawer-body">
              <button
                type="button"
                className="new-chat-btn"
                onClick={startNewChat}
              >
                <Icon name="plus" size={16} />
                <span>{language === "id" ? "Pesan Baru" : "New Chat"}</span>
              </button>
              <label className="search-field">
                <Icon name="search" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t.search}
                  aria-label={t.search}
                />
                {search && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setSearch("")}
                  >
                    <Icon name="close" size={17} />
                  </button>
                )}
              </label>
              <div className="history-title">
                <h3>{t.history}</h3>
                <span>{filteredHistory.length}</span>
              </div>
              <div className="history-list">
                {filteredHistory.length === 0 ? (
                  <div className="empty-state">
                    <span className="empty-state-icon">
                      <Icon name="search" size={17} />
                    </span>
                    <strong>
                      {search
                        ? t.emptySearch
                        : language === "id"
                          ? "Belum ada riwayat percakapan"
                          : "No conversation history yet"}
                    </strong>
                    {search ? (
                      <button type="button" onClick={() => setSearch("")}>
                        {t.resetSearch}
                      </button>
                    ) : (
                      <span className="empty-state-hint">
                        {language === "id"
                          ? "Percakapan baru akan tersimpan di sini"
                          : "New chats will be saved here"}
                      </span>
                    )}
                  </div>
                ) : (
                  ["today", "yesterday", "earlier"].map((group) => {
                    const items = filteredHistory
                      .filter((item) => item.group === group)
                      .sort(
                        (a, b) =>
                          Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)),
                      )
                    if (!items.length) return null
                    return (
                      <div className="history-group" key={group}>
                        <h4>
                          {t[(group as "today" | "yesterday" | "earlier")]}
                        </h4>
                        {items.map((item) => (
                          <div className="history-row" key={item.id}>
                            {renaming === item.id ? (
                              <form
                                className="rename-form"
                                onSubmit={(event) => {
                                  event.preventDefault()
                                  commitRename()
                                }}
                              >
                                <input
                                  autoFocus
                                  value={renameValue}
                                  onChange={(event) =>
                                    setRenameValue(event.target.value)
                                  }
                                  aria-label={t.rename}
                                />
                                <IconButton
                                  icon="check"
                                  label={t.save}
                                  onClick={commitRename}
                                />
                              </form>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className="history-main"
                                  onClick={() => selectSession(item)}
                                >
                                  <span className="history-icon">
                                    <Icon
                                      name={item.pinned ? "pin" : "message"}
                                      size={18}
                                    />
                                  </span>
                                  <span>
                                    <strong>{item.title}</strong>
                                    <small>{item.preview}</small>
                                  </span>
                                  <time>{item.time}</time>
                                </button>
                                <IconButton
                                  icon="more"
                                  label="Session options"
                                  onClick={() =>
                                    setActiveMenu(
                                      activeMenu === item.id ? null : item.id,
                                    )
                                  }
                                />
                                {activeMenu === item.id && (
                                  <div className="context-menu">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveMenu(null)
                                        void shareConversation(item)
                                      }}
                                    >
                                      <Icon name="share" size={17} />
                                      {t.shareConversation}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => togglePin(item.id)}
                                    >
                                      <Icon name="pin" size={17} />
                                      {item.pinned ? t.unpin : t.pin}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => startRename(item)}
                                    >
                                      <Icon name="edit" size={17} />
                                      {t.rename}
                                    </button>
                                    <button
                                      type="button"
                                      className="danger-text"
                                      onClick={() => {
                                        setDeleting(item.id)
                                        setActiveMenu(null)
                                      }}
                                    >
                                      <Icon name="trash" size={17} />
                                      {t.delete}
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
            <nav className="drawer-links" aria-label="Courier tools">
              <button
                type="button"
                onClick={() => {
                  setOverlay("none")
                  setShowWelcome(true)
                }}
              >
                <Icon name="route" />
                {language === "id" ? "Panduan & Sambutan" : "Welcome & Guide"}
                <Icon name="chevron" />
              </button>
              <button type="button" onClick={() => setOverlay("saved")}>
                <Icon name="bookmark" />
                {t.saved}
                <Icon name="chevron" />
              </button>
              <button type="button" onClick={() => setOverlay("log")}>
                <Icon name="log" />
                {t.deliveryLog}
                <Icon name="chevron" />
              </button>
              <button type="button" onClick={() => openSettings("prefs")}>
                <Icon name="settings" />
                {t.settings}
                <Icon name="chevron" />
              </button>
            </nav>
            {deleting !== null && (
              <div
                className="confirm-overlay"
                role="dialog"
                aria-modal="true"
                onClick={(e) => {
                  if (e.target === e.currentTarget) setDeleting(null)
                }}
              >
                <div
                  className="confirm-card"
                  role="alertdialog"
                  aria-labelledby="delete-title"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="danger-icon">
                    <Icon name="trash" />
                  </span>
                  <h3 id="delete-title">{t.confirmDelete}</h3>
                  <p>{t.deleteHint}</p>
                  <div className="confirm-actions">
                    <button
                      type="button"
                      className="confirm-btn-cancel"
                      onClick={() => setDeleting(null)}
                    >
                      {t.cancel}
                    </button>
                    <button
                      type="button"
                      className="confirm-btn-danger"
                      onClick={confirmDelete}
                    >
                      {t.delete}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {overlay === "settings" && (
        <div
          className="overlay sheet-overlay"
          role="presentation"
          onMouseDown={() => setOverlay("none")}
        >
          <section
            className="settings-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="sheet-header">
              <div>
                <span className="sheet-handle" />
                <h2 id="settings-title">{t.profile}</h2>
                <p>
                  {isAuthenticated
                    ? [displayName, authForm.courierId]
                        .filter(Boolean)
                        .join(" · ")
                    : language === "id"
                      ? "Mode Tamu · Belum masuk"
                      : "Guest Mode · Not signed in"}
                </p>
              </div>
              <IconButton
                icon="close"
                label="Close"
                onClick={() => setOverlay("none")}
                className="sheet-close"
              />
            </header>
            <div className="settings-tabs" role="tablist">
              {[
                ["profile", "user", language === "id" ? "Profil" : "Profile"],
                ["prefs", "sliders", t.preferences],
                ["ai", "message", t.ai],
                ["help", "help", t.help],
              ].map(([key, icon, label]) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={settingsSection === key}
                  className={settingsSection === key ? "active" : ""}
                  onClick={() =>
                    setSettingsSection(key as typeof settingsSection)
                  }
                  key={key}
                >
                  <Icon name={icon as IconName} size={18} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
            <div className="settings-content">
              {settingsSection === "profile" && (
                <div className="settings-panel profile-panel">
                  {isAuthenticated ? (
                    <>
                      <div className="large-profile">
                        {authForm.avatarUrl ? (
                          <img
                            src={authForm.avatarUrl}
                            alt={displayName}
                            style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "16px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <span>{profileInitials}</span>
                        )}
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <h3>{displayName}</h3>
                            {accountSource === "google" && <GoogleLogoIcon size={16} />}
                          </div>
                          {(authForm.area || accountSource === "google") && (
                            <p>
                              {accountSource === "google"
                                ? (language === "id"
                                    ? "Tersinkronisasi dengan Akun Google"
                                    : "Synchronized with Google Account")
                                : authForm.area}
                            </p>
                          )}
                        </div>
                      </div>
                      <h4>{language === "id" ? "INFORMASI AKUN" : "ACCOUNT INFORMATION"}</h4>
                      <div className="info-card">
                        {authForm.email && (
                          <div>
                            <span>Email</span>
                            <strong>{authForm.email}</strong>
                          </div>
                        )}
                        {authForm.phone && (
                          <div>
                            <span>
                              {language === "id" ? "Telepon" : "Phone"}
                            </span>
                            <strong>{authForm.phone}</strong>
                          </div>
                        )}
                        {authForm.courierId && (
                          <div>
                            <span>
                              {language === "id" ? "ID Kurir" : "Courier ID"}
                            </span>
                            <strong>{authForm.courierId}</strong>
                          </div>
                        )}
                        {accountSource === "google" && (
                          <div>
                            <span>
                              {language === "id"
                                ? "Sinkronisasi Akun"
                                : "Account Sync"}
                            </span>
                            <strong style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                              <GoogleLogoIcon size={14} />
                              Google Account
                            </strong>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        className="outline-button"
                        onClick={() => openAuth("forgot")}
                      >
                        <Icon name="shield" />
                        {language === "id" ? "Ganti kata sandi" : "Change password"}
                        <Icon name="chevron" />
                      </button>
                      <button
                        type="button"
                        className="logout-button"
                        onClick={() => {
                          setIsAuthenticated(false)
                          try {
                            localStorage.removeItem("pardalani_auth")
                          } catch {}
                          notify(
                            language === "id"
                              ? "Kamu sudah keluar"
                              : "You have signed out",
                          )
                        }}
                      >
                        <Icon name="external" />
                        {language === "id" ? "Keluar dari akun" : "Sign out"}
                      </button>
                    </>
                  ) : (
                    <div className="guest-profile">
                      <span className="guest-avatar">
                        <Icon name="user" />
                      </span>
                      <span className="guest-label">
                        {language === "id" ? "HALO, KURIR!" : "HELLO, COURIER!"}
                      </span>
                      <h3>
                        {language === "id"
                          ? "Masuk untuk pengalaman lengkap"
                          : "Sign in for the full experience"}
                      </h3>
                      <p>
                        {language === "id"
                          ? "Simpan riwayat, rute, dan preferensi kamu di semua perangkat."
                          : "Keep your history, routes, and preferences across devices."}
                      </p>
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => openAuth("login")}
                      >
                        {language === "id" ? "Masuk" : "Sign in"}
                      </button>
                      <button
                        type="button"
                        className="google-button"
                        onClick={handleGoogleAuth}
                      >
                        <GoogleLogoIcon size={20} />
                        <span>
                          {language === "id"
                            ? "Lanjutkan dengan Google"
                            : "Continue with Google"}
                        </span>
                      </button>
                      <p className="auth-switch">
                        {language === "id"
                          ? "Belum punya akun?"
                          : "Don't have an account?"}
                        <button type="button" onClick={() => openAuth("register")}>
                          {language === "id" ? "Daftar" : "Register"}
                        </button>
                      </p>
                    </div>
                  )}
                </div>
              )}
              {settingsSection === "prefs" && (
                <div className="settings-panel">
                  <h3>{t.preferences}</h3>
                  <p className="panel-intro">
                    {language === "id"
                      ? "Sesuaikan tampilan untuk kondisi kerja kamu."
                      : "Adjust the interface for your working conditions."}
                  </p>
                  <fieldset className="setting-group">
                    <legend>
                      {language === "id" ? "Tema tampilan" : "Appearance"}
                    </legend>
                    <div className="segmented">
                      <button
                        type="button"
                        className={theme === "light" ? "active" : ""}
                        onClick={() => switchTheme("light")}
                      >
                        <Icon name="sun" />
                        {t.light}
                      </button>
                      <button
                        type="button"
                        className={theme === "dark" ? "active" : ""}
                        onClick={() => switchTheme("dark")}
                      >
                        <Icon name="moon" />
                        {t.dark}
                      </button>
                    </div>
                  </fieldset>
                  <fieldset className="setting-group">
                    <legend>{t.language}</legend>
                    <div className="segmented">
                      <button
                        type="button"
                        className={language === "id" ? "active" : ""}
                        onClick={() => setLanguage("id")}
                      >
                        <Icon name="language" />
                        Indonesia
                      </button>
                      <button
                        type="button"
                        className={language === "en" ? "active" : ""}
                        onClick={() => setLanguage("en")}
                      >
                        <Icon name="language" />
                        English
                      </button>
                    </div>
                  </fieldset>
                  <div className="preference-preview">
                    <span>
                      <BrandMark size={32} />
                    </span>
                    <div>
                      <strong>
                        {theme === "dark" ? t.dark : t.light} ·{" "}
                        {language.toUpperCase()}
                      </strong>
                      <p>
                        {language === "id"
                          ? "Perubahan diterapkan langsung."
                          : "Changes apply instantly."}
                      </p>
                    </div>
                    <Icon name="check" />
                  </div>
                </div>
              )}
              {settingsSection === "ai" && (
                <div className="settings-panel">
                  <h3>{t.ai}</h3>
                  <p className="panel-intro">
                    {language === "id"
                      ? "Atur gaya komunikasi dan pantau kapasitas percakapan harian asisten kurir."
                      : "Adjust communication style and monitor your daily assistant chat capacity."}
                  </p>
                  <div className="token-usage">
                    <div className="token-usage-head">
                      <span>
                        <Icon name="message" size={17} />
                        {language === "id"
                          ? "Kapasitas Percakapan Aktif"
                          : "Active Chat Capacity"}
                      </span>
                    </div>
                    <output>
                      <strong>
                        {remainingTokens.toLocaleString(tokenLocale)}
                      </strong>
                      <span>
                        {" "}
                        / {maxTokens.toLocaleString(tokenLocale)}{" "}
                        {language === "id" ? "poin pesan" : "chat points"}
                      </span>
                    </output>
                    <progress value={remainingTokens} max={maxTokens}>
                      {remainingTokens} / {maxTokens}
                    </progress>
                    <p>
                      {language === "id"
                        ? `${usedTokens.toLocaleString(tokenLocale)} poin telah terpakai untuk bantuan rute & pengantaran hari ini.`
                        : `${usedTokens.toLocaleString(tokenLocale)} points used for route & delivery assistance today.`}
                    </p>
                  </div>

                  {/* Status Sambungan Layanan */}
                  <div
                    style={{
                      padding: "14px 16px",
                      borderRadius: "16px",
                      border: "1px solid var(--border)",
                      background: "var(--surface)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontWeight: "700",
                          fontSize: "13px",
                        }}
                      >
                        <Icon name="shield" size={16} />
                        {language === "id"
                          ? "Status Sambungan Layanan"
                          : "Service Connection Status"}
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "3px 9px",
                          borderRadius: "999px",
                          background:
                            backendStatus === "connected"
                              ? "rgba(16, 185, 129, 0.15)"
                              : "rgba(245, 158, 11, 0.15)",
                          color:
                            backendStatus === "connected"
                              ? "#10b981"
                              : "#f59e0b",
                        }}
                      >
                        {backendStatus === "connected"
                          ? language === "id"
                            ? "● Terhubung Pusat"
                            : "● Connected"
                          : backendStatus === "checking"
                            ? language === "id"
                              ? "Memeriksa..."
                              : "Checking..."
                            : language === "id"
                              ? "● Siaga Mandiri"
                              : "● Standby"}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        color: "var(--muted)",
                        lineHeight: 1.4,
                      }}
                    >
                      {backendStatus === "connected"
                        ? language === "id"
                          ? "Sistem terhubung penuh ke server rute & optimalisasi pengantaran Pardalani."
                          : "Fully connected to the Pardalani route optimization server."
                        : language === "id"
                          ? "Mode mandiri aktif. Asisten tetap siap membantu rute, draf WhatsApp, dan tips paket."
                          : "Local mode active. Assistant is ready to help with routes, WhatsApp drafts, and tips."}
                    </p>

                    <button
                      type="button"
                      onClick={() => setShowAdvancedServer(!showAdvancedServer)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 0 0",
                        border: "0",
                        borderTop: "1px dashed var(--border)",
                        background: "transparent",
                        color: "var(--muted)",
                        fontSize: "11px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      <span>
                        {language === "id"
                          ? "Opsi Jaringan Khusus"
                          : "Advanced Network Options"}
                      </span>
                      <Icon
                        name="chevron"
                        size={14}
                        style={{
                          transform: showAdvancedServer
                            ? "rotate(180deg)"
                            : "none",
                          transition: "transform 0.2s ease",
                        }}
                      />
                    </button>

                    {showAdvancedServer && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                          paddingTop: "4px",
                        }}
                      >
                        <div style={{ display: "flex", gap: "8px" }}>
                          <input
                            type="url"
                            value={backendUrl}
                            onChange={(event) => {
                              setBackendUrl(event.target.value)
                              try {
                                localStorage.setItem(
                                  "backend_url",
                                  event.target.value,
                                )
                              } catch {}
                            }}
                            placeholder="http://localhost:8080"
                            style={{
                              flex: 1,
                              padding: "8px 12px",
                              borderRadius: "10px",
                              border: "1px solid var(--border)",
                              background: "var(--background)",
                              color: "var(--foreground)",
                              fontSize: "12px",
                            }}
                          />
                          <button
                            type="button"
                            className="secondary-button"
                            style={{
                              padding: "0 12px",
                              whiteSpace: "nowrap",
                              fontSize: "12px",
                            }}
                            onClick={() => {
                              checkBackendHealth(backendUrl)
                              notify(
                                language === "id"
                                  ? "Memeriksa sambungan server..."
                                  : "Checking server connection...",
                              )
                            }}
                          >
                            <Icon name="refresh" size={14} />
                            {language === "id" ? "Uji Sambungan" : "Test"}
                          </button>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: "6px",
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              const url = "http://10.0.2.2:8080"
                              setBackendUrl(url)
                              try {
                                localStorage.setItem("backend_url", url)
                              } catch {}
                              checkBackendHealth(url)
                              notify(
                                language === "id"
                                  ? "Preset Emulator diaktifkan"
                                  : "Emulator preset active",
                              )
                            }}
                            style={{
                              fontSize: "10px",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              border: "1px solid var(--border)",
                              background:
                                backendUrl === "http://10.0.2.2:8080"
                                  ? "var(--primary-subtle)"
                                  : "var(--background)",
                              color:
                                backendUrl === "http://10.0.2.2:8080"
                                  ? "var(--primary)"
                                  : "inherit",
                              fontWeight:
                                backendUrl === "http://10.0.2.2:8080"
                                  ? "600"
                                  : "400",
                              cursor: "pointer",
                            }}
                          >
                            {language === "id"
                              ? "Jaringan Emulator"
                              : "Emulator Network"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const url = "http://localhost:8080"
                              setBackendUrl(url)
                              try {
                                localStorage.setItem("backend_url", url)
                              } catch {}
                              checkBackendHealth(url)
                              notify(
                                language === "id"
                                  ? "Preset Komputer Lokal diaktifkan"
                                  : "Local PC preset active",
                              )
                            }}
                            style={{
                              fontSize: "10px",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              border: "1px solid var(--border)",
                              background:
                                backendUrl === "http://localhost:8080"
                                  ? "var(--primary-subtle)"
                                  : "var(--background)",
                              color:
                                backendUrl === "http://localhost:8080"
                                  ? "var(--primary)"
                                  : "inherit",
                              fontWeight:
                                backendUrl === "http://localhost:8080"
                                  ? "600"
                                  : "400",
                              cursor: "pointer",
                            }}
                          >
                            {language === "id"
                              ? "Komputer Lokal"
                              : "Local PC"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Gaya Respon Asisten */}
                  <label className="field">
                    <span>
                      <Icon name="sliders" size={17} />
                      {t.temperature}
                      <output
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "2px 8px",
                          borderRadius: "8px",
                          background: "var(--primary-subtle)",
                          color: "var(--primary)",
                        }}
                      >
                        {temperature <= 0.4
                          ? language === "id"
                            ? "Ringkas & Lugas"
                            : "Concise & Direct"
                          : temperature <= 0.9
                            ? language === "id"
                              ? "Seimbang & Santun"
                              : "Balanced & Polite"
                            : language === "id"
                              ? "Ramah & Terperinci"
                              : "Detailed & Friendly"}
                      </output>
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={temperature}
                      onChange={(event) =>
                        setTemperature(Number(event.target.value))
                      }
                    />
                    <small
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: "2px",
                      }}
                    >
                      <span>
                        {language === "id"
                          ? "Langsung ke inti (fokus jalan)"
                          : "Direct to the point"}
                      </span>
                      <b>
                        {language === "id"
                          ? "Penjelasan santai & ramah"
                          : "Friendly & conversational"}
                      </b>
                    </small>
                  </label>

                  {/* Panduan Jawaban Asisten */}
                  <label className="field">
                    <span>
                      <Icon name="edit" size={17} />
                      {t.prompt}
                    </span>
                    <textarea
                      rows={3}
                      value={systemPrompts[language]}
                      placeholder={
                        language === "id"
                          ? "Contoh: Jawab dengan kalimat pendek, prioritaskan keselamatan berkendara..."
                          : "Example: Keep answers concise, prioritize road safety..."
                      }
                      onChange={(event) =>
                        setSystemPrompts({
                          ...systemPrompts,
                          [language]: event.target.value,
                        })
                      }
                    />
                    <small
                      style={{
                        color: "var(--muted)",
                        fontSize: "10.5px",
                        marginTop: "2px",
                      }}
                    >
                      {language === "id"
                        ? "Catatan khusus ini menjadi acuan asisten saat memberikan saran rute & paket."
                        : "These notes guide how the assistant responds to your delivery queries."}
                    </small>
                  </label>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={() =>
                      notify(
                        language === "id"
                          ? "Pengaturan asisten berhasil disimpan"
                          : "Assistant settings saved",
                      )
                    }
                  >
                    {t.save}
                  </button>
                </div>
              )}
              {settingsSection === "help" && (
                <div className="settings-panel">
                  <h3>{t.help}</h3>
                  <p className="panel-intro">
                    {language === "id"
                      ? "Jawaban cepat untuk perjalanan yang lebih lancar."
                      : "Quick answers for a smoother delivery run."}
                  </p>
                  <h4>{t.faq}</h4>
                  <div className="faq-list">
                    {[
                      {
                        q: language === "id" ? "Bagaimana scan label yang buram?" : "How do I scan a blurry label?",
                        a: language === "id" ? "Gunakan pencahayaan yang cukup, jaga jarak 15-20 cm dengan kamera stabil, atau ketik 4 digit terakhir resi di kolom percakapan." : "Ensure good lighting, keep a 15-20 cm distance, or type the last 4 digits of the label into chat.",
                      },
                      {
                        q: language === "id" ? "Apa dasar urutan rute?" : "How is route order decided?",
                        a: language === "id" ? "AI mengurutkan titik antar berdasarkan kedekatan jarak jalan, memprioritaskan paket urgent, dan menghindari jalan macet." : "The AI arranges stops by street proximity, prioritizes urgent parcels, and avoids congested corridors.",
                      },
                      {
                        q: language === "id" ? "Bagaimana mengubah draft WA?" : "How do I edit a WA draft?",
                        a: language === "id" ? "Klik tombol 'Salin' pada kartu draft lalu tempel ke WhatsApp, atau instruksikan AI: 'Ganti nama penerima menjadi Pak Joko'." : "Click 'Copy' on the draft card then paste into WhatsApp, or instruct the AI: 'Change recipient name to Mr. Joko'.",
                      },
                    ].map((item, index) => (
                      <div key={item.q} style={{ borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>
                        <button
                          type="button"
                          style={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            background: "none",
                            border: "none",
                            padding: "8px 0",
                            cursor: "pointer",
                            color: "inherit",
                            fontWeight: "600",
                            fontSize: "11px",
                            textAlign: "left",
                          }}
                          onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                        >
                          <span>{item.q}</span>
                          <Icon name="chevron" size={15} />
                        </button>
                        {expandedFaq === index && (
                          <p style={{ margin: "4px 0 8px", fontSize: "10px", lineHeight: "1.5", color: "var(--muted)", paddingLeft: "4px" }}>
                            {item.a}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  <h4>{t.contact}</h4>
                  <div className="contact-card">
                    <span>
                      <Icon name="message" />
                    </span>
                    <div>
                      <strong>Tim Pardalani</strong>
                      <p>developer@pardalani.id</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText("developer@pardalani.id")
                        notify(
                          language === "id" ? "Email disalin" : "Email copied",
                        )
                      }}
                    >
                      <Icon name="copy" />
                    </button>
                  </div>
                  <h4>{language === "id" ? "Kirim Masukan / Keluhan" : "Submit Feedback / Complaint"}</h4>
                  <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", padding: "12px", display: "grid", gap: "10px", marginTop: "4px" }}>
                    <label style={{ display: "grid", gap: "4px", fontSize: "10px", fontWeight: "600" }}>
                      <span>{language === "id" ? "Kategori" : "Category"}</span>
                      <select
                        value={complaintCategory}
                        onChange={(e) => setComplaintCategory(e.target.value)}
                        style={{ padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", fontSize: "11px" }}
                      >
                        <option value="Rute & Navigasi">{language === "id" ? "Rute & Navigasi" : "Route & Navigation"}</option>
                        <option value="Scan Label / Resi">{language === "id" ? "Scan Label / Resi" : "Scan Label / Receipt"}</option>
                        <option value="Aplikasi / Bug">{language === "id" ? "Aplikasi / Laporan Bug" : "App / Bug Report"}</option>
                        <option value="Lainnya">{language === "id" ? "Lainnya" : "Other"}</option>
                      </select>
                    </label>
                    <label style={{ display: "grid", gap: "4px", fontSize: "10px", fontWeight: "600" }}>
                      <span>{language === "id" ? "Pesan Masukan" : "Message"}</span>
                      <textarea
                        rows={3}
                        value={complaintMessage}
                        onChange={(e) => setComplaintMessage(e.target.value)}
                        placeholder={language === "id" ? "Tuliskan keluhan atau saran untuk tim developer..." : "Write your feedback or bug report..."}
                        style={{ padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", fontSize: "11px", resize: "none" }}
                      />
                    </label>
                    <button
                      type="button"
                      className="primary-button"
                      disabled={isSubmittingComplaint}
                      onClick={submitComplaint}
                      style={{ marginTop: "2px" }}
                    >
                      <Icon name="send" size={15} />
                      {isSubmittingComplaint
                        ? language === "id" ? "Mengirim..." : "Sending..."
                        : language === "id" ? "Kirim ke Developer" : "Send to Developer"}
                    </button>
                  </div>
                  <p className="version">
                    Pardalani{" "}
                    {language === "id" ? "Prototipe" : "Prototype"} · v0.1.0
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {overlay === "scanner" && (
        <div
          className="overlay scanner-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={language === "id" ? "Pemindai Barcode & Resi" : "Barcode Scanner"}
        >
          <div className="scanner-container">
            {/* Top Bar */}
            <div className="scanner-top-bar">
              <div className="scanner-title-badge">
                <span className="scanner-pulse-dot" />
                <strong>{language === "id" ? "Scanner Barcode Aktif" : "Barcode Scanner Active"}</strong>
              </div>
              <div className="scanner-top-actions">
                <button
                  type="button"
                  className={`scanner-tool-btn ${scannerFlash ? "active" : ""}`}
                  onClick={toggleFlash}
                  title={language === "id" ? "Lampu Flash" : "Flashlight"}
                  aria-label="Toggle Flashlight"
                >
                  <Icon name="sun" size={16} />
                </button>
                <button
                  type="button"
                  className="scanner-tool-btn close-btn"
                  onClick={() => setOverlay("none")}
                  title={language === "id" ? "Tutup" : "Close"}
                  aria-label="Close Scanner"
                >
                  <Icon name="close" size={16} />
                </button>
              </div>
            </div>

            {/* Video Viewfinder Area */}
            <div className="scanner-viewfinder">
              <video
                ref={scannerVideoRef}
                autoPlay
                playsInline
                muted
                className="scanner-video"
              />

              {/* Viewfinder Reticle / Targeting Frame */}
              <div className="scanner-reticle">
                <span className="reticle-corner tl" />
                <span className="reticle-corner tr" />
                <span className="reticle-corner bl" />
                <span className="reticle-corner br" />
                <div className="scanner-laser-line" />
                <div className="scanner-aim-hint">
                  <Icon name="scan" size={16} />
                  <span>
                    {language === "id"
                      ? "Posisikan Barcode di Kotak Ini"
                      : "Fit Barcode Inside Box"}
                  </span>
                </div>
              </div>

              {cameraError && (
                <div className="scanner-error-card">
                  <Icon name="warning" size={20} />
                  <p>{cameraError}</p>
                  <button
                    type="button"
                    className="scanner-alt-btn"
                    onClick={() => cameraInputRef.current?.click()}
                  >
                    <Icon name="camera" size={14} />
                    <span>{language === "id" ? "Gunakan Kamera Sistem" : "Use System Camera"}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Controls */}
            <div className="scanner-bottom-bar">
              <div className="scanner-actions-row">
                <button
                  type="button"
                  className="scanner-aux-btn"
                  onClick={() => galleryInputRef.current?.click()}
                  title={language === "id" ? "Pilih dari Galeri" : "Pick from Gallery"}
                >
                  <Icon name="image" size={16} />
                  <span>{language === "id" ? "Galeri" : "Gallery"}</span>
                </button>

                <button
                  type="button"
                  className="scanner-shutter-btn"
                  onClick={handleCaptureBarcode}
                  aria-label={language === "id" ? "Pindai Barcode Sekarang" : "Scan Barcode Now"}
                >
                  <span className="shutter-inner">
                    <Icon name="scan" size={24} />
                  </span>
                </button>

                <button
                  type="button"
                  className="scanner-aux-btn"
                  onClick={() => cameraInputRef.current?.click()}
                  title={language === "id" ? "Kamera HP" : "Phone Camera"}
                >
                  <Icon name="camera" size={16} />
                  <span>{language === "id" ? "Kamera" : "Camera"}</span>
                </button>
              </div>
              <p className="scanner-footer-text">
                {language === "id"
                  ? "Ketuk tombol tengah untuk membaca barcode dan verifikasi resi"
                  : "Tap center button to read barcode & verify package"}
              </p>
            </div>
          </div>
        </div>
      )}

      {overlay === "handling_faq" && (
        <div
          className="overlay sheet-overlay faq-sheet-overlay"
          role="presentation"
          onMouseDown={() => setOverlay("none")}
        >
          <section
            className="handling-faq-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="faq-popup-title"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <span className="sheet-handle" />
            <div className="handling-faq-header">
              <div className="handling-faq-title-wrap">
                <span className="handling-faq-icon">
                  <Icon name="package" size={18} />
                </span>
                <div>
                  <h3 id="faq-popup-title">
                    {language === "id" ? "Info & FAQ Penanganan" : "Handling & FAQ"}
                  </h3>
                  <p>
                    {language === "id"
                      ? "Pilih panduan cepat atau buka halaman SOP lengkap"
                      : "Choose quick guide or open full SOP handbook"}
                  </p>
                </div>
              </div>
              <IconButton
                icon="close"
                label="Close"
                onClick={() => setOverlay("none")}
              />
            </div>

            <div className="handling-faq-cards">
              {[
                {
                  id: "fragile",
                  title: language === "id" ? "Paket Pecah Belah (Fragile)" : "Fragile Items",
                  desc: language === "id" ? "Posisi paling atas, jangan tertimpa, tanda panah tegak." : "Top position, never crushed, keep arrows upward.",
                  tag: language === "id" ? "SOP Prioritas" : "Priority SOP",
                  tagColor: "#f59e0b",
                  icon: "package",
                },
                {
                  id: "perishable",
                  title: language === "id" ? "Makanan & Frozen Food" : "Perishable & Food",
                  desc: language === "id" ? "Maksimal antar 2 jam, dahulukan di urutan terdepan." : "Max 2 hours delivery, prioritize in early stops.",
                  tag: language === "id" ? "Batas Waktu" : "Urgent Time",
                  tagColor: "#0284c7",
                  icon: "clock",
                },
                {
                  id: "absent",
                  title: language === "id" ? "Penerima Tidak di Rumah" : "Recipient Unavailable",
                  desc: language === "id" ? "Telepon 2x, opsi titip satpam atau atur antar ulang." : "Call twice, drop with security or reschedule.",
                  tag: language === "id" ? "SOP Titip/Retur" : "Drop / Return",
                  tagColor: "#10b981",
                  icon: "user",
                },
                {
                  id: "damaged",
                  title: language === "id" ? "Paket Rusak atau Basah" : "Damaged Packaging",
                  desc: language === "id" ? "Wajib foto 4 sisi resi & konfirmasi sebelum serah." : "Photo 4 sides of label & confirm before handover.",
                  tag: language === "id" ? "Klaim Garansi" : "Claims",
                  tagColor: "#ef4444",
                  icon: "warning",
                },
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className="handling-faq-item"
                  onClick={() => {
                    triggerHaptic(20)
                    setSelectedHandlingTopic(item.id)
                    setOverlay("handling_detail")
                  }}
                >
                  <div className="faq-item-left">
                    <span className="faq-item-icon" style={{ color: item.tagColor, background: `color-mix(in srgb, ${item.tagColor} 14%, var(--surface))` }}>
                      <Icon name={item.icon as IconName} size={16} />
                    </span>
                    <div className="faq-item-text">
                      <div className="faq-item-title-row">
                        <strong>{item.title}</strong>
                        <span className="faq-item-badge" style={{ color: item.tagColor, background: `color-mix(in srgb, ${item.tagColor} 12%, transparent)` }}>
                          {item.tag}
                        </span>
                      </div>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                  <span className="faq-item-arrow">
                    <Icon name="chevron" size={14} style={{ transform: "rotate(-90deg)" }} />
                  </span>
                </button>
              ))}
            </div>

            <div className="handling-faq-footer">
              <button
                type="button"
                className="handling-full-btn"
                onClick={() => {
                  triggerHaptic(20)
                  setSelectedHandlingTopic("fragile")
                  setOverlay("handling_detail")
                }}
              >
                <span>{language === "id" ? "Buka Halaman Khusus SOP Lengkap" : "Open Dedicated Full SOP Page"}</span>
                <Icon name="external" size={14} />
              </button>
            </div>
          </section>
        </div>
      )}

      {overlay === "handling_detail" && (
        <div
          className="overlay sheet-overlay handling-detail-overlay"
          role="presentation"
          onMouseDown={() => setOverlay("none")}
        >
          <section
            className="handling-detail-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="handling-detail-title"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Header with Back button */}
            <div className="handling-detail-header">
              <button
                type="button"
                className="handling-back-btn"
                onClick={() => {
                  triggerHaptic(20)
                  setOverlay("handling_faq")
                }}
              >
                <Icon name="chevron" size={16} style={{ transform: "rotate(90deg)" }} />
                <span>{language === "id" ? "Kembali ke FAQ" : "Back to FAQ"}</span>
              </button>
              <IconButton
                icon="close"
                label="Close"
                onClick={() => setOverlay("none")}
              />
            </div>

            {/* Scrollable Content */}
            <div className="handling-detail-body">
              <div className="handling-detail-hero">
                <span className="handling-hero-icon">
                  <Icon name="package" size={24} />
                </span>
                <h2 id="handling-detail-title">
                  {language === "id" ? "Buku Panduan & SOP Penanganan Paket" : "Parcel Handling & SOP Handbook"}
                </h2>
                <p>
                  {language === "id"
                    ? "Standar operasional prosedur resmi Pardalani untuk menjaga keamanan paket kurir di lapangan."
                    : "Official Pardalani operational guidelines for secure delivery runs."}
                </p>
              </div>

              {/* Topic Selector Grid (2x2 Grid, Visible & Non-clipping) */}
              <div className="handling-topic-grid">
                {[
                  {
                    id: "fragile",
                    label: language === "id" ? "Pecah Belah" : "Fragile",
                    icon: "package",
                    color: "#f59e0b",
                  },
                  {
                    id: "perishable",
                    label: language === "id" ? "Makanan / Dingin" : "Perishable",
                    icon: "clock",
                    color: "#0284c7",
                  },
                  {
                    id: "absent",
                    label: language === "id" ? "Penerima Kosong" : "Absent",
                    icon: "user",
                    color: "#10b981",
                  },
                  {
                    id: "damaged",
                    label: language === "id" ? "Paket Rusak" : "Damaged",
                    icon: "warning",
                    color: "#ef4444",
                  },
                ].map((tab) => {
                  const isActive = selectedHandlingTopic === tab.id
                  return (
                    <button
                      type="button"
                      key={tab.id}
                      className={`handling-topic-tile ${isActive ? "active" : ""}`}
                      style={
                        isActive
                          ? ({
                              borderColor: tab.color,
                              "--tile-accent": tab.color,
                            } as React.CSSProperties)
                          : {}
                      }
                      onClick={() => {
                        triggerHaptic(15)
                        setSelectedHandlingTopic(tab.id)
                      }}
                    >
                      <span
                        className="topic-tile-icon"
                        style={{
                          color: isActive ? "#ffffff" : tab.color,
                          background: isActive
                            ? tab.color
                            : `color-mix(in srgb, ${tab.color} 14%, var(--surface-2))`,
                        }}
                      >
                        <Icon name={tab.icon as IconName} size={15} />
                      </span>
                      <span className="topic-tile-label">{tab.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Active Topic Detailed Content Card */}
              {(() => {
                const topic = {
                  fragile: {
                    title: language === "id" ? "SOP Paket Pecah Belah (Fragile)" : "Fragile Goods SOP",
                    subtitle: language === "id" ? "Keramik, Kaca, Botol Parfum, Elektronik Sensitif" : "Ceramics, Glass, Perfumes, Sensitive Electronics",
                    alert: language === "id" ? "Paling rawan komplain! Pastikan tanda panah selalu menghadap ke atas." : "High claim risk! Ensure 'This Way Up' arrows are strictly followed.",
                    steps: [
                      language === "id" ? "Tempatkan di posisi paling atas dalam tas kurir. Dilarang keras menimpa dengan barang berat (seperti deterjen / kaleng)." : "Keep at the very top of courier bag. Strictly forbidden to stack heavy items on top.",
                      language === "id" ? "Periksa segel lakban fragile sebelum berangkat. Jika segel kendor, tempelkan lakban pengaman tambahan." : "Inspect fragile tape seal before departure. Add safety tape if loose.",
                      language === "id" ? "Saat berkendara, hindari jalan berlubang dan guncangan mendadak." : "Avoid potholes and sudden speed bumps during transit.",
                      language === "id" ? "Serahkan langsung ke tangan penerima dan ambil foto paket utuh." : "Hand over directly to recipient and take a clear photo of the intact parcel.",
                    ],
                    aiPrompt: language === "id" ? "Bagaimana menangani paket pecah belah yang ada bunyi gemeretak di jalan?" : "How should I handle a fragile parcel that is rattling on the road?",
                  },
                  perishable: {
                    title: language === "id" ? "SOP Makanan Cepat Basi & Frozen" : "Perishable & Chilled Food SOP",
                    subtitle: language === "id" ? "Daging, Sayur Segar, Frozen Food, Makanan Basah" : "Fresh Meat, Veggies, Frozen Food, Fresh Meals",
                    alert: language === "id" ? "Waktu kritis: maksimal 2 jam sejak keberangkatan dari depo." : "Critical time window: maximum 2 hours from depo load.",
                    steps: [
                      language === "id" ? "Prioritaskan sebagai titik antar nomor #1 atau #2 di rute harian." : "Prioritize as stop #1 or #2 in today's active delivery sequence.",
                      language === "id" ? "Simpan di dalam kantong thermal / terlindung dari sinar matahari langsung dan hawa panas knalpot." : "Store inside thermal bag away from direct sunlight and exhaust heat.",
                      language === "id" ? "Kirim chat WhatsApp otomatis 15 menit sebelum tiba agar penerima siap menyimpan di lemari es." : "Send automated WhatsApp notification 15 mins before arrival so recipient is ready with fridge.",
                      language === "id" ? "Jika penerima tidak di rumah, dilarang meletakkan di teras terbuka tanpa izin tertulis." : "Never leave perishable items in outdoor open porch without explicit written consent.",
                    ],
                    aiPrompt: language === "id" ? "Saya bawa makanan beku tapi penerima minta antar nanti sore, apa solusinya?" : "I have frozen food but recipient asks to deliver this evening, what should I do?",
                  },
                  absent: {
                    title: language === "id" ? "SOP Penerima Tidak di Rumah / Rumah Kosong" : "Recipient Unavailable SOP",
                    subtitle: language === "id" ? "Rumah Digembok, Kantor Tutup, Tidak Menjawab Panggilan" : "Locked Gate, Closed Office, Unanswered Calls",
                    alert: language === "id" ? "Dilarang melempar paket ke dalam pagar tanpa instruksi resmi penerima!" : "Strictly forbidden to throw parcel over fence without written permission!",
                    steps: [
                      language === "id" ? "Lakukan panggilan telepon 2 kali berselang 3 menit dan kirim pesan draft WhatsApp otomatis." : "Call recipient twice with 3 mins gap and send official WhatsApp template.",
                      language === "id" ? "Jika disetujui penerima, titipkan ke satpam komplek atau tetangga terdekat dengan mencatat nama jelas penerima titipan." : "If authorized, drop with security guard or next-door neighbor, recording their full name.",
                      language === "id" ? "Ambil foto bukti serah terima yang memperlihatkan nomor rumah atau pos satpam." : "Take clear handover photo showing house number or guard post clearly.",
                      language === "id" ? "Jika tidak ada jawaban setelah 15 menit, tandai sebagai Antar Ulang (Reschedule) di sistem." : "If no response within 15 mins, mark as Reschedule and bring back safely to Hub.",
                    ],
                    aiPrompt: language === "id" ? "Penerima tidak di rumah dan satpam komplek menolak dititipi paket, bagaimana solusinya?" : "Recipient is away and guard refuses to accept the parcel, what is the protocol?",
                  },
                  damaged: {
                    title: language === "id" ? "SOP Paket Rusak / Basah / Kemasan Penyok" : "Damaged / Wet Packaging SOP",
                    subtitle: language === "id" ? "Kardus Sobek, Terkena Hujan, Segel Rusak" : "Torn Carton, Water-damaged, Broken Seal",
                    alert: language === "id" ? "Lindungi diri Anda dari ganti rugi dengan dokumentasi foto sebelum diserahkan." : "Protect yourself from claims by documenting clear photos before handover.",
                    steps: [
                      language === "id" ? "Ambil foto jelas 4 sisi kemasan yang memperlihatkan barcode resi dan bagian kerusakan sebelum berangkat." : "Take 4 clear photos showing shipping barcode and the damaged areas.",
                      language === "id" ? "Saat bertemu penerima, tunjukkan kondisi fisik paket dengan jujur sebelum meminta tanda tangan/foto." : "Honestly disclose package condition to recipient before requesting handover signature.",
                      language === "id" ? "Jika penerima komplain atau menolak, jangan berdebat dan arahkan klaim garansi resmi via CS." : "If recipient complains or rejects, do not argue; guide them to official CS claim.",
                      language === "id" ? "Laporkan status 'Paket Ditolak/Rusak' ke Admin Hub untuk pencatatan ganti rugi gudang." : "Report 'Rejected/Damaged' to Hub Admin for warehouse compensation logging.",
                    ],
                    aiPrompt: language === "id" ? "Kemasan paket basah terkena hujan di jalan dan penerima menolak terima, bagaimana prosedurnya?" : "Parcel got wet in the rain and recipient refuses delivery, what is the procedure?",
                  },
                }[selectedHandlingTopic as "fragile" | "perishable" | "absent" | "damaged"] || {
                  title: "SOP Penanganan Paket",
                  subtitle: "Panduan umum pengantaran kurir",
                  alert: "Patuhi keselamatan berkendara dan keamanan paket.",
                  steps: [],
                  aiPrompt: "Bagaimana cara penanganan paket yang baik?",
                }

                return (
                  <div className="handling-active-card">
                    <div className="active-card-top">
                      <div>
                        <h3>{topic.title}</h3>
                        <p>{topic.subtitle}</p>
                      </div>
                    </div>

                    <div className="active-card-alert">
                      <Icon name="warning" size={16} />
                      <span>{topic.alert}</span>
                    </div>

                    <div className="active-card-steps">
                      <h4>{language === "id" ? "Langkah-Langkah SOP Lapangan:" : "Field SOP Checklist:"}</h4>
                      <ul>
                        {topic.steps.map((st, i) => (
                          <li key={i}>
                            <span className="step-num">{i + 1}</span>
                            <span>{st}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="active-card-actions">
                      <button
                        type="button"
                        className="active-ai-btn"
                        onClick={() => {
                          triggerHaptic(20)
                          setOverlay("none")
                          sendChatMessage(topic.aiPrompt)
                        }}
                      >
                        <Icon name="message" size={15} />
                        <span>{language === "id" ? "Tanyakan Solusi Khusus ke AI" : "Ask AI for Solution"}</span>
                      </button>

                      <button
                        type="button"
                        className="active-hub-btn"
                        onClick={() => {
                          triggerHaptic(20)
                          const telUrl = "tel:081260194821"
                          window.open(telUrl, "_self")
                        }}
                      >
                        <Icon name="phone" size={15} />
                        <span>{language === "id" ? "Hubungi Koordinator Hub" : "Call Hub Dispatch"}</span>
                      </button>
                    </div>
                  </div>
                )
              })()}
            </div>
          </section>
        </div>
      )}

      {overlay === "media" && (
        <div
          className="overlay sheet-overlay media-overlay"
          role="presentation"
          onMouseDown={() => setOverlay("none")}
        >
          <section
            className="media-sheet"
            role="dialog"
            aria-modal="true"
            aria-label={
              language === "id" ? "Pilihan lampiran" : "Attachment options"
            }
            onMouseDown={(event) => event.stopPropagation()}
          >
            <span className="sheet-handle" />
            <div className="media-sheet-actions">
              <IconButton
                icon="close"
                label="Close"
                onClick={() => setOverlay("none")}
              />
            </div>
            <div className="media-options">
              {[
                [
                  "image",
                  language === "id" ? "Album" : "Album",
                  () => galleryInputRef.current?.click(),
                ],
                [
                  "file",
                  language === "id" ? "File" : "File",
                  () => documentInputRef.current?.click(),
                ],
                [
                  "route",
                  language === "id" ? "Bagikan Lokasi" : "Share Location",
                  () => handleShareLocation(),
                ],
              ].map(([icon, title, action]) => (
                <button
                  type="button"
                  key={title as string}
                  onClick={() => {
                    setOverlay("none")
                    ;(action as () => void)()
                  }}
                >
                  <span>
                    <Icon name={icon as IconName} />
                  </span>
                  <strong>{title as string}</strong>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {overlay === "auth" && (
        <div
          className="overlay sheet-overlay auth-overlay"
          role="presentation"
          onMouseDown={() => setOverlay("none")}
        >
          <section
            className="auth-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <span className="sheet-handle" />
            <div className="auth-brand">
              <BrandMark size={42} />
              <div>
                <strong>Pardalani</strong>
                <span>Dongan Setia Kurir</span>
              </div>
              <IconButton
                icon="close"
                label="Close"
                onClick={() => setOverlay("none")}
              />
            </div>
            {authMode === "otp" ? (
              <form
                className="auth-form otp-form"
                onSubmit={(event) => {
                  event.preventDefault()
                  verifyOtp()
                }}
              >
                <span className="auth-hero-icon">
                  <Icon name="shield" />
                </span>
                <h2 id="auth-title">
                  {language === "id" ? "Verifikasi OTP" : "Verify OTP"}
                </h2>
                <p>
                  {language === "id"
                    ? `Masukkan 6 digit kode yang dikirim ke ${authForm.email || "email kamu"}.`
                    : `Enter the 6-digit code sent to ${authForm.email || "your email"}.`}
                </p>
                <label className="otp-field">
                  <span>{language === "id" ? "Kode OTP" : "OTP code"}</span>
                  <input
                    autoFocus
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    pattern="[0-9]{6}"
                    value={otp}
                    onChange={(event) =>
                      setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="000000"
                    aria-label="Six digit OTP"
                  />
                </label>
                <button type="submit" className="primary-button">
                  {language === "id" ? "Verifikasi kode" : "Verify code"}
                </button>
                <button
                  type="button"
                  className="auth-link"
                  onClick={() =>
                    notify(
                      language === "id"
                        ? "Kode OTP baru sudah dikirim"
                        : "A new OTP has been sent",
                    )
                  }
                >
                  {language === "id"
                    ? "Tidak menerima kode? Kirim ulang"
                    : "Didn't receive it? Send again"}
                </button>
              </form>
            ) : (
              <form
                className="auth-form"
                onSubmit={(event) => {
                  event.preventDefault()
                  submitAuth()
                }}
              >
                <h2 id="auth-title">
                  {authMode === "login"
                    ? language === "id"
                      ? "Selamat datang kembali"
                      : "Welcome back"
                    : authMode === "register"
                      ? language === "id"
                        ? "Buat akun kurir"
                        : "Create courier account"
                      : language === "id"
                        ? "Ganti kata sandi"
                        : "Change password"}
                </h2>
                <p>
                  {authMode === "login"
                    ? language === "id"
                      ? "Masuk untuk melanjutkan perjalananmu."
                      : "Sign in to continue your journey."
                    : authMode === "register"
                      ? language === "id"
                        ? "Daftar lalu verifikasi email dengan OTP."
                        : "Register, then verify your email with an OTP."
                      : language === "id"
                        ? "Kami akan memverifikasi perubahan dengan OTP."
                        : "We'll verify this change with an OTP."}
                </p>
                {authMode === "register" && (
                  <label className="auth-field">
                    <span>{language === "id" ? "Nama lengkap" : "Full name"}</span>
                    <input
                      autoComplete="name"
                      value={authForm.name}
                      onChange={(event) =>
                        setAuthForm({ ...authForm, name: event.target.value })
                      }
                      placeholder="Budi Santoso"
                    />
                  </label>
                )}
                <label className="auth-field">
                  <span>Email</span>
                  <input
                    type="email"
                    autoComplete="email"
                    value={authForm.email}
                    onChange={(event) =>
                      setAuthForm({ ...authForm, email: event.target.value })
                    }
                    placeholder="nama@email.com"
                  />
                </label>
                {authMode === "register" && (
                  <>
                    <label className="auth-field">
                      <span>{language === "id" ? "Nomor telepon" : "Phone number"}</span>
                      <input
                        type="tel"
                        autoComplete="tel"
                        value={authForm.phone}
                        onChange={(event) =>
                          setAuthForm({
                            ...authForm,
                            phone: event.target.value,
                          })
                        }
                        placeholder="+62 812 3456 7890"
                      />
                    </label>
                    <label className="auth-field">
                      <span>{language === "id" ? "ID Kurir" : "Courier ID"}</span>
                      <input
                        value={authForm.courierId}
                        onChange={(event) =>
                          setAuthForm({
                            ...authForm,
                            courierId: event.target.value,
                          })
                        }
                        placeholder="CR-2048"
                      />
                    </label>
                    <label className="auth-field">
                      <span>
                        {language === "id" ? "Area operasi" : "Operating area"}
                      </span>
                      <input
                        value={authForm.area}
                        onChange={(event) =>
                          setAuthForm({
                            ...authForm,
                            area: event.target.value,
                          })
                        }
                        placeholder={
                          language === "id"
                            ? "Contoh: Medan Kota"
                            : "Example: Central Medan"
                        }
                      />
                    </label>
                  </>
                )}
                {authMode !== "forgot" && (
                  <label className="auth-field">
                    <span>
                      {language === "id" ? "Kata sandi" : "Password"}
                    </span>
                    <input
                      type="password"
                      autoComplete={
                        authMode === "login"
                          ? "current-password"
                          : "new-password"
                      }
                      value={authForm.password}
                      onChange={(event) =>
                        setAuthForm({
                          ...authForm,
                          password: event.target.value,
                        })
                      }
                      placeholder="••••••••"
                    />
                  </label>
                )}
                {authMode === "forgot" && (
                  <label className="auth-field">
                    <span>
                      {language === "id"
                        ? "Kata sandi baru"
                        : "New password"}
                    </span>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={authForm.newPassword}
                      onChange={(event) =>
                        setAuthForm({
                          ...authForm,
                          newPassword: event.target.value,
                        })
                      }
                      placeholder={
                        language === "id"
                          ? "Minimal 8 karakter"
                          : "At least 8 characters"
                      }
                    />
                  </label>
                )}
                {authMode === "login" && (
                  <button
                    type="button"
                    className="forgot-link"
                    onClick={() => setAuthMode("forgot")}
                  >
                    {language === "id"
                      ? "Lupa kata sandi?"
                      : "Forgot password?"}
                  </button>
                )}
                <button type="submit" className="primary-button">
                  {authMode === "login"
                    ? language === "id"
                      ? "Masuk"
                      : "Sign in"
                    : authMode === "register"
                      ? language === "id"
                        ? "Daftar"
                        : "Register & send OTP"
                      : language === "id"
                        ? "Kirim kode OTP"
                        : "Send OTP code"}
                </button>
                {authMode === "login" && (
                  <>
                    <div className="auth-divider">
                      <span>{language === "id" ? "atau" : "or"}</span>
                    </div>
                    <button
                      type="button"
                      className="google-button"
                      onClick={handleGoogleAuth}
                    >
                      <GoogleLogoIcon size={20} />
                      <span>
                        {language === "id"
                          ? "Lanjutkan dengan Google"
                          : "Continue with Google"}
                      </span>
                    </button>
                  </>
                )}
                <p className="auth-switch">
                  {authMode === "login"
                    ? language === "id"
                      ? "Belum punya akun?"
                      : "Don't have an account?"
                    : language === "id"
                      ? "Sudah punya akun?"
                      : "Already have an account?"}
                  <button
                    type="button"
                    onClick={() =>
                      setAuthMode(authMode === "login" ? "register" : "login")
                    }
                  >
                    {authMode === "login"
                      ? language === "id"
                        ? "Daftar"
                        : "Register"
                      : language === "id"
                        ? "Masuk"
                        : "Sign in"}
                  </button>
                </p>
              </form>
            )}
          </section>
        </div>
      )}

      {(overlay === "saved" ||
        overlay === "log" ||
        overlay === "print") && (
        <div
          className="overlay sheet-overlay"
          role="presentation"
          onMouseDown={() => setOverlay("none")}
        >
          <section
            className="mini-sheet"
            role="dialog"
            aria-modal="true"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <span className="sheet-handle" />
            <div className="mini-title">
              <span className="quick-icon">
                <Icon
                  name={
                    overlay === "saved"
                      ? "bookmark"
                      : overlay === "log"
                        ? "log"
                        : "printer"
                  }
                />
              </span>
              <div>
                <h2>
                  {overlay === "saved"
                    ? t.saved
                    : overlay === "log"
                      ? t.deliveryLog
                      : t.printLabel}
                </h2>
                <p>
                  {overlay === "print"
                    ? language === "id"
                      ? "Pratinjau label pengiriman"
                      : "Shipping label preview"
                    : language === "id"
                      ? "Ringkasan aktivitas kurir"
                      : "Courier activity summary"}
                </p>
              </div>
              <IconButton
                icon="close"
                label="Close"
                onClick={() => setOverlay("none")}
              />
            </div>
            {overlay === "saved" && (
              <div className="mini-list">
                <button
                  type="button"
                  style={{
                    textAlign: "left",
                    width: "100%",
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    color: "inherit",
                  }}
                  onClick={() => {
                    setOverlay("none")
                    sendChatMessage(
                      language === "id"
                        ? "Muat rute tersimpan MDN-01: Medan Kota Pagi (8 tujuan, 12 paket)."
                        : "Load saved route MDN-01: Medan Kota Pagi (8 stops, 12 packages).",
                    )
                  }}
                >
                  <div>
                    <span>MDN-01</span>
                    <strong>Medan Kota Pagi</strong>
                    <small>
                      {language === "id"
                        ? "8 tujuan · 12 paket"
                        : "8 stops · 12 packages"}
                    </small>
                  </div>
                </button>
                <button
                  type="button"
                  style={{
                    textAlign: "left",
                    width: "100%",
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    color: "inherit",
                  }}
                  onClick={() => {
                    setOverlay("none")
                    sendChatMessage(
                      language === "id"
                        ? "Muat rute tersimpan MDN-04: Petisah Ekspres (5 tujuan, 7 paket)."
                        : "Load saved route MDN-04: Petisah Ekspres (5 stops, 7 packages).",
                    )
                  }}
                >
                  <div>
                    <span>MDN-04</span>
                    <strong>Petisah Ekspres</strong>
                    <small>
                      {language === "id"
                        ? "5 tujuan · 7 paket"
                        : "5 stops · 7 packages"}
                    </small>
                  </div>
                </button>
              </div>
            )}
            {overlay === "log" && (
              <div className="log-stats">
                <div>
                  <strong>18</strong>
                  <span>{language === "id" ? "Selesai" : "Completed"}</span>
                </div>
                <div>
                  <strong>96%</strong>
                  <span>{language === "id" ? "Tepat waktu" : "On time"}</span>
                </div>
                <div>
                  <strong>42 km</strong>
                  <span>{language === "id" ? "Jarak" : "Distance"}</span>
                </div>
              </div>
            )}
            {overlay === "print" && (
              <div className="print-preview">
                <div className="shipping-label">
                  <div className="label-brand">
                    <BrandMark size={34} />
                    <div>
                      <strong>Pardalani</strong>
                      <span>REG · MEDAN KOTA</span>
                    </div>
                    <b>SPX</b>
                  </div>
                  <div className="barcode" aria-label="Barcode SPX 2781 4902">
                    {Array.from({ length: 34 }).map((_, index) => (
                      <span key={index} />
                    ))}
                  </div>
                  <strong className="tracking-code">SPX-2781-4902</strong>
                  <div className="label-route">
                    <div>
                      <span>{language === "id" ? "DARI" : "FROM"}</span>
                      <strong>HUB MEDAN KOTA</strong>
                      <small>
                        MDN-01 · {language === "id" ? "PENYORTIRAN A4" : "SORT A4"}
                      </small>
                    </div>
                    <Icon name="chevron" />
                    <div>
                      <span>{language === "id" ? "KE" : "TO"}</span>
                      <strong>BUDI SANTOSO</strong>
                      <small>Jl. Sei Batang Hari 12</small>
                    </div>
                  </div>
                  <div className="label-footer">
                    <span>COD: {language === "id" ? "TIDAK" : "NO"}</span>
                    <span>1 / 1</span>
                    <span>0.8 KG</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="primary-button print-button"
                  onClick={() => window.print()}
                >
                  <Icon name="printer" />
                  {language === "id" ? "Cetak sekarang" : "Print now"}
                </button>
              </div>
            )}
          </section>
        </div>
      )}

      <div
        className={`toast ${toast ? "show" : ""}`}
        role="status"
        aria-live="polite"
      >
        <Icon name="check" />
        <span>{toast}</span>
      </div>
    </main>
  )
}

export default App
