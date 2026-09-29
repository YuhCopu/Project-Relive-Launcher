import { Relive } from "@/relive";
import { RELIVE_CONFIG, getRequiredFiles } from "@/config";
import { useAuthStore } from "@/zustand/AuthStore";
import BuildStore, { IBuild } from "@/zustand/BuildStore";
import { useRoutingStore } from "@/zustand/RoutingStore";
import { useToastStore } from "@/zustand/ToastStore";
import { window } from "@tauri-apps/api";
import { invoke } from "@tauri-apps/api/core";
import { join } from "@tauri-apps/api/path";
import { sendNotification } from "@tauri-apps/plugin-notification";

const checkFiles = async (buildPath: string): Promise<boolean> => {
  try {
    const files = getRequiredFiles();
    if (files.length === 0) return true;

    for (const file of files) {
      const directory = await join(
        buildPath,
        file.dir || "FortniteGame\\Content\\Paks",
      );
      const filePath = await join(directory, file.fileName);

      let expectedSize = 0;
      try {
        expectedSize = (await invoke("get_file_size", {
          url: file.url,
        })) as number;
      } catch (e) {
        console.error("error getting file size for", file.url, e);
        expectedSize = 0;
      }

      try {
        console.log("checking file:", filePath, "size:", expectedSize);
        const exists = (await invoke("check_file_exists_and_size", {
          path: filePath,
          size: expectedSize > 0 ? expectedSize : null,
        })) as boolean;

        if (!exists) {
          return false;
        }
      } catch (e) {
        return false;
      }
    }

    return true;
  } catch (e) {
    return false;
  }
};

let isLaunching = false; // ts so scuff

export const handlePlay = async (
  selectedPath: string,
  onShowDownloader?: (buildPath: string) => void,
) => {
  await invoke("exit_all", {});
  setTimeout(async () => {
    const authState = useAuthStore.getState();
    const buildstate = BuildStore.getState();
    const { addToast } = useToastStore.getState();

    if (isLaunching) return false;

    isLaunching = true;

    const path = selectedPath.replace("/", "\\");
    const access_token = authState.jwt;

    if (!access_token) {
      addToast("You are not authenticated!", "error");
      isLaunching = false;
      return false;
    }

    const hasRequiredFiles = await checkFiles(selectedPath);
    if (!hasRequiredFiles) {
      if (onShowDownloader) {
        onShowDownloader(selectedPath);
        isLaunching = false;
        return false;
      }
      addToast("Missing required files. Please wait...", "error");
      isLaunching = false;
      return false;
    }

    const exe = await join(
      selectedPath,
      "FortniteGame",
      "Binaries",
      "Win64",
      "FortniteClient-Win64-Shipping.exe",
    );

    const exists = (await invoke("check_file_exists", { path: exe }).catch(
      () => false,
    )) as boolean;
    if (!exists) {
      addToast("Build does not exist / is corrupted!", "error");
      isLaunching = false;
      return false;
    }

    const build: IBuild | undefined = buildstate.builds.get(selectedPath);
    if (!build) {
      addToast(`Build with path ${selectedPath} not found!`, "error");
      isLaunching = false;
      return false;
    }

    try {
      BuildStore.setState((state) => {
        const builds = new Map(state.builds);
        const b = builds.get(selectedPath);
        if (b) {
          builds.set(selectedPath, { ...b, loading: true, open: false });
        }
        return { builds };
      });

      const Routing = useRoutingStore.getState();
      const r = Routing.Routes.get("oauth");
      const a = Routing.Routes.get("account");
      let result = false;
      let exchangeCode = "";
      let identity = "";

      if (r?.url) {
        const res = await Relive.Requests.get<{ code: string }>(
          `${r.url.replace(/\/$/, "")}/exchange`,
          { Authorization: `bearer ${access_token}` },
        );

        if (!res.ok) {
          addToast("Project Relive authentication failed.", "error");
          isLaunching = false;
          return false;
        }

        result = true;
        exchangeCode = res.data.code;

        if (a?.url) {
          const session = await Relive.Requests.get<{ auth: { token: string } }>(
            `${a.url.replace(/\/$/, "")}/session`,
            {
              Authorization: `bearer ${access_token}`,
              "Content-Type": "application/json",
              ...(RELIVE_CONFIG.gameClientId
                ? { "X-Relive-Client": RELIVE_CONFIG.gameClientId }
                : {}),
            },
          ).catch(() => null);

          identity = session?.ok ? session.data.auth.token : "";
        }
      } else if (!RELIVE_CONFIG.apiBaseUrl) {
        // Local mode keeps the native launcher path testable without a backend.
        result = true;
      } else {
        addToast("Project Relive services are not configured.", "error");
        isLaunching = false;
        return false;
      }

      BuildStore.setState((state) => {
        const builds = new Map(state.builds);
        const b = builds.get(selectedPath);
        if (b) {
          builds.set(selectedPath, { ...b, loading: false, open: true });
        }
        return { builds };
      });

      let extraArgs: string[] = [];
      const preEdits = Relive.Storage.get<boolean>("game.disablePreEdits");
      const resetOnRelease = Relive.Storage.get<boolean>("game.resetOnRelease");
      const preferredItems = Relive.Storage.get<string>("game.preferredItemsCmd") || [];
      if (preEdits) extraArgs.push("-dpe");
      if (resetOnRelease) extraArgs.push("-ror");
      if (preferredItems.length > 0) extraArgs.push(`-preferreditems=${preferredItems}`);

      await invoke("launch", {
        code: exchangeCode,
        path,
        extraArgs,
        identity,
      });

      window.getCurrentWindow().minimize();

      console.log(`launching ${build.version}...`);
      sendNotification({
        title: `Starting ${build.version}`,
        body: `This may take a while so please wait while the game loads!`,
        sound: "Default",
      });

      isLaunching = false;

      return result;
    } catch (error) {
      console.error(`err launching ${build.version}:`, error);
      addToast(`Failed to launch ${build.version}! (DEV: ${error})`, "error");
      isLaunching = false;

      BuildStore.setState((state) => {
        const builds = new Map(state.builds);
        const b = builds.get(selectedPath);
        if (b) {
          builds.set(selectedPath, { ...b, loading: false, open: false });
        }
        return { builds };
      });

      return false;
    }
  }, 2550);
};
