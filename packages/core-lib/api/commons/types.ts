import { ApiResponse } from "../types";

export interface UserInformations {
  roleID: string;
  userInfo: {
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
  };
}
export interface CreateCategoryParams {
  name: string;
  description: string;
  type: number;
  displayOrder: number;
}

export interface CreateProductParams {
  name: string;
  description: string;
  isMenuItem: boolean;
  categoryID?: string | null;
  unitPrice?: number;
  costPrice?: number;
  purchaseQuantity?: number;
  purchaseUnitID?: string;
  stockUnitID?: string;
  imageFile?: File | null;
}

export interface UpdateProductParams {
  productID: string;
  name?: string;
  description?: string | null;
  isMenuItem?: boolean;
  categoryID?: string | null;
  unitPrice?: number;
  costPrice?: number;
  purchaseQuantity?: number;
  purchaseUnitID?: string;
  stockUnitID?: string;
  imageFile?: File | null;
  removeImage?: boolean;
}
export interface CreateUnitConversionParams {
  fromUnitID: string;
  toUnitID: string;
  conversionRate: number;
  isApproximate: boolean;
  notes?: string;
}
export interface CategoryDataList {
  categoryID: string;
  name: string;
  type: number;
  description: string;
  displayOrder: string;
  createdBy: string;
}
export interface ProductDataList {
  productID: string;
  name: string;
  description: string | null;
  unitPrice: number | null;
  costPrice: number | null;
  purchaseQuantity: number | null;
  purchaseUnitID: string | null;
  purchaseUnitName: string | null;
  stockUnitID: string | null;
  stockUnitName: string | null;
  costPerStockUnit: number | null;
  isMenuItem: boolean;
  imageUrl: string | null;
  productCategoryID: string | null;
  productCategoryName: string | null;
  ingredientCategoryID: string | null;
  ingredientCategoryName: string | null;
  brandID: string | null;
  brandName: string | null;
  status?: number;
  createdBy: string | null;
  createdAt: string | null;
  updatedBy: string | null;
  updatedAt: string | null;
  isActive: boolean;
}

export interface RecipeParams {
  menuItemProductID: string;
  notes: string | null;
  recipeItems: {
    notes?: string | null | undefined;
    ingredientProductID: string;
    quantityRequired: number;
    unitID: string;
    displayOrder: number;
  }[];
}

export interface UpdateRecipeParams {
  recipeId: string;
  recipeItems: {
    recipeItemId?: string;
    notes?: string | null | undefined;
    ingredientProductID: string;
    quantityRequired: number;
    unitID: string;
    displayOrder: number;
  }[];
}

export interface RecipeItemResponse {
  recipeItemID: string;
  ingredientProductID: string;
  ingredientName: string;
  ingredientCost: number;
  calculatedCost: number;
  quantityRequired: number;
  unitID: string;
  unitName: string;
  displayOrder: number;
  notes: string | null;
  cost: number;
  purchaseQuantity?: number;
  purchaseUnitName?: string;
  stockUnitName?: string;
  costPerStockUnit?: number;
}

export interface UntrackedSalesGapDto {
  ingredientProductId: string;
  ingredientName: string;
  estimatedUnaccountedQuantity: number;
  unitName: string;
  untrackedSaleCount: number;
}

export interface DetectGapDto {
  untrackedSaleCount: number;
  totalEstimatedQuantity: number;
  message: string;
}

export interface DetectGapResponseDto {
  gaps: DetectGapDto[];
}

export interface RecipeResponse {
  recipeID: string;
  menuItemProductID: string;
  menuItemName: string;
  recipeItems: RecipeItemResponse[];
  totalCost: number;
  untrackedSalesGap?: UntrackedSalesGapDto[];
}

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export type ProductionStatus = "InStock" | "LowStock" | "OutOfStock";
export interface ProductionConstraint {
  ingredientName: string;
  requiredPerUnit: number;
  availableQuantity: number;
  maxUnitsFromThisIngredient: number;
  unitName: string;
  status: ProductionStatus;
  isBottleneck: boolean;
  costPerUnit: number;
  totalCostForMaxProduction: number;
}

export interface ProductionCapacity {
  menuItemProductId: string;
  menuItemName: string;
  maxUnitsCanProduce: number;
  constraints: ProductionConstraint[];
  requiredIngredients: Record<string, number>;
  overallStatus: ProductionStatus;
  bottleneckIngredients: string[];
  totalCostPerUnit: number;
  totalCostMaxProduction: number;
}

export interface UnitConversion {
  unitConversionID: string;
  fromUnitID: string;
  fromUnitName: string;
  toUnitID: string;
  toUnitName: string;
  conversionRate: number;
  isApproximate: boolean;
  notes: string | null;
  isActive: boolean;
}

export interface ConversionRateResponse {
  rate: number;
  message: string;
}

