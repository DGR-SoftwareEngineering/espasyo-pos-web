import { SettingDataType, SystemSettingDto } from "../../api/commons/types";

export const SETTING_KEYS = {
  SystemName: "System.Name",
  SystemMaintenanceMode: "System.MaintenanceMode",
  SystemMaintenanceMessage: "System.MaintenanceMessage",
  SystemMaintenancePages: "System.MaintenancePages",
  SystemOperationalStatus: "System.OperationalStatus",

  ThemePrimaryColor: "Theme.PrimaryColor",
  ThemeSecondaryColor: "Theme.SecondaryColor",
  ThemeLogoUrl: "Theme.LogoUrl",
  ThemeFaviconUrl: "Theme.FaviconUrl",

  PosAllowSales: "POS.AllowSales",
  PosAllowRefund: "POS.AllowRefund",
  PosAllowDiscounts: "POS.AllowDiscounts",
  PosDefaultTaxRate: "POS.DefaultTaxRate",
  PosMaxDiscountPercent: "POS.MaxDiscountPercent",
  PosSaleNumberFormat: "POS.SaleNumberFormat",
  PosReceiptHeader: "POS.ReceiptHeader",
  PosReceiptFooter: "POS.ReceiptFooter",
  PosRequireManagerOverrideForRefund: "POS.RequireManagerOverrideForRefund",
  PosAllowMenuItemsWithoutRecipe: "POS.AllowMenuItemsWithoutRecipe",
  PosTargetSalesEnabled: "POS.TargetSalesEnabled",
  PosTargetSalesAmountPerDay: "POS.TargetSalesAmount",
  PosTargetSalesConfettiEnabled: "POS.TargetSalesConfettiEnabled",

  CurrencyCode: "Currency.Code",

  InventoryLowStockAlertEnabled: "Inventory.LowStockAlertEnabled",
  InventoryAllowNegativeStock: "Inventory.AllowNegativeStock",
  InventoryAutoDeductOnSale: "Inventory.AutoDeductOnSale",

  SecuritySessionTimeoutMinutes: "Security.SessionTimeoutMinutes",
  SecurityPasswordMinLength: "Security.PasswordMinLength",
  SecurityMaxLoginAttempts: "Security.MaxLoginAttempts",
  SecurityRequireMfa: "Security.RequireMfa",

  FeaturesLoyaltyEnabled: "Features.LoyaltyEnabled",
  FeaturesNotificationsEnabled: "Features.NotificationsEnabled",
  FeaturesSupplierPortalEnabled: "Features.SupplierPortalEnabled",
  FeaturesMultiLocationEnabled: "Features.MultiLocationEnabled",

  NotificationsRealtime: "Notifications.Realtime",
  NotificationsPollIntervalSeconds: "Notifications.PollIntervalSeconds",
  NotificationsRetentionDays: "Notifications.RetentionDays",
  NotificationsSoundEnabled: "Notifications.SoundEnabled",

  ProcurementRequireApproval: "Procurement.RequireApproval",
  ProcurementDefaultPaymentTerms: "Procurement.DefaultPaymentTerms",
  ProcurementDefaultFulfillmentMethod: "Procurement.DefaultFulfillmentMethod",
  ProcurementPurchaseOrderNumberFormat: "Procurement.PurchaseOrderNumberFormat",
  ProcurementReceiptNumberFormat: "Procurement.ReceiptNumberFormat",
  ProcurementPaymentNumberFormat: "Procurement.PaymentNumberFormat",
  ProcurementAllowedPaymentMethods: "Procurement.AllowedPaymentMethods",
  ProcurementInvoiceDueDaysDefault: "Procurement.InvoiceDueDaysDefault",
  ProcurementAllowOverReceipt: "Procurement.AllowOverReceipt",
  ProcurementWarnOnInvoiceVariance: "Procurement.WarnOnInvoiceVariance",

  LoaderVariant: "Loader.Variant",
  LoaderPrimaryMessage: "Loader.PrimaryMessage",
  LoaderRotatingMessages: "Loader.RotatingMessages",
  LoaderShowBrand: "Loader.ShowBrand",
  LoaderShowLogo: "Loader.ShowLogo",
  LoaderSpeedMs: "Loader.SpeedMs",
  LoaderBackdropOpacity: "Loader.BackdropOpacity",
  LoaderTransitionVariant: "Loader.TransitionVariant",
  LoaderTransitionMessage: "Loader.TransitionMessage",

  PromoAutoApplyEnabled: "Promo.AutoApplyEnabled",
  PromoShowBadgeOnPOS: "Promo.ShowBadgeOnPOS",
  PromoMaxActivePromos: "Promo.MaxActivePromos",
  PromoViabilityMinMarginPercent: "Promo.ViabilityMinMarginPercent",
  PromoAiSuggestionEnabled: "Promo.AI.SuggestionEnabled",
  PromoAiMinViableMarginPercent: "Promo.AI.MinViableMarginPercent",
  PromoAiMaxSuggestionsReturned: "Promo.AI.MaxSuggestionsReturned",
} as const;

export type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];

export const OPERATIONAL_STATUSES = {
  Operational: "Operational",
  Degraded: "Degraded",
  Outage: "Outage",
  Maintenance: "Maintenance",
} as const;

