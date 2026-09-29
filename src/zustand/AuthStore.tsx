import { Relive } from "@/relive";
import { create } from "zustand";
import { useRoutingStore } from "./RoutingStore";
import { IMCPProfile } from "@/relive/interfaces/IMCPProfile";
import { IAccount } from "@/relive/interfaces/IAccount";
import { RELIVE_CONFIG } from "@/config";

type AuthStore = {
  jwt: string | null;
  base: string | null;
  account: IAccount | null;
  athena: IMCPProfile | null;
  login: (token: string) => Promise<boolean>;
  logout: () => void;
  init: () => Promise<boolean>;
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  jwt: Relive.Storage.get<string>("auth.jwt") ?? null,
  base: Relive.Storage.get<string>("auth.base") ?? null,
  account: Relive.Storage.get<IAccount>("auth.account") ?? null,
  athena: Relive.Storage.get<IMCPProfile>("auth.athena") ?? null,
  init: async () => {
    const Routing = useRoutingStore.getState();
    const r = Routing.Routes.get("account");
    Relive.Storage.set("auth.base", r ? r.url : RELIVE_CONFIG.apiBaseUrl || null);
    set({ base: r ? r.url : RELIVE_CONFIG.apiBaseUrl || null });

    // Local development mode intentionally uses a clearly-marked demo identity.
    if (!RELIVE_CONFIG.apiBaseUrl && !get().account) {
      return false;
    }

    return get().account != null;
  },
  login: async (token: string) => {
    if (!RELIVE_CONFIG.authUrl && !RELIVE_CONFIG.apiBaseUrl) {
      const demoAccount: IAccount = {
        Created: new Date().toISOString(),
        AccountID: "development-account",
        Email: "development@projectrelive.local",
        Password: "",
        DisplayName: "Relive Player",
        DiscordID: "",
        IsBanned: false,
        Roles: ["developer"],
        Rewards: [],
        ProfilePicture: "/ReliveLogo.png",
        DisplayNameChanges: 0,
      };
      Relive.Storage.set("auth.jwt", "development-session");
      Relive.Storage.set("auth.account", demoAccount);
      set({ jwt: "development-session", account: demoAccount, base: null, athena: null });
      return true;
    }

    Relive.Storage.set("auth.jwt", token);
    set({ jwt: token });

    await Relive.Requests.get<{
      account: IAccount;
      athena: IMCPProfile;
    }>(get().base ?? "", {
      Authorization: `bearer ${token}`,
    }).then((res) => {
      if (res.ok) {
        Relive.Storage.set("auth.account", res.data.account);
        Relive.Storage.set("auth.athena", res.data.athena);
        set({
          account: res.data.account,
          athena: res.data.athena,
        });
      } else {
        set({ jwt: null });
        set({ account: null });
        console.log(res.data);
      }
    });

    if (get().account != null) {
      return true;
    }

    return false;
  },
  logout: () => {
    Relive.Storage.remove("auth.jwt");
    Relive.Storage.remove("auth.account");
    Relive.Storage.remove("auth.athena");

    set({
      jwt: null,
      account: null,
      athena: null,
    });
  },
}));