// ===== Charts (v2 — typed series/points shape, filter-aware) =====
//
// Backend should return this shape from GET /api/v1/chart-api/Chart/{chartKey}.
// See chart-api-spec.md for the full backend contract.

// ===== Notifications (admin bell) =====
//
// In-app notifications surfaced via the header bell. Backend stores per-user
// records and exposes both a paginated list endpoint and a lightweight
// unread-count endpoint. Real-time delivery is via SSE — see
// `notifications-backend-ready.md` for the full backend contract.

/**
 * Wire-level category — serialized as the underlying integer (1..5).
 * Indexed list used at the UI layer to map to icon/color.
 */
export enum NotificationCategoryDto {
  Info = 1,
  Success = 2,
  Warning = 3,
  Error = 4,
  System = 5,
}

export interface NotificationDto {
  notificationID: string;
  /** Stable event key (e.g. "Inventory.LowStock", "Backup.Completed"). */
  eventType: string;
  category: NotificationCategoryDto;
  title: string;
  message: string | null;
  /** Optional in-app link. When present, clicking the row navigates here. */
  link: string | null;
  /** Optional reference to the underlying entity. */
  entityName: string | null;
  entityID: string | null;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationQueryParams {
  pageNumber?: number;
  pageSize?: number;
  /** `true` → only unread, `false` → only read, omit → both. */
  unreadOnly?: boolean;
  category?: NotificationCategoryDto;
  fromDate?: string;
  toDate?: string;
}

export interface NotificationCountDto {
  unread: number;
  total: number;
}

export type NotificationListResponse = ApiResponse<
  PaginatedResponse<NotificationDto>
>;
export type NotificationResponse = ApiResponse<NotificationDto>;
export type NotificationCountResponse = ApiResponse<NotificationCountDto>;

// ===== Procurement (PO / Receiving / Invoices / Payments) =====

export enum PurchaseOrderStatusDto {
  Draft = 1,
  Submitted = 2,
  Approved = 3,
  PartiallyReceived = 4,
  Received = 5,
  Closed = 6,
  Cancelled = 7,
}

export enum FulfillmentMethodDto {
  Delivery = 1,
  Pickup = 2,
}

export enum SupplierInvoiceStatusDto {
  Pending = 1,
  PartiallyPaid = 2,
  Paid = 3,
  Overdue = 4,
  Voided = 5,
}

export enum PaymentMethodDto {
  Cash = 1,
  BankTransfer = 2,
  Check = 3,
  GCash = 4,
  Other = 5,
}

export interface PurchaseOrderItemDto {
  purchaseOrderItemID: string;
  productID: string;
  productName: string;
  productImageUrl: string | null;
  quantity: number;
  unitID: string;
  unitName: string;
  unitPrice: number;
  discount: number | null;
  lineTotal: number;
  quantityReceived: number;
  notes: string | null;
  /** Product's stock unit name (e.g. "pcs"). Populated on PO Detail only. */
  stockUnitName: string;
  /**
   * Current multiplier to convert PO-unit qty → stock units. `null` when no
   * `UnitConversion` is configured — receive will fall back to 1:1.
   */
  conversionFactor: number | null;
  /** False → receive will record 1:1; show a warning in the receive dialog. */
  hasConfiguredConversion: boolean;
}

export interface PurchaseOrderDto {
  purchaseOrderID: string;
  orderNumber: string;
  supplierID: string;
  supplierName: string;
  status: PurchaseOrderStatusDto;
  fulfillmentMethod: FulfillmentMethodDto;
  expectedDate: string | null;
  orderDate: string;
  paymentTerms: string;
  currencyCode: string;
  totalAmount: number;
  itemCount: number;
  totalQuantityOrdered: number;
  totalQuantityReceived: number;
  createdAt: string | null;
}

export interface PurchaseOrderDetailDto extends PurchaseOrderDto {
  items: PurchaseOrderItemDto[];
  receipts: ReceiptDto[];
  invoices: SupplierInvoiceDto[];
  subtotal: number;
  taxAmount: number | null;
  discountAmount: number | null;
  shippingFee: number | null;
  notes: string | null;
  deliveryAddress: string | null;
  submittedAt: string | null;
  approvedAt: string | null;
  approvedByUserID: string | null;
  approvedByUserName: string | null;
  closedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  hasInvoiceVariance: boolean;
}

export interface CreatePurchaseOrderItemParams {
  productID: string;
  quantity: number;
  unitID: string;
  unitPrice: number;
  discount?: number;
  notes?: string;
}

export interface CreatePurchaseOrderParams {
  supplierID: string;
  fulfillmentMethod: FulfillmentMethodDto;
  expectedDate?: string;
  paymentTerms?: string;
  currencyCode?: string;
  taxAmount?: number;
  discountAmount?: number;
  shippingFee?: number;
  notes?: string;
  deliveryAddress?: string;
  items: CreatePurchaseOrderItemParams[];
}

export interface UpdatePurchaseOrderParams {
  fulfillmentMethod?: FulfillmentMethodDto;
  expectedDate?: string;
  paymentTerms?: string;
  taxAmount?: number;
  discountAmount?: number;
  shippingFee?: number;
  notes?: string;
  deliveryAddress?: string;
  items?: CreatePurchaseOrderItemParams[];
}

export interface PurchaseOrderQueryParams {
  pageNumber?: number;
  pageSize?: number;
  status?: PurchaseOrderStatusDto;
  supplierID?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  fulfillmentMethod?: FulfillmentMethodDto;
}

export interface ReceiptItemDto {
  receiptItemID: string;
  purchaseOrderItemID: string;
  productID: string;
  productName: string;
  /** PO-unit quantity as recorded against the supplier delivery note (e.g. 1 kg). */
  quantity: number;
  unitName: string;
  /** PO-unit cost (e.g. ₱600 per kg). */
  unitCost: number;
  stockMovementID: string | null;
  qualityNotes: string | null;
  /** Inventory-ledger quantity after applying UnitConversion at receive time (e.g. 15 pcs). */
  stockQuantity: number;
  /** Stock unit name (e.g. "pcs"). */
  stockUnitName: string;
  /** Multiplier used at receive time. Survives later UnitConversion edits. */
  conversionFactor: number;
}

export interface ReceiptDto {
  receiptID: string;
  receiptNumber: string;
  purchaseOrderID: string;
  receivedDate: string;
  receivedByUserID: string;
  receivedByUserName: string;
  deliveryNoteNumber: string | null;
  notes: string | null;
  items: ReceiptItemDto[];
  createdAt: string;
}

export interface CreateReceiptItemParams {
  purchaseOrderItemID: string;
  quantity: number;
  unitCost?: number;
  qualityNotes?: string;
}

export interface CreateReceiptParams {
  purchaseOrderID: string;
  receivedDate?: string;
  deliveryNoteNumber?: string;
  notes?: string;
  items: CreateReceiptItemParams[];
}

export interface SupplierInvoiceDto {
  supplierInvoiceID: string;
  invoiceNumber: string;
  purchaseOrderID: string;
  purchaseOrderNumber: string;
  supplierID: string;
  supplierName: string;
  status: SupplierInvoiceStatusDto;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  createdAt: string | null;
}

export interface SupplierInvoiceDetailDto extends SupplierInvoiceDto {
  subtotal: number;
  taxAmount: number | null;
  discountAmount: number | null;
  shippingFee: number | null;
  notes: string | null;
  attachmentUrl: string | null;
  payments: PaymentDto[];
}

export interface CreateSupplierInvoiceParams {
  purchaseOrderID: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  subtotal: number;
  taxAmount?: number;
  discountAmount?: number;
  shippingFee?: number;
  notes?: string;
}

export interface UpdateSupplierInvoiceParams {
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  subtotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  shippingFee?: number;
  notes?: string;
}

export interface SupplierInvoiceQueryParams {
  pageNumber?: number;
  pageSize?: number;
  status?: SupplierInvoiceStatusDto;
  supplierID?: string;
  purchaseOrderID?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  dueOnly?: boolean;
}

export interface PaymentDto {
  paymentID: string;
  paymentNumber: string;
  supplierInvoiceID: string;
  supplierInvoiceNumber: string;
  supplierID: string;
  supplierName: string;
  method: PaymentMethodDto;
  methodName: string;
  referenceNumber: string | null;
  amount: number;
  paymentDate: string;
  notes: string | null;
  isActive: boolean;
  createdAt: string | null;
}

export interface CreatePaymentParams {
  supplierInvoiceID: string;
  method: PaymentMethodDto;
  referenceNumber?: string;
  amount: number;
  paymentDate?: string;
  notes?: string;
}

export interface PaymentQueryParams {
  pageNumber?: number;
  pageSize?: number;
  supplierInvoiceID?: string;
  supplierID?: string;
  method?: PaymentMethodDto;
  fromDate?: string;
  toDate?: string;
}

export type PurchaseOrderListResponse = ApiResponse<
  PaginatedResponse<PurchaseOrderDto>
>;
export type PurchaseOrderResponse = ApiResponse<PurchaseOrderDetailDto>;
export type ReceiptListResponse = ApiResponse<ReceiptDto[]>;
export type ReceiptResponse = ApiResponse<ReceiptDto>;
export type SupplierInvoiceListResponse = ApiResponse<
  PaginatedResponse<SupplierInvoiceDto>
>;
export type SupplierInvoiceResponse = ApiResponse<SupplierInvoiceDetailDto>;
export type PaymentListResponse = ApiResponse<PaginatedResponse<PaymentDto>>;
export type PaymentResponse = ApiResponse<PaymentDto>;

export type ChartTypeDto = "line" | "area" | "bar" | "donut";

export type ChartPeriodDto =
  | "today"
  | "yesterday"
  | "7d"
  | "30d"
  | "90d"
  | "ytd"
  | "year"
  | "all"
  | "custom";

export type ChartGroupByDto =
  | "hour"
  | "day"
  | "week"
  | "month"
  | "quarter"
  | "year";

export interface ChartSeriesDto {
  id: string;
  name: string;
  color?: string | null;
}

export interface ChartPointDto {
  label: string;
  timestamp?: string | null;
  values: Record<string, number>;
}

export interface DonutSliceDto {
  id: string;
  label: string;
  value: number;
  color?: string | null;
}

export interface ChartNumberFormatDto {
  prefix?: string | null;
  suffix?: string | null;
  decimals?: number | null;
  thousands?: boolean | null;
  currency?: string | null;
}

export interface ChartMetaResponseDto {
  total?: number | null;
  trend?: {
    value: number;
    direction: "up" | "down" | "flat";
  } | null;
  period?: ChartPeriodDto | null;
  fromDate?: string | null;
  toDate?: string | null;
  stale?: boolean | null;
}

export interface ChartDataResponseDto {
  chartKey: string;
  chartType: ChartTypeDto;
  title?: string | null;
  description?: string | null;
  numberFormat?: ChartNumberFormatDto | null;
  series: ChartSeriesDto[];
  points: ChartPointDto[];
  slices?: DonutSliceDto[] | null;
  meta?: ChartMetaResponseDto | null;
}

export interface ChartQueryParams {
  period?: ChartPeriodDto;
  fromDate?: string;
  toDate?: string;
  groupBy?: ChartGroupByDto;
  productIds?: string[];
  categoryIds?: string[];
  [key: string]: string | string[] | number | undefined;
}

export type ChartDataApiResponse = ApiResponse<ChartDataResponseDto>;

// ===== Lookups (typed taxonomy tables that replaced the legacy polymorphic Category) =====

export interface UnitDto {
  unitID: string;
  name: string;
  description: string | null;
  displayOrder: number;
  parentUnitID: string | null;
  parentUnitName: string | null;
  createdBy: string | null;
  createdAt: string | null;
  updatedBy: string | null;
  updatedAt: string | null;
  isActive: boolean;
}

export interface CreateUnitParams {
  name: string;
  description?: string | null;
  displayOrder?: number;
  parentUnitID?: string | null;
}

export interface UpdateUnitParams {
  unitID: string;
  name?: string | null;
  description?: string | null;
  displayOrder?: number | null;
  parentUnitID?: string | null;
}

export interface ProductCategoryDto {
  productCategoryID: string;
  name: string;
  description: string | null;
  displayOrder: number;
  parentProductCategoryID: string | null;
  parentProductCategoryName: string | null;
  createdBy: string | null;
  createdAt: string | null;
  updatedBy: string | null;
  updatedAt: string | null;
  isActive: boolean;
}

export interface CreateProductCategoryParams {
  name: string;
  description?: string | null;
  displayOrder?: number;
  parentProductCategoryID?: string | null;
}

export interface UpdateProductCategoryParams {
  productCategoryID: string;
  name?: string | null;
  description?: string | null;
  displayOrder?: number | null;
  parentProductCategoryID?: string | null;
}

export interface IngredientCategoryDto {
  ingredientCategoryID: string;
  name: string;
  description: string | null;
  displayOrder: number;
  parentIngredientCategoryID: string | null;
  parentIngredientCategoryName: string | null;
  createdBy: string | null;
  createdAt: string | null;
  updatedBy: string | null;
  updatedAt: string | null;
  isActive: boolean;
}

export interface CreateIngredientCategoryParams {
  name: string;
  description?: string | null;
  displayOrder?: number;
  parentIngredientCategoryID?: string | null;
}

export interface UpdateIngredientCategoryParams {
  ingredientCategoryID: string;
  name?: string | null;
  description?: string | null;
  displayOrder?: number | null;
  parentIngredientCategoryID?: string | null;
}

export interface LocationDto {
  locationID: string;
  name: string;
  description: string | null;
  displayOrder: number;
  parentLocationID: string | null;
  parentLocationName: string | null;
  createdBy: string | null;
  createdAt: string | null;
  updatedBy: string | null;
  updatedAt: string | null;
  isActive: boolean;
}

export interface CreateLocationParams {
  name: string;
  description?: string | null;
  displayOrder?: number;
  parentLocationID?: string | null;
}

export interface UpdateLocationParams {
  locationID: string;
  name?: string | null;
  description?: string | null;
  displayOrder?: number | null;
  parentLocationID?: string | null;
}

export interface BrandDto {
  brandID: string;
  name: string;
  description: string | null;
  displayOrder: number;
  parentBrandID: string | null;
  parentBrandName: string | null;
  createdBy: string | null;
  createdAt: string | null;
  updatedBy: string | null;
  updatedAt: string | null;
  isActive: boolean;
}

export interface CreateBrandParams {
  name: string;
  description?: string | null;
  displayOrder?: number;
  parentBrandID?: string | null;
}

export interface UpdateBrandParams {
  brandID: string;
  name?: string | null;
  description?: string | null;
  displayOrder?: number | null;
  parentBrandID?: string | null;
}

export type UnitResponse = ApiResponse<UnitDto>;
export type UnitListResponse = ApiResponse<UnitDto[]>;
export type ProductCategoryResponse = ApiResponse<ProductCategoryDto>;
export type ProductCategoryListResponse = ApiResponse<ProductCategoryDto[]>;
export type IngredientCategoryResponse = ApiResponse<IngredientCategoryDto>;
export type IngredientCategoryListResponse = ApiResponse<IngredientCategoryDto[]>;
export type LocationResponse = ApiResponse<LocationDto>;
export type LocationListResponse = ApiResponse<LocationDto[]>;
export type BrandResponse = ApiResponse<BrandDto>;
export type BrandListResponse = ApiResponse<BrandDto[]>;

// ===== Users / Roles =====

export interface RoleDto {
  roleID: string;
  roleName: string;
  description?: string | null;
  isActive?: boolean;
  createdBy?: string | null;
  createdAt?: string | null;
}

export interface UserInfoDto {
  userInfoID?: string;
  userID?: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string;
  contactNumber: string;
  licenseNumber: string | null;
  imageUrl: string | null;
}

export interface AuthDto {
  username: string;
  password: string;
}

export interface UserDto {
  userID: string;
  roleID: string;
  roleName: string | null;
  username: string | null;
  lastLogin: string | null;
  auth: AuthDto | null;
  userInfo: UserInfoDto | null;
  isActive: boolean;
  createdBy: string | null;
  createdAt: string | null;
  updatedBy: string | null;
  updatedAt: string | null;
}

export interface CreateUserParams {
  roleID: string;
  username: string;
  password: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  contactNumber: string;
  licenseNumber?: string;
  imageFile?: File | null;
}

export interface UpdateUserParams {
  userID: string;
  roleID?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  contactNumber?: string;
  licenseNumber?: string;
  password?: string;
  imageFile?: File | null;
  removeImage?: boolean;
}

export type UserResponse = ApiResponse<UserDto>;
export type UserListResponse = ApiResponse<PaginatedResponse<UserDto>>;
export type UserArrayResponse = ApiResponse<UserDto[]>;
export type RoleResponse = ApiResponse<RoleDto>;
export type RoleListResponse = ApiResponse<RoleDto[]>;

// ===== Suppliers =====

export interface SupplierDto {
  supplierID: string;
  companyName: string;
  contactPersonName: string | null;
  email: string | null;
  contactNumber: string | null;
  address: string | null;
  taxID: string | null;
  paymentTerms: string | null;
  notes: string | null;
  logoUrl: string | null;
  userID: string | null;
  userUsername: string | null;
  isActive: boolean;
  createdBy: string | null;
  createdAt: string | null;
  updatedBy: string | null;
  updatedAt: string | null;
}

export interface CreateSupplierParams {
  companyName: string;
  contactPersonName?: string;
  email?: string;
  contactNumber?: string;
  address?: string;
  taxID?: string;
  paymentTerms?: string;
  notes?: string;
  userID?: string;
  logoFile?: File | null;
}

export interface UpdateSupplierParams {
  supplierID: string;
  companyName?: string;
  contactPersonName?: string;
  email?: string;
  contactNumber?: string;
  address?: string;
  taxID?: string;
  paymentTerms?: string;
  notes?: string;
  userID?: string;
  logoFile?: File | null;
  removeLogo?: boolean;
}

export type SupplierResponse = ApiResponse<SupplierDto>;
export type SupplierListResponse = ApiResponse<PaginatedResponse<SupplierDto>>;

// ===== Settings =====

export type SettingDataType = 1 | 2 | 3 | 4 | 5 | 6;

export const SETTING_DATA_TYPE = {
  String: 1 as SettingDataType,
  Boolean: 2 as SettingDataType,
  Integer: 3 as SettingDataType,
  Decimal: 4 as SettingDataType,
  Json: 5 as SettingDataType,
  Color: 6 as SettingDataType,
} as const;

export interface SystemSettingDto {
  systemSettingID: string;
  key: string;
  value: string;
  dataType: SettingDataType;
  category: string;
  scope: string;
  description: string | null;
  isEditable: boolean;
  displayOrder: number;
  isActive: boolean;
  updatedBy: string | null;
  updatedAt: string | null;
}

export interface UpdateSystemSettingParams {
  systemSettingID: string;
  value: string;
}

export interface BulkUpdateSystemSettingParams {
  settings: UpdateSystemSettingParams[];
}

export interface UploadSettingImageParams {
  key: string;
  file: File;
}

export type SystemSettingResponse = ApiResponse<SystemSettingDto>;
export type SystemSettingListResponse = ApiResponse<SystemSettingDto[]>;

// ===== Content Blocks =====

export interface ContentBlockDto {
  contentBlockID: string;
  pageKey: string;
  contentKey: string;
  value: string;
  contentType: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
  updatedBy: string | null;
  updatedAt: string | null;
}

export interface CreateContentBlockParams {
  pageKey: string;
  contentKey: string;
  value: string;
  contentType?: string;
  description?: string;
  displayOrder?: number;
}

export interface UpdateContentBlockParams {
  contentBlockID: string;
  value?: string | null;
  contentType?: string | null;
  description?: string | null;
  displayOrder?: number | null;
}

export interface BulkUpdateContentBlockParams {
  blocks: UpdateContentBlockParams[];
}

export type ContentBlockResponse = ApiResponse<ContentBlockDto>;
export type ContentBlockListResponse = ApiResponse<ContentBlockDto[]>;

// ===== Audit Log =====

export interface AuditLogDto {
  auditLogID: string;
  eventType: string;
  entityName: string | null;
  entityID: string | null;
  action: string | null;
  changesJson: string | null;
  message: string | null;
  userID: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface AuditLogQueryParams {
  eventType?: string;
  entityName?: string;
  entityID?: string;
  userID?: string;
  fromDate?: string;
  toDate?: string;
  pageNumber?: number;
  pageSize?: number;
}

export type AuditLogResponse = ApiResponse<AuditLogDto>;
export type AuditLogListResponse = ApiResponse<PaginatedResponse<AuditLogDto>>;

// ===== Backup & Restore =====

export type BackupImportMode = "replace" | "merge";

export interface ExportBackupParams {
  password: string;
  mpin: string;
  includeAuditLog?: boolean;
  includeStockMovements?: boolean;
}

export interface PreviewImportParams {
  file: File;
  mode?: BackupImportMode;
}

export interface ImportBackupParams {
  file: File;
  mode: BackupImportMode;
  password: string;
  mpin: string;
}

export interface ImportValidationError {
  rowIndex: number;
  columnName: string;
  message: string;
}

export interface ImportPreviewSheetDto {
  sheetName: string;
  tableName: string;
  recordCount: number;
  willInsert: number;
  willUpdate: number;
  willDelete: number;
  validationErrors: ImportValidationError[];
}

export interface ImportPreviewDto {
  schemaVersion: number;
  exportedAt: string;
  exportedBy: string | null;
  exportedByName: string | null;
  mode: BackupImportMode;
  sheets: ImportPreviewSheetDto[];
  blockingErrors: string[];
  totalRecordCount: number;
  estimatedDurationMs: number;
}

export interface ImportResultSheetDto {
  sheetName: string;
  tableName: string;
  inserted: number;
  updated: number;
  deleted: number;
}

export interface ImportResultDto {
  startedAt: string;
  completedAt: string;
  durationMs: number;
  mode: BackupImportMode;
  sheets: ImportResultSheetDto[];
  totalInserted: number;
  totalUpdated: number;
  totalDeleted: number;
}

export interface BackupHistoryDto {
  backupHistoryID: string;
  operation: "Export" | "Import";
  mode: BackupImportMode | null;
  performedBy: string | null;
  performedByName: string | null;
  performedAt: string;
  status: "Success" | "Failed";
  fileSizeBytes: number | null;
  fileName: string | null;
  recordsAffected: number | null;
  errorMessage: string | null;
}

export type ImportPreviewResponse = ApiResponse<ImportPreviewDto>;
export type ImportResultResponse = ApiResponse<ImportResultDto>;
export type BackupHistoryListResponse = ApiResponse<
  PaginatedResponse<BackupHistoryDto>
>;

// ===== Inventory =====

export enum InventoryStatus {
  InStock = 1,
  LowStock = 2,
  Critical = 3,
  OutOfStock = 4,
}

export enum StockMovementType {
  Sale = 1,
  Return = 2,
  Received = 3,
  Wastage = 4,
  Adjustment = 5,
  Transfer = 6,
  Production = 7,
}

export interface InventoryDto {
  inventoryID: string;
  productID: string;
  productName: string | null;
  currentQuantity: number;
  reorderLevel: number;
  minimumStockLevel: number;
  stockUnitID: string | null;
  stockUnitName: string | null;
  status: InventoryStatus;
  statusName: string;
  createdBy: string | null;
  createdAt: string | null;
  updatedBy: string | null;
  updatedAt: string | null;
  isActive: boolean;
}

export interface CreateInventoryParams {
  productID: string;
  currentQuantity: number;
  reorderLevel: number;
  minimumStockLevel: number;
}

export interface UpdateInventoryParams {
  inventoryID: string;
  reorderLevel?: number;
  minimumStockLevel?: number;
}

export interface AdjustStockParams {
  inventoryID: string;
  delta: number;
  reason: string;
}

export interface StockMovementDto {
  stockMovementID: string;
  inventoryID: string;
  productID: string;
  productName: string | null;
  movementType: StockMovementType;
  movementTypeName: string;
  quantity: number;
  unitID: string;
  unitName: string | null;
  reason: string | null;
  referenceType: string | null;
  referenceID: string | null;
  unitCost: number | null;
  balanceAfter: number;
  createdBy: string | null;
  createdAt: string | null;
}

export type InventoryResponse = ApiResponse<InventoryDto>;
export type InventoryListResponse = ApiResponse<PaginatedResponse<InventoryDto>>;
export type LowStockResponse = ApiResponse<InventoryDto[]>;
export type StockMovementResponse = ApiResponse<StockMovementDto>;
export type StockMovementListResponse = ApiResponse<
  PaginatedResponse<StockMovementDto>
>;
export type StockMovementArrayResponse = ApiResponse<StockMovementDto[]>;

export type UnitConversionListResponse = ApiResponse<
  PaginatedResponse<UnitConversion>
>;
export type ProductionCapacityResponse = ApiResponse<ProductionCapacity>;
export type RecipeListResponse = ApiResponse<PaginatedResponse<RecipeResponse>>;
export type UserInfoResponse = ApiResponse<UserInformations>;
export type CategoryListResponse = ApiResponse<CategoryDataList[]>;

// ===== POS / Sales (cashier register) =====

export enum SaleStatusDto {
  Completed = 1,
  Voided = 2,
  PartiallyRefunded = 3,
  FullyRefunded = 4,
}

export enum SalesPaymentMethodDto {
  Cash = 1,
  Card = 2,
  GCash = 3,
  Maya = 4,
  BankTransfer = 5,
  StoreCredit = 6,
  Other = 7,
}

export interface SaleItemDto {
  saleItemID: string;
  productID: string;
  productName: string;
  /** Nullable: menu items produced from recipes don't require their own stock unit. */
  unitID: string | null;
  unitName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  lineSubtotal: number;
  lineTotal: number;
  /** Legacy single-movement back-link, kept for one release. Equals the FIRST entry of stockMovementIDs. */
  stockMovementID: string | null;
  /**
   * All StockMovement rows generated by this sale line. Length 1 for ingredient-direct lines;
   * length = recipe ingredient count for menu items deducted via recipe.
   */
  stockMovementIDs: string[];
  quantityRefunded: number;
  isRefunded: boolean;
}

export interface SalePaymentDto {
  salePaymentID: string;
  method: SalesPaymentMethodDto;
  methodName: string;
  amount: number;
  tendered: number;
  referenceNumber: string | null;
  createdAt: string | null;
}

export interface RefundItemDto {
  refundItemID: string;
  saleItemID: string;
  productID: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineAmount: number;
  /** Legacy single-movement back-link, kept for one release. Equals the FIRST entry of stockMovementIDs. */
  stockMovementID: string | null;
  /**
   * All Return StockMovement rows generated by this refund line. Length 1 for ingredient-direct lines;
   * length = recipe ingredient count for menu items refunded against a recipe.
   * Scoped to this Refund — a SaleItem refunded twice gets two non-overlapping lists, one per Refund.
   */
  stockMovementIDs: string[];
}

export interface RefundDto {
  refundID: string;
  refundNumber: string;
  saleID: string;
  refundedByUserID: string;
  refundedByUserName: string;
  managerOverrideUserID: string | null;
  reason: string;
  totalAmount: number;
  createdAt: string | null;
  items: RefundItemDto[];
}

export interface SaleDto {
  saleID: string;
  saleNumber: string;
  saleDate: string;
  completedAt: string;
  status: SaleStatusDto;
  statusName: string;
  cashierUserID: string;
  cashierName: string;
  totalAmount: number;
  refundedAmount: number;
  itemCount: number;
  paymentCount: number;
}

export interface SaleDetailDto {
  saleID: string;
  saleNumber: string;
  saleDate: string;
  completedAt: string;
  status: SaleStatusDto;
  statusName: string;
  cashierUserID: string;
  cashierName: string;
  customerID: string | null;
  notes: string | null;

