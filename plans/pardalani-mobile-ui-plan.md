# PARDALANI Mobile UI/UX and Brand Plan

## 1. Goal and Deliverable

Build a polished, interactive, mobile-first React prototype for **PARDALANI — “Dongan Setia Kurir”**, optimized for courier drivers using a phone outdoors and often one-handed.

The prototype will be frontend-only and self-contained. It will demonstrate the complete product experience with local React state and seeded data; it will not call a live AI, navigation, camera, microphone, WhatsApp, or storage backend. Native-dependent actions will have convincing simulated behavior and clear feedback.

Primary language is **Bahasa Indonesia**. The ID/EN preference switches all major navigation, controls, settings labels, greetings, quick actions, seeded chat content, and status messages.

## 2. Experience Principles

- **Glanceable while moving:** large type where decisions happen, short labels, obvious hierarchy, high contrast, and minimum 44×44 interactive targets.
- **One-hand first:** key actions and composer remain at the bottom; drawer and modal controls are reachable; no important action depends on hover.
- **Calm intelligence:** the AI feels like a reliable co-driver, not a generic chatbot. Route summaries emphasize the next action, distance, package count, and delivery status.
- **Outdoor readable:** strong light-mode contrast, restrained shadows, minimal low-contrast gray text, and clear focus/pressed states.
- **Cohesive branding:** one geometric visual vocabulary shared by logo, icons, route illustrations, chips, and controls.
- **No emojis:** all symbolic communication uses purpose-built monochrome SVG line icons.

## 3. Brand Direction

### Logo concept: “Pardalani Path Companion”

Create an original SVG mark by interlocking three forms rather than placing generic courier symbols side by side:

1. A forward-leaning **P** silhouette for PARDALANI.
2. Its counter-space forms a continuous **route bend** ending in a directional point.
3. A small, integrated lower notch suggests a parcel corner/hand-off without becoming a generic box icon.

The asymmetric forward lean communicates motion; the uninterrupted route-shaped negative space communicates smart navigation and companionship. The mark must remain recognizable at favicon scale and should not rely on internal micro-detail.

Provide these in the UI:

- Primary lockup: logo mark + PARDALANI wordmark + tagline.
- Compact app-bar lockup: mark + wordmark, with tagline as a small supporting line.
- App-icon treatment: mark centered on a rounded brand tile.
- Monochrome variants that work on both light and dark surfaces.
- Replace/update `public/favicon.svg` with the compact mark.

### Palette

Define semantic CSS theme variables and Tailwind-compatible utilities rather than scattering raw colors:

- **Primary:** deep indigo/ink for trust, night driving, and strong outdoor contrast.
- **Accent:** high-visibility chartreuse/lime used selectively for active routes, primary send/action states, and progress.
- **Light surfaces:** warm off-white with white raised panels.
- **Dark surfaces:** near-black navy with slightly lifted blue-gray panels.
- **Semantic states:** green success, amber warning, red destructive, and blue informational, each with readable foreground pairings in both themes.

The visual signature is dark indigo plus safety-lime—not a gradient-heavy “AI” aesthetic. Decorative effects stay restrained so the interface remains practical.

### Typography

Use a public Google font via CSS import, with imports kept at the top of `src/index.css`:

- **Plus Jakarta Sans** for UI and display text: modern, friendly, highly legible, and strong in Indonesian copy.
- Use weight, size, and spacing for hierarchy; avoid excessive all-caps.
- Use tabular numerals for times, distances, token values, and route sequence numbers.

## 4. Local Design System

Because the repository has no existing component package or token set, create a small local system inside the app rather than introducing a third-party UI library.

### Tokens in `src/index.css`

Define light and dark semantic variables for:

- background, surface, raised surface, muted surface
- primary and primary foreground
- accent and accent foreground
- text, secondary text, muted text
- border, focus ring, success, warning, danger
- shadows, safe-area insets, and motion timing

Set global font, background, selection color, focus-visible treatment, reduced-motion behavior, mobile tap behavior, and scrollbar styling. Dark mode is activated by a class/data attribute on the root app container, independent of OS preference but initialized from the prototype default.

### Reusable UI primitives in `src/App.tsx`

Keep implementation compact in the existing file, but extract internal React components for maintainability:

- `BrandMark` / `BrandLockup`
- `Icon` with a strict union of icon names and hand-authored SVG paths
- `IconButton`, `Button`, `Chip`, `Toggle`, `Field`, `SliderField`
- `AppHeader`, `QuickActions`, `ChatThread`, `Composer`
- `NavigationDrawer`, `HistoryRow`
- `SettingsSheet` with section navigation
- `Toast` / transient feedback region

All controls receive accessible names and visible keyboard focus. Custom controls use semantic native elements internally where appropriate and expose correct ARIA state.

## 5. Custom Monochrome Icon System

Create a unified inline SVG icon set—no emoji, icon font, external icon library, or mixed styles.

