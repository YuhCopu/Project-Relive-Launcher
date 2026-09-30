# Project Relive rebrand audit

## Identity

- Product: Project Relive
- Package: `project-relive`
- Tauri identifier: `com.projectrelive.launcher`
- Deep link: `projectrelive://`
- Local storage namespace: `project-relive:*`
- Primary logo: `public/ReliveLogo.png`
- Square application icon: `src-tauri/icons/icon.png`
- Windows icon: `src-tauri/icons/icon.ico`
- macOS icon: `src-tauri/icons/icon.icns`

## Service isolation

The reference launcher's service URLs were removed from the application. Production services are configured through `.env` using `.env.example` as the template.

The following remain configurable:

- API/routing
- authentication
- public/news API
- game file downloads
- updater
- donations
- repository
- game service client id
- cosmetics metadata

The launcher uses local development/demo behavior when service configuration is absent. It does not report a production API/download/update operation as successful when it is unavailable.

## Native security

- File downloads require HTTPS URLs.
- Download/delete destinations must be absolute paths with filenames.
- Game launch paths must be absolute.
- The frontend only invokes the explicit Tauri commands required by build/download management.
- The broad process kill target for the external Epic launcher was removed.
- Old embedded launcher token values were removed from Rust. Installation-specific values can be supplied through host environment variables when required by an authorized Project Relive service:
  - `RELIVE_FL_TOKEN`
  - `RELIVE_CALDERA_TOKEN`

## Branding audit

Repository text, source, configuration, filenames, and lockfiles were searched for the old launcher name and scheme. No old-brand occurrences remain in the delivered project.

## UI customization

- Navigation is a persisted Zustand store with Left/Bottom/Top floating modes, sizing, opacity, blur, spacing, tooltips, and optional auto-hide.
- Theme presets include 23 built-in identities plus live custom editing and JSON import/export.
- Page layout spacing is centralized in `LauncherLayout` rather than hardcoded per page.

## Build note

The project contains the normal npm and Tauri build scripts. Dependency installation could not be completed in the packaging environment because `npm install` exceeded the available execution window, so a clean `npm run build`/Tauri compilation could not be independently executed here.
