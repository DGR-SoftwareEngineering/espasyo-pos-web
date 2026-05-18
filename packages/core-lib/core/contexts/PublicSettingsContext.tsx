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
  LOADER_TRANSITION_VARIANTS,
  LOADER_VARIANTS,
  LoaderTransitionVariant,
  LoaderVariant,
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

export interface PublicNotificationsConfig {
  /** Real-time SSE stream when true, polling fallback when false. */
  realtime: boolean;
  /** How often the client polls when realtime is off. */
  pollIntervalSeconds: number;
  /** How many days the backend retains notifications. */
  retentionDays: number;
  /** Whether to play a short chime when a new notification arrives. */
  soundEnabled: boolean;
}

export interface PublicInventoryFlags {
  lowStockAlertEnabled: boolean;
}

export interface PublicSecurityPolicy {
  sessionTimeoutMinutes: number;
  passwordMinLength: number;
  maxLoginAttempts: number;
}

export interface PublicLoaderConfig {
  variant: LoaderVariant;
  primaryMessage: string;
  rotatingMessages: string[];
  showBrand: boolean;
  showLogo: boolean;
  speedMs: number;
  backdropOpacity: number;
  transitionVariant: LoaderTransitionVariant;
  transitionMessage: string;
}

export interface PublicSettingsValue {
  loading: boolean;
  ready: boolean;
  systemName: string;
  /** ISO 4217 currency code (e.g. "PHP"). Drives receipt + chart formatting. */
  currencyCode: string;
  theme: PublicTheme;
  maintenance: MaintenanceState;
  operationalStatus: OperationalStatus;
  features: PublicFeatureFlags;
  inventory: PublicInventoryFlags;
  security: PublicSecurityPolicy;
  loader: PublicLoaderConfig;
  notifications: PublicNotificationsConfig;
  settingsMap: Map<string, SystemSettingDto>;
  refresh: () => Promise<void>;
}

const DEFAULTS: Omit<
  PublicSettingsValue,
  "refresh" | "settingsMap" | "loading" | "ready"
> = {
  systemName: "Espasyo Coffee House",
  currencyCode: "PHP",
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
  loader: {
    variant: "branded",
    primaryMessage: "Brewing your dashboard…",
    rotatingMessages: [
      "Brewing your dashboard…",
      "Steaming the milk…",
      "Polishing the counter…",
      "Tasting the blend…",
      "Lining up the cups…",
    ],
    showBrand: true,
    showLogo: true,
    speedMs: 1400,
    backdropOpacity: 0.92,
    transitionVariant: "bar-and-ring",
    transitionMessage: "Loading",
  },
  notifications: {
    realtime: true,
    pollIntervalSeconds: 30,
    retentionDays: 30,
    soundEnabled: false,
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
    currencyCode: get<string>(SETTING_KEYS.CurrencyCode, DEFAULTS.currencyCode),
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
    loader: buildLoaderConfig(get),
    notifications: {
      realtime: get<boolean>(
        SETTING_KEYS.NotificationsRealtime,
        DEFAULTS.notifications.realtime,
      ),
      pollIntervalSeconds: clampInt(
        get<number>(
          SETTING_KEYS.NotificationsPollIntervalSeconds,
          DEFAULTS.notifications.pollIntervalSeconds,
        ),
        5,
        600,
      ),
      retentionDays: clampInt(
        get<number>(
          SETTING_KEYS.NotificationsRetentionDays,
          DEFAULTS.notifications.retentionDays,
        ),
        1,
        365,
      ),
      soundEnabled: get<boolean>(
        SETTING_KEYS.NotificationsSoundEnabled,
        DEFAULTS.notifications.soundEnabled,
      ),
    },
  };
};

type Getter = <T>(key: string, fallback: T) => T;

const buildLoaderConfig = (get: Getter): PublicLoaderConfig => {
  const variantRaw = get<string>(SETTING_KEYS.LoaderVariant, "branded");
  const variant = (LOADER_VARIANTS as ReadonlyArray<string>).includes(
    variantRaw,
  )
    ? (variantRaw as LoaderVariant)
    : "branded";
  const transitionRaw = get<string>(
    SETTING_KEYS.LoaderTransitionVariant,
    "bar-and-ring",
  );
  const transitionVariant = (
    LOADER_TRANSITION_VARIANTS as ReadonlyArray<string>
  ).includes(transitionRaw)
    ? (transitionRaw as LoaderTransitionVariant)
    : "bar-and-ring";

  const rotating = get<unknown>(SETTING_KEYS.LoaderRotatingMessages, []);
  const rotatingMessages = Array.isArray(rotating)
    ? rotating.filter((m): m is string => typeof m === "string" && m.length > 0)
    : [];

  const speedMs = clampInt(
    get<number>(SETTING_KEYS.LoaderSpeedMs, 1400),
    600,
    3000,
  );
  const backdropOpacity = clampFloat(
    get<number>(SETTING_KEYS.LoaderBackdropOpacity, 0.92),
    0,
    1,
  );

  return {
    variant,
    primaryMessage: get<string>(
      SETTING_KEYS.LoaderPrimaryMessage,
      "Brewing your dashboard…",
    ),
    rotatingMessages:
      rotatingMessages.length > 0
        ? rotatingMessages
        : [
            "Brewing your dashboard…",
            "Steaming the milk…",
            "Polishing the counter…",
            "Tasting the blend…",
            "Lining up the cups…",
          ],
    showBrand: get<boolean>(SETTING_KEYS.LoaderShowBrand, true),
    showLogo: get<boolean>(SETTING_KEYS.LoaderShowLogo, true),
    speedMs,
    backdropOpacity,
    transitionVariant,
    transitionMessage: get<string>(SETTING_KEYS.LoaderTransitionMessage, "Loading"),
  };
};

const clampInt = (n: number, min: number, max: number) => {
  const v = Number.isFinite(n) ? Math.round(n) : min;
  return Math.max(min, Math.min(max, v));
};
const clampFloat = (n: number, min: number, max: number) => {
  const v = Number.isFinite(n) ? n : min;
  return Math.max(min, Math.min(max, v));
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
      currencyCode: state.currencyCode,
      theme: state.theme,
      maintenance: state.maintenance,
      operationalStatus: state.operationalStatus,
      features: state.features,
      inventory: state.inventory,
      security: state.security,
      loader: state.loader,
      notifications: state.notifications,
      settingsMap: state.settingsMap,
      refresh,
    }),
    [loading, state, refresh],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const PUBLIC_SETTINGS_PAGE_KEYS = PAGE_KEYS;
