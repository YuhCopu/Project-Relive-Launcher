# Project Relive Launcher

A Windows-first Tauri 2 + React 19 launcher for Project Relive.

## Development

```bash
npm install
npm run dev
npm run build
npm run tauri -- dev
npm run tauri -- build
```

Copy `.env.example` to `.env` and provide Project Relive service endpoints when they are available.

### Service configuration

The launcher deliberately does **not** point at the reference launcher's infrastructure. Configure:

- `VITE_API_BASE_URL` — routing/API base
- `VITE_AUTH_URL` — authentication entry point
- `VITE_PUBLIC_API_URL` — public/news endpoints
- `VITE_DOWNLOAD_BASE_URL` — authorized game file/CDN base
- `VITE_UPDATER_URL` — updater endpoint used by the launcher integration
- `VITE_DONATION_URL` — optional support page
- `VITE_GITHUB_URL` — optional Project Relive repository/service
- `VITE_LAUNCHER_REPOSITORY` — optional repository URL
- `VITE_GAME_CLIENT_ID` — optional Project Relive game service client id

When service configuration is empty, the UI remains usable in local development mode and uses a clearly-marked local demo account. It does not pretend that production services succeeded.

## Identity

- Product name: **Project Relive**
- Deep-link scheme: `projectrelive://`
- Storage namespace: `project-relive:*`
- Bundle identifier: `com.projectrelive.launcher`
- Primary logo: `public/ReliveLogo.png`

The launcher retains the reference architecture for build importing, version scanning, file verification/downloads, native process launching, settings, themes, leaderboards, tournaments, rewards, authentication callbacks, and updater integration while keeping Project Relive service infrastructure configurable.
