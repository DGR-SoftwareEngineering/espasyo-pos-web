import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { SystemSettingDto } from "../../api/commons/types";
import {
  OPERATIONAL_STATUSES,
  OperationalStatus,
  PAGE_KEYS,
  SETTING_KEYS,
  parseSettingValue,
} from "../../business/settings";
import { useApiCallback } from "../hooks";

export interface PublicTheme {
  primaryColor: string | null;
  secondaryColor: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
}

export interface MaintenanceState {
  enabled: boolean;
  message: string;
  pages: string[];
}

export interface PublicFeatureFlags {
  loyaltyEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface PublicInventoryFlags {
  lowStockAlertEnabled: boolean;
}

export interface PublicSecurityPolicy {
  sessionTimeoutMinutes: number;
  passwordMinLength: number;
  maxLoginAttempts: number;
}

export interface PublicSettingsValue {
  loading: boolean;
  ready: boolean;
  systemName: string;
  theme: PublicTheme;
  maintenance: MaintenanceState;
  operationalStatus: OperationalStatus;
  features: PublicFeatureFlags;
  inventory: PublicInventoryFlags;
  security: PublicSecurityPolicy;
  settingsMap: Map<string, SystemSettingDto>;
  refresh: () => Promise<void>;
}

const DEFAULTS: Omit<
  PublicSettingsValue,
  "refresh" | "settingsMap" | "loading" | "ready"
> = {
  systemName: "Espasyo Coffee House",
  theme: {
    primaryColor: null,
    secondaryColor: null,
    logoUrl: null,
    faviconUrl: null,
  },
  maintenance: { enabled: false, message: "", pages: [] },
  operationalStatus: OPERATIONAL_STATUSES.Operational,
  features: { loyaltyEnabled: false, notificationsEnabled: false },
  inventory: { lowStockAlertEnabled: true },
  security: {
    sessionTimeoutMinutes: 30,
    passwordMinLength: 6,
    maxLoginAttempts: 5,
  },
};

const Context = createContext<PublicSettingsValue | undefined>(undefined);

export const usePublicSettings = (): PublicSettingsValue => {
  const ctx = useContext(Context);
  if (!ctx)
    return {
      ...DEFAULTS,
      loading: false,
      ready: false,
      settingsMap: new Map(),
      refresh: async () => {},
    };
  return ctx;
};

export const useIsPageInMaintenance = (pageKey: string): boolean => {
  const { maintenance } = usePublicSettings();
  return maintenance.pages.includes(pageKey);
};

const buildState = (settings: SystemSettingDto[]) => {
  const map = new Map(settings.map((s) => [s.key, s]));
  const get = <T,>(key: string, fallback: T): T => {
    const s = map.get(key);
    if (!s) return fallback;
    try {
      return parseSettingValue<T>(s);
    } catch {
      return fallback;
    }
  };
  const status = get<string>(
    SETTING_KEYS.SystemOperationalStatus,
    OPERATIONAL_STATUSES.Operational,
  );
  const operationalStatus = (Object.values(OPERATIONAL_STATUSES) as string[]).includes(
    status,
  )
    ? (status as OperationalStatus)
    : OPERATIONAL_STATUSES.Operational;

  return {
    settingsMap: map,
    systemName: get<string>(SETTING_KEYS.SystemName, DEFAULTS.systemName),
    theme: {
      primaryColor: get<string>(SETTING_KEYS.ThemePrimaryColor, "") || null,
      secondaryColor: get<string>(SETTING_KEYS.ThemeSecondaryColor, "") || null,
      logoUrl: get<string>(SETTING_KEYS.ThemeLogoUrl, "") || null,
      faviconUrl: get<string>(SETTING_KEYS.ThemeFaviconUrl, "") || null,
    },
    maintenance: {
      enabled: get<boolean>(SETTING_KEYS.SystemMaintenanceMode, false),
      message: get<string>(SETTING_KEYS.SystemMaintenanceMessage, ""),
      pages: get<string[]>(SETTING_KEYS.SystemMaintenancePages, []),
    },
    operationalStatus,
    features: {
      loyaltyEnabled: get<boolean>(SETTING_KEYS.FeaturesLoyaltyEnabled, false),
      notificationsEnabled: get<boolean>(
        SETTING_KEYS.FeaturesNotificationsEnabled,
        false,
      ),
    },
    inventory: {
      lowStockAlertEnabled: get<boolean>(
        SETTING_KEYS.InventoryLowStockAlertEnabled,
        true,
      ),
    },
    security: {
      sessionTimeoutMinutes: get<number>(
        SETTING_KEYS.SecuritySessionTimeoutMinutes,
        30,
      ),
      passwordMinLength: get<number>(
        SETTING_KEYS.SecurityPasswordMinLength,
        6,
      ),
      maxLoginAttempts: get<number>(
        SETTING_KEYS.SecurityMaxLoginAttempts,
        5,
      ),
    },
  };
};

interface ProviderProps {
  initialSettings?: SystemSettingDto[];
  autoFetch?: boolean;
}

export const PublicSettingsProvider: React.FC<
  React.PropsWithChildren<ProviderProps>
> = ({ children, initialSettings, autoFetch = true }) => {
  const seed = useMemo(
    () => (initialSettings ? buildState(initialSettings) : null),
    [initialSettings],
  );

  const [state, setState] = useState(() =>
    seed ? { ...seed, ready: true } : { ...DEFAULTS, settingsMap: new Map(), ready: false },
  );
  const [loading, setLoading] = useState(false);

  const fetchCb = useApiCallback(async (api) => api.commons.settingsPublic());

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchCb.execute();
      const list = res.data.response ?? [];
      setState({ ...buildState(list), ready: true });
    } catch (error) {
      console.error("Failed to fetch public settings", error);
    } finally {
      setLoading(false);
    }
  }, [fetchCb]);

  useEffect(() => {
    if (!autoFetch) return;
    if (initialSettings && initialSettings.length > 0) return;
    refresh();
  }, [autoFetch]);

  const value = useMemo<PublicSettingsValue>(
    () => ({
      loading,
      ready: state.ready,
      systemName: state.systemName,
      theme: state.theme,
      maintenance: state.maintenance,
      operationalStatus: state.operationalStatus,
      features: state.features,
      inventory: state.inventory,
      security: state.security,
      settingsMap: state.settingsMap,
      refresh,
    }),
    [loading, state, refresh],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const PUBLIC_SETTINGS_PAGE_KEYS = PAGE_KEYS;