export type OperationalStatus =
  (typeof OPERATIONAL_STATUSES)[keyof typeof OPERATIONAL_STATUSES];

export const PAGE_KEYS = {
  Login: "login",
  Dashboard: "dashboard",
  POS: "pos",
  Inventory: "inventory",
  Reports: "reports",
  Settings: "settings",
  Users: "users",
  Suppliers: "suppliers",
} as const;

export type PageKey = (typeof PAGE_KEYS)[keyof typeof PAGE_KEYS];

export const LOADER_VARIANTS = [
  "branded",
  "minimal",
  "pulse",
  "skeleton-only",
] as const;

export type LoaderVariant = (typeof LOADER_VARIANTS)[number];

export const LOADER_TRANSITION_VARIANTS = [
  "bar",
  "ring",
  "bar-and-ring",
  "shimmer",
] as const;

export type LoaderTransitionVariant =
  (typeof LOADER_TRANSITION_VARIANTS)[number];

export const CLOSED_SET_SETTINGS: Record<string, ReadonlyArray<string>> = {
  [SETTING_KEYS.SystemOperationalStatus]: Object.values(OPERATIONAL_STATUSES),
  [SETTING_KEYS.LoaderVariant]: LOADER_VARIANTS,
  [SETTING_KEYS.LoaderTransitionVariant]: LOADER_TRANSITION_VARIANTS,
};

export const SETTING_CATEGORIES = {
  System: "System",
  Theme: "Theme",
  POS: "POS",
  Inventory: "Inventory",
  Security: "Security",
  Features: "Features",
  Loader: "Loader",
  Notifications: "Notifications",
  Procurement: "Procurement",
  Promo: "Promo",
} as const;

export type SettingCategory =
  (typeof SETTING_CATEGORIES)[keyof typeof SETTING_CATEGORIES];

export const AUDIT_EVENT_TYPES = {
  SettingChanged: "Setting.Changed",
  UserLogin: "User.Login",
  UserLoginFailed: "User.LoginFailed",
  UserLogout: "User.Logout",
  UserPasswordReset: "User.PasswordReset",
  UserCreated: "User.Created",
  UserUpdated: "User.Updated",
  UserDeactivated: "User.Deactivated",
  ProductCreated: "Product.Created",
  ProductUpdated: "Product.Updated",
  ProductDeactivated: "Product.Deactivated",
  UserMpinSet: "User.MpinSet",
  UserMpinChanged: "User.MpinChanged",
  UserMpinFailed: "User.MpinFailed",
  SystemSettingsReset: "System.SettingsReset",
  SystemAuditLogsCleared: "System.AuditLogsCleared",
  RoleCreated: "Role.Created",
  RoleUpdated: "Role.Updated",
  RoleDeactivated: "Role.Deactivated",
  RolePermissionsChanged: "Role.PermissionsChanged",
  MenuItemCreated: "MenuItem.Created",
  MenuItemUpdated: "MenuItem.Updated",
  MenuItemDeactivated: "MenuItem.Deactivated",
  MenuItemReordered: "MenuItem.Reordered",
  LoaderConfigChanged: "Loader.ConfigChanged",
  BackupExported: "Backup.Exported",
  BackupExportFailed: "Backup.ExportFailed",
  BackupImported: "Backup.Imported",
  BackupImportFailed: "Backup.ImportFailed",
  BackupPreviewRequested: "Backup.PreviewRequested",
  InventoryAdjusted: "Inventory.Adjusted",
  StockMovementRecorded: "Stock.MovementRecorded",
  SaleCompleted: "Sale.Completed",
  SaleRefunded: "Sale.Refunded",
  SaleVoided: "Sale.Voided",
  MaintenanceModeToggled: "System.MaintenanceModeToggled",
  DatabaseBackupTriggered: "System.DatabaseBackupTriggered",
} as const;

export const IMAGE_SETTING_KEYS: ReadonlyArray<string> = [
  SETTING_KEYS.ThemeLogoUrl,
  SETTING_KEYS.ThemeFaviconUrl,
];

export const OPERATIONAL_STATUS_META: Record<
  OperationalStatus,
  { color: "green" | "yellow" | "red" | "blue"; label: string }
> = {
  Operational: { color: "green", label: "All systems operational" },
  Degraded: { color: "yellow", label: "Degraded performance" },
  Outage: { color: "red", label: "Major outage" },
  Maintenance: { color: "blue", label: "Scheduled maintenance" },
};

export function parseSettingValue<T = unknown>(s: SystemSettingDto): T {
  switch (s.dataType) {
    case 2:
      return ((s.value ?? "").toLowerCase() === "true") as unknown as T;
    case 3:
      return parseInt(s.value, 10) as unknown as T;
    case 4:
      return parseFloat(s.value) as unknown as T;
    case 5:
      try {
        return JSON.parse(s.value) as T;
      } catch {
        return [] as unknown as T;
      }
    default:
      return s.value as unknown as T;
  }
}

export function serializeSettingValue(
  dataType: SettingDataType,
  value: unknown,
): string {
  switch (dataType) {
    case 2:
      return value === true || value === "true" ? "true" : "false";
    case 3:
    case 4:
      return typeof value === "number" ? String(value) : String(value ?? "");
    case 5:
      return typeof value === "string" ? value : JSON.stringify(value ?? null);
    default:
      return value == null ? "" : String(value);
  }
}