  subtotal: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  amountTendered: number;
  changeDue: number;

  items: SaleItemDto[];
  payments: SalePaymentDto[];

  voidedAt: string | null;
  voidedByUserID: string | null;
  voidedByUserName: string | null;
  voidReason: string | null;
  refundedAmount: number;
  refunds: RefundDto[];
}

export interface SellableProductDto {
  productID: string;
  name: string;
  categoryID: string | null;
  categoryName: string | null;
  imageUrl: string | null;
  sellingPrice: number;
  stockUnitName: string;
  /**
   * For ingredient products: Inventory.CurrentQuantity.
   * For menu items with an active recipe: floor(min over ingredients of (ingredient.CurrentQuantity / qtyRequired)), soft-capped at 999.
   * For menu items without a recipe: 999 when AllowMenuItemsWithoutRecipe=true; 0 when false.
   */
  currentStock: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  isMenuItem: boolean;
  isActive: boolean;
  /** True when this menu item has an active recipe and currentStock reflects production capacity. */
  isProducedFromRecipe: boolean;
  /** True for menu items that have no active recipe configured. */
  noRecipeConfigured: boolean;
  /** Ingredient names limiting production. Populated only when isProducedFromRecipe=true AND stock is low/out. */
  bottleneckIngredientNames: string[];
}

export interface CreateSaleItemParams {
  productID: string;
  quantity: number;
  unitPrice: number;
  discount?: number | null;
}

export interface CreateSalePaymentParams {
  method: SalesPaymentMethodDto;
  amount: number;
  tendered?: number | null;
  referenceNumber?: string | null;
}

export interface CreateSaleParams {
  customerID?: string | null;
  notes?: string | null;
  items: CreateSaleItemParams[];
  discountAmount?: number | null;
  taxRate?: number | null;
  payments: CreateSalePaymentParams[];
}

export interface VoidSaleParams {
  reason: string;
  /** Required when POS.RequireManagerOverrideForRefund=true. */
  managerUserID?: string | null;
  /** 4-6 digit MPIN, required when POS.RequireManagerOverrideForRefund=true. */
  managerMpin?: string | null;
}

export interface RefundLineParams {
  saleItemID: string;
  /** Must be > 0 and <= (saleItem.quantity - saleItem.quantityRefunded). */
  quantity: number;
}

export interface RefundSaleParams {
  reason: string;
  items: RefundLineParams[];
  /** Required when POS.RequireManagerOverrideForRefund=true. */
  managerUserID?: string | null;
  /** 4-6 digit MPIN, required when POS.RequireManagerOverrideForRefund=true. */
  managerMpin?: string | null;
}

export interface SellableProductQueryParams {
  pageNumber?: number;
  pageSize?: number;
  categoryID?: string;
  search?: string;
}

export interface SaleQueryParams {
  pageNumber?: number;
  pageSize?: number;
  status?: SaleStatusDto;
  cashierUserID?: string;
  /** YYYY-MM-DD, inclusive. */
  fromDate?: string;
  /** YYYY-MM-DD, inclusive. */
  toDate?: string;
  /** Matches saleNumber or cashierName. */
  search?: string;
}

export interface DailySalesSummaryByCashierDto {
  cashierUserID: string;
  cashierName: string;
  salesCount: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  refundedAmount: number;
  netRevenue: number;
}

export interface DailySalesSummaryDto {
  /** YYYY-MM-DD (server-TZ when omitted on request). */
  date: string;
  /** Active sales on the date, excluding Voided. */
  salesCount: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  refundedAmount: number;
  /** totalAmount - refundedAmount. */
  netRevenue: number;
  /** Keyed by SalesPaymentMethod name ("Cash", "Card", ...). */
  byPaymentMethod: Record<string, number>;
  byCashier: DailySalesSummaryByCashierDto[];
}

// ===== Orders / Transactions (cashier orders page) =====

export interface OrderDto {
  orderID: string;
  orderNumber: string;
  orderDate: string;
  completedAt: string;
  status: SaleStatusDto;
  statusName: string;
  cashierUserID: string;
  cashierName: string;
  totalAmount: number;
  refundedAmount: number;
  itemCount: number;
  paymentSummary: string;
  voidedByUserName: string | null;
}

export interface OrderQueryParams {
  pageNumber?: number;
  pageSize?: number;
  status?: SaleStatusDto;
  cashierUserID?: string;
  /** YYYY-MM-DD inclusive */
  fromDate?: string;
  /** YYYY-MM-DD inclusive */
  toDate?: string;
  /** Matches orderNumber or cashierName */
  search?: string;
}

/** Same wire shape as SaleDetailDto — server maps Sale → OrderDetailDto identically. */
export type OrderDetailDto = SaleDetailDto;

export type SaleResponse = ApiResponse<SaleDetailDto>;
export type SaleListResponse = ApiResponse<PaginatedResponse<SaleDto>>;
export type OrderListResponse = ApiResponse<PaginatedResponse<OrderDto>>;
export type OrderDetailResponse = ApiResponse<OrderDetailDto>;
export type SellableProductListResponse = ApiResponse<
  PaginatedResponse<SellableProductDto>
>;
export type ProductListResponse = ApiResponse<ProductDataList[]>;
export type DailySalesSummaryResponse = ApiResponse<DailySalesSummaryDto>;
