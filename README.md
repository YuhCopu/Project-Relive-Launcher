# Project Relive Launcher

Project Relive Launcher is a Windows-focused Tauri 2 + React 19 + TypeScript + Vite desktop launcher for managing Relive game builds, authentication, downloads, verification, launching, rewards, leaderboards, tournaments, settings, and updates.

## Highlights

- Tauri 2 desktop launcher with Windows-native build/process operations
- Project Relive deep link scheme: `projectrelive://`
- Build import, version detection, required-file downloads, verification, and game launch flow
- Persistent floating icon-first navigation: Left, Bottom, or Top
- Navigation size, opacity, blur, spacing, tooltips, and optional auto-hide
- 23 built-in visual themes plus a live custom theme editor
- Theme search/categories and JSON import/export
- Zustand-backed persistent launcher settings
- Glassmorphism UI, Framer Motion transitions, accessible labels and focus states
- Configurable API/auth/download/updater/donation/GitHub URLs through Vite environment variables

## Installation

Build the Tauri application on Windows with the required Node.js, Rust, and Tauri tooling installed. Configure the environment variables first, then run the development or production build commands below.

## Development

```bash
npm install
npm run dev
```

Run the Tauri desktop app with:

```bash
npm run tauri dev
```

## Production build

```bash
npm run build
npm run tauri build
```

The repository intentionally does not include `node_modules`, `dist`, Rust `target`, local `.env` files, or release signing secrets.

## Configuration

Copy `.env.example` to a local `.env` file and fill in only the endpoints/services that actually exist. Blank URLs keep the corresponding integrations inactive; the launcher does not assume undocumented backend routes.

Important variables include:

- `VITE_API_BASE_URL` — launcher/API service base
- `VITE_AUTH_URL` — authentication page/service
- `VITE_PUBLIC_API_URL` — public status API
- `VITE_DOWNLOAD_BASE_URL` — game/build asset host
- `VITE_UPDATER_URL` — launcher updater service
- `VITE_DONATION_URL` — donation destination
- `VITE_GITHUB_URL` — project/repository link
- `VITE_DEEP_LINK_SCHEME` — deep-link scheme; production default is `projectrelive`

Updater signing keys must never be committed. The updater plugin is configured with an empty public key and no endpoints until real release signing infrastructure is supplied.

## Navigation customization

Open Settings → Navigation to choose:

- Left Floating
- Bottom Floating
- Top Floating

You can also tune size, opacity, blur, spacing, tooltips, and auto-hide. Settings persist across launcher restarts using the existing Project Relive storage namespace.

## Theme system

Settings → Themes contains the built-in Project Relive, Void, Midnight, Ocean, Arctic, Aurora, Neon, Cyber, Ember, Inferno, Rose, Sakura, Amethyst, Royal, Emerald, Jade, Forest, Toxic, Gold, Sunset, Blood Moon, Galaxy, Synthwave, and Monochrome presets.

Custom themes support background/gradient colors, accent, angle, live preview, reset, and JSON import/export. Imported themes are validated before application.

## Contributing

Keep changes focused, preserve existing launcher functionality, and never commit credentials, tokens, private keys, local configuration, or generated build directories. Review `git status` and `git diff` before committing.