Icon rules:

- 24×24 view box, rounded line caps and joins, approximately 1.8–2 stroke weight.
- `currentColor` only, so every icon works in either theme and semantic state.
- Consistent optical size and simple geometry that survives outdoor viewing.
- Filled shapes only for active-state micro accents where necessary; default style is monochrome outline.

Required icons include:

- menu, search, close, chevron, more
- route optimization, map pin, navigation arrow, saved route
- WhatsApp-style conversation/phone mark drawn in the same line vocabulary (not copied brand artwork)
- scan corners/barcode, camera, microphone, send
- package, handling/fragile, delivery log, history
- pin/pinned, rename/edit, trash
- user/profile, shield/security, moon/sun, language
- sliders/AI controls, link/backend, help, developer contact
- copy, regenerate, external/open, check/success, warning

## 6. Main Chat / Home Screen

### Mobile frame and background

- Full-height app shell using dynamic viewport units and safe-area padding.
- On wide preview canvases, center the app in a phone-width column with a subtle surrounding backdrop; the app itself remains fluid at small widths.
- Header and composer remain sticky while the chat region scrolls independently.

### Header

- Left menu control opens the history drawer.
- Center/left compact logo lockup displays **PARDALANI** and **Dongan Setia Kurir**.
- Right profile/status control opens Settings and includes a subtle online indicator.

### Welcome module

- Greeting: “Horas, Budi.” with a practical prompt such as “Mau antar paket lebih cepat hari ini?”
- Compact daily status row: number of stops, packages, and estimated route duration.
- Avoid a large marketing hero; preserve vertical room for driver tasks.

### Quick actions

A horizontally scrollable, snap-friendly row of four tactile chips/cards:

1. **Optimalkan Rute**
2. **Buat Draft WhatsApp**
3. **Scan Label / Resi**
4. **Info Penanganan Paket**

Selecting one inserts a relevant structured user prompt and simulated assistant response, demonstrating each workflow. The active choice receives a clear accent state.

### Rich chat thread

Seed a realistic conversation showing the required content formats:

- User asks to optimize several delivery stops.
- Assistant responds with a concise Markdown-style heading and summary.
- Bullet list calls out priority and fragile-package notes.
- A horizontally safe route-step table shows sequence, destination, ETA, and package/resi status. On narrow screens it becomes a stack of compact rows rather than forcing page-level horizontal scrolling.
- A highlighted next-stop card uses the route icon and a primary “Mulai Navigasi” action.
- Inline response actions: **Buka di WA**, **Salin**, and **Buat Ulang**.

Interactions:

- Copy writes representative response text through the Clipboard API when available and always shows a success toast; gracefully fallback without breaking.
- Regenerate temporarily changes the response to a loading/skeleton state, then swaps in an alternate seeded wording.
- Open in WA uses a safe demo behavior: construct a `wa.me` URL from seeded draft text and expose/open it only after the user taps; no automatic navigation.
- Route action displays a local confirmation sheet/toast rather than pretending live GPS has started.
- Assistant typing indicator uses subtle reduced-motion-aware dots/lines, never emoji.

### Composer

- Anchored above the safe area with a rounded, high-contrast input surface.
- Camera/scan and microphone icon controls on the left; send control on the right.
- Input can expand to a small capped number of lines without displacing core controls.
- Pressing Enter sends; Shift+Enter adds a new line.
- Camera and microphone actions show simulated permission/action feedback.
- Send appends the user message and a delayed seeded assistant reply.

## 7. Navigation Drawer / History

Open as a left-side modal drawer covering most—but not all—of the mobile viewport, with a dimmed dismissible backdrop and close control.

### Profile header

- Avatar built from initials, courier name “Budi Santoso,” courier role/area, and an online status.
- Compact PARDALANI branding remains visible.

### Search

- Search input filters seeded history by title and preview text in real time.
- Include an intentional empty state with a search icon and reset action.

### History list

Seed grouped sessions such as Today / Yesterday / Earlier. Each row displays title, short preview, and time.

- Tap loads/selects the session and closes the drawer.
- Overflow menu exposes **Pin**, **Rename**, and **Delete**.
- Pin moves the session into a pinned group/state.
- Rename is inline or uses a compact confirmation dialog with validation for empty names.
- Delete requires explicit confirmation and uses danger styling; deleting the active session returns to the seeded home conversation.
- Changes persist for the browser session in React state; no storage promise is made.

### Quick links

Bottom navigation links:

- Saved Routes
- Delivery Log
- Help Center
- Settings

Saved Routes and Delivery Log open concise in-app informational sheets populated with representative data; Help Center and Settings open the corresponding Settings section. This keeps all mandatory links meaningfully interactive without expanding into unrelated full products.

## 8. Profile & Settings Modal

Use a bottom sheet on narrow devices and a centered dialog on wider previews. It has a sticky title bar, close control, scrollable content, and a section tab/segmented control.

### Profile summary

