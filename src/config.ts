export const RELIVE_CONFIG = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, ""),
  authUrl: (import.meta.env.VITE_AUTH_URL ?? "").replace(/\/$/, ""),
  publicApiUrl: (import.meta.env.VITE_PUBLIC_API_URL ?? "").replace(/\/$/, ""),
  downloadBaseUrl: (import.meta.env.VITE_DOWNLOAD_BASE_URL ?? "").replace(/\/$/, ""),
  updaterUrl: (import.meta.env.VITE_UPDATER_URL ?? "").replace(/\/$/, ""),
  donationUrl: (import.meta.env.VITE_DONATION_URL ?? "").replace(/\/$/, ""),
  githubUrl: (import.meta.env.VITE_GITHUB_URL ?? "").replace(/\/$/, ""),
  launcherRepository: (import.meta.env.VITE_LAUNCHER_REPOSITORY ?? "").replace(/\/$/, ""),
  gameClientId: import.meta.env.VITE_GAME_CLIENT_ID ?? "",
  cosmeticsApiBaseUrl: (import.meta.env.VITE_COSMETICS_API_BASE_URL ?? "").replace(/\/$/, ""),
} as const;

export const joinUrl = (base: string, path: string) =>
  `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;

export type ReliveRequiredFile = {
  url: string;
  fileName: string;
  dir?: string;
};

export const getRequiredFiles = (): ReliveRequiredFile[] => {
  const base = RELIVE_CONFIG.downloadBaseUrl;
  if (!base) return [];

  return [
    { url: joinUrl(base, "Paks/pakchunkRelive-WindowsClient.pak"), fileName: "pakchunkRelive-WindowsClient.pak", dir: "FortniteGame\\Content\\Paks" },
    { url: joinUrl(base, "Paks/pakchunkRelive-WindowsClient.sig"), fileName: "pakchunkRelive-WindowsClient.sig", dir: "FortniteGame\\Content\\Paks" },
    { url: joinUrl(base, "Paks/pakchunkRelive_s1-WindowsClient.pak"), fileName: "pakchunkRelive_s1-WindowsClient.pak", dir: "FortniteGame\\Content\\Paks" },
    { url: joinUrl(base, "Paks/pakchunkRelive_s1-WindowsClient.sig"), fileName: "pakchunkRelive_s1-WindowsClient.sig", dir: "FortniteGame\\Content\\Paks" },
    { url: joinUrl(base, "Arc/Arc.exe"), fileName: "Arc.exe", dir: "Arc" },
    { url: joinUrl(base, "Arc/Config.json"), fileName: "Config.json", dir: "Arc" },
    { url: joinUrl(base, "Arc/Splash.png"), fileName: "Splash.png", dir: "Arc\\Splash" },
  ];
};