- Initials avatar, courier name, ID, operating city/area, and account status.

### Account & Security

- Read-only email/phone summary with verified indicators.
- “Kelola Keamanan” action opens a local explanatory panel for password/session management.
- Do not display or collect real credentials.

### Preferences

- Light/Dark theme toggle applies immediately across the complete interface.
- ID/EN segmented language toggle applies immediately to major UI and seeded visible content.
- Toggles show text labels in addition to icons; meaning never depends on color alone.

### AI Parameters Editor

- Backend URL text field with a safe placeholder/demo value and URL-format validation.
- Temperature slider with live numeric value and a sensible 0–2 range.
- Max Tokens numeric field with bounded validation.
- System Prompt multiline field seeded with a courier-assistant prompt.
- Save validates fields, updates local settings state, closes or confirms with a toast.
- Reset restores documented prototype defaults after confirmation.
- Include a concise warning that settings are local prototype data and no request is sent.

### Help Center

- FAQ rows for scanning labels, route optimization, and WhatsApp drafts.
- Developer contact card with email/copy action rather than exposing secrets.
- Include app version/prototype label.

## 9. State and Data Flow

Manage state in `App.tsx` with React hooks; no additional dependency is required.

Core state:

- active overlay: none, drawer, settings, saved routes, delivery log, confirmation
- settings section and theme
- language
- composer value, messages, typing/regeneration state
- history sessions, active session, search query, active history menu, rename/delete target
- AI parameter draft, validation errors, and saved values
- toast message and timeout

Use typed local models for `Message`, `HistorySession`, `RouteStep`, `Settings`, and translation keys. Keep seeded fixtures separate from rendering logic within the file. A lightweight translation dictionary provides ID and EN strings for all major UI; do not duplicate entire component trees by language.

Overlay behavior:

- Escape closes the topmost overlay.
- Opening a modal/drawer prevents background scrolling.
- Focus moves into overlays and returns to the triggering control on close where practical.
- Backdrop clicks dismiss non-destructive overlays but never silently confirm destructive actions.

## 10. Files to Change

### `src/App.tsx`

Replace the blank component with the complete typed interactive prototype, local component primitives, custom SVG logo/icons, seeded bilingual data, modal/drawer states, and simulated actions.

### `src/index.css`

Add the Google font import after the Tailwind import ordering requirements are respected, semantic light/dark theme variables, global mobile layout rules, safe-area and viewport handling, focused custom range/input styling, reduced-motion handling, and small component animations that are awkward to express as utilities.

### `public/favicon.svg`

Replace the scaffold favicon with the PARDALANI compact logo mark and a high-contrast background suitable for browser-tab scale.

No new runtime dependency is planned.

## 11. Responsive and Accessibility Requirements

- Optimize the primary composition around common phone widths from approximately 360–430 CSS pixels, while remaining usable down to 320 and presentable on desktop preview.
- Respect top and bottom safe areas.
- Ensure all text and essential iconography meet WCAG AA contrast in both themes; target stronger contrast for critical driving information.
- Minimum 44×44 pointer targets for controls.
- Visible `:focus-visible` state; logical tab order; labels for icon-only buttons.
- Semantic dialog/drawer roles, titles, descriptions, and `aria-modal` where applicable.
- Inputs have associated visible labels and inline validation messages.
- Status/toast feedback uses an `aria-live` region.
- Do not use color as the sole status indicator.
- Respect `prefers-reduced-motion`; animations become near-instant or static.
- Avoid tiny scrolling regions, hover-only menus, and page-level horizontal overflow.

## 12. Verification Strategy

After implementation:

1. Run the repository-prescribed production check: `pnpm build`.
2. Run `pnpm format` only if needed, inspect its changes, then rerun `pnpm build`.
3. Search the edited source for emoji characters and external icon-library imports; confirm the interface uses only the custom SVG icon system.
4. Check core interactions in both languages and both themes:
   - open/close drawer and settings
   - filter, pin, rename, and delete history
   - activate all four quick actions
   - send a message and regenerate/copy/open actions
   - edit, validate, reset, and save AI parameters
   - open Help Center, Saved Routes, and Delivery Log
5. Check representative narrow and wide layouts for clipping, page-level horizontal overflow, safe-area spacing, sticky composer/header behavior, and readable route rows.
6. Confirm keyboard focus visibility, Escape dismissal, dialog labels, input labels, live feedback, and reduced-motion styling.
7. Inspect the logo at app-bar, app-icon, and favicon sizes; verify the silhouette and route-shaped negative space remain legible in light, dark, and monochrome contexts.

## 13. Explicit Non-Goals for This Prototype

- No real AI/backend requests, authentication, GPS/navigation, camera scanning, voice transcription, WhatsApp API integration, or persistent database.
- No separate desktop product; desktop only frames the mobile experience cleanly.
- No third-party component or icon library.
- No standard emoji anywhere in interface copy or controls.
