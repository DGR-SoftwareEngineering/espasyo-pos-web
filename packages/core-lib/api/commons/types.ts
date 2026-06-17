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
  variantCount?: number;
  addOnGroupCount?: number;
  hasActiveRecipe?: boolean;
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

// ===== Variant Recipes =====
export interface VariantRecipeItemResponse {
  variantRecipeItemID: string;
  ingredientProductID: string;
  ingredientName: string;
  ingredientCost: number | null;
  calculatedCost: number;
  quantityRequired: number;
  unitID: string;
  unitName: string;
  displayOrder: number;
  notes: string | null;
  purchaseQuantity?: number | null;
  purchaseUnitName?: string | null;
  stockUnitName?: string | null;
  costPerStockUnit?: number | null;
}

export interface VariantRecipeResponse {
  variantRecipeID: string;
  productVariantID: string;
  variantName: string;
  notes: string | null;
  recipeItems: VariantRecipeItemResponse[];
  totalCost: number;
}

export interface CreateVariantRecipeItemParams {
  ingredientProductID: string;
  quantityRequired: number;
  unitID: string;
  displayOrder: number;
  notes?: string | null;
}

export interface CreateVariantRecipeParams {
  productVariantID: string;
  notes?: string | null;
  recipeItems: CreateVariantRecipeItemParams[];
}

export interface UpdateVariantRecipeParams {
  variantRecipeID: string;
  notes?: string | null;
  recipeItems: CreateVariantRecipeItemParams[];
}

// ===== Add-On Item Recipes =====
export interface AddOnItemRecipeItemResponse {
  addOnItemRecipeItemID: string;
  ingredientProductID: string;
  ingredientName: string;
  ingredientCost: number | null;
  calculatedCost: number;
  quantityRequired: number;
  unitID: string;
  unitName: string;
  displayOrder: number;
  notes: string | null;
  purchaseQuantity?: number | null;
  purchaseUnitName?: string | null;
  stockUnitName?: string | null;
  costPerStockUnit?: number | null;
}

export interface AddOnItemRecipeResponse {
  addOnItemRecipeID: string;
  productAddOnItemID: string;
  itemName: string;
  notes: string | null;
  recipeItems: AddOnItemRecipeItemResponse[];
  totalCost: number;
}

export interface CreateAddOnItemRecipeItemParams {
  ingredientProductID: string;
  quantityRequired: number;
  unitID: string;
  displayOrder: number;
  notes?: string | null;
}

export interface CreateAddOnItemRecipeParams {
  productAddOnItemID: string;
  notes?: string | null;
  recipeItems: CreateAddOnItemRecipeItemParams[];
}

export interface UpdateAddOnItemRecipeParams {
  addOnItemRecipeID: string;
  notes?: string | null;
  recipeItems: CreateAddOnItemRecipeItemParams[];
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

export interface CriticalUsageResponse {
  isInUse: boolean;
  totalSaleCount: number;
  activePromoCount: number;
  activeRecipeReferenceCount: number;
  productCount: number;
  details: string[];
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

export interface BusinessSupplyCategoryDto {
  businessSupplyCategoryID: string;
  name: string;
  description: string | null;
  displayOrder: number;
  parentBusinessSupplyCategoryID: string | null;
  parentBusinessSupplyCategoryName: string | null;
  createdBy: string | null;
  createdAt: string | null;
  updatedBy: string | null;
  updatedAt: string | null;
  isActive: boolean;
}

export interface CreateBusinessSupplyCategoryParams {
  name: string;
  description?: string | null;
  displayOrder?: number;
  parentBusinessSupplyCategoryID?: string | null;
}

export interface UpdateBusinessSupplyCategoryParams {
  businessSupplyCategoryID: string;
  name?: string | null;
  description?: string | null;
  displayOrder?: number | null;
  parentBusinessSupplyCategoryID?: string | null;
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
  isLocked?: boolean;
  lockedAt?: string | null;
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

export type SettingDataType = 1 | 2 | 3 | 4 | 5 | 6 | 99;

export const SETTING_DATA_TYPE = {
  String: 1 as SettingDataType,
  Boolean: 2 as SettingDataType,
  Integer: 3 as SettingDataType,
  Decimal: 4 as SettingDataType,
  Json: 5 as SettingDataType,
  Color: 6 as SettingDataType,
  Secret: 99 as SettingDataType,
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
  isConfigured: boolean;
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

// ===== Documentation =====

export interface DocumentationDto {
  documentationID: string;
  title: string;
  subtitle: string | null;
  author: string;
  contentHtml: string;
  targetRole: "Admin" | "Cashier" | "Both";
  isPublished: boolean;
  displayOrder: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CreateDocumentationParams {
  title: string;
  subtitle?: string | null;
  contentHtml: string;
  targetRole: "Admin" | "Cashier" | "Both";
  isPublished: boolean;
  displayOrder: number;
}

export interface UpdateDocumentationParams {
  documentationID: string;
  title: string;
  subtitle?: string | null;
  contentHtml: string;
  targetRole: "Admin" | "Cashier" | "Both";
  isPublished: boolean;
  displayOrder: number;
}

export type DocumentationResponse = ApiResponse<DocumentationDto>;
export type DocumentationListResponse = ApiResponse<DocumentationDto[]>;

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

export interface ProductRecipeSummaryResponse {
  menuItemProductID: string;
  menuItemName: string;
  notes: string | null;
  recipeID: string | null;
  recipeItems: RecipeItemResponse[];
  totalCost: number;
  variantRecipeCount: number;
  addOnRecipeCount: number;
  totalAllIngredients: number;
  totalAllCost: number;
}
export type ProductRecipeSummaryListResponse = ApiResponse<PaginatedResponse<ProductRecipeSummaryResponse>>;
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
  /** Snapshot of the variant chosen at sale time. */
  productVariantID: string | null;
  variantName: string | null;
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
  /** Add-on snapshot rows captured at sale time. */
  addOns: SaleItemAddOnDto[];
}

export interface SaleItemAddOnDto {
  saleItemAddOnID: string;
  groupName: string;
  itemName: string;
  additionalPrice: number;
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
  /** 1 = Online, 2 = OfflineSynced */
  source?: number;
  sourceName?: string;
  syncedAt?: string | null;
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

  promoID: string | null;

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
  sellingPrice: number | null;
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
  /** When true, cashier MUST pick a variant before adding to the order. */
  hasVariants: boolean;
  variants: SellableVariantDto[];
  addOnGroups: SellableAddOnGroupDto[];
}

/** Variant as returned by the sellable-products endpoint. */
export interface SellableVariantDto {
  productVariantID: string;
  name: string;
  price: number;
  displayOrder: number;
  /** True when this variant has its own recipe that overrides the base product recipe on sale. */
  hasOwnRecipe: boolean;
  /** Max units producible for this variant from current ingredient stock. Null if no variant recipe. */
  maxProductionFromVariantRecipe: number | null;
  /** Names of ingredients limiting production for this variant. */
  variantBottleneckIngredients: string[];
}

export interface SellableAddOnItemDto {
  productAddOnItemID: string;
  name: string;
  additionalPrice: number;
  displayOrder: number;
  /** True when this add-on item has its own recipe whose ingredients are deducted additively on sale. */
  hasOwnRecipe: boolean;
}

export interface SellableAddOnGroupDto {
  productAddOnGroupID: string;
  name: string;
  isRequired: boolean;
  minSelections: number;
  maxSelections: number;
  displayOrder: number;
  items: SellableAddOnItemDto[];
}

export interface CreateSaleItemParams {
  productID: string;
  productVariantID?: string | null;
  addOnItemIDs?: string[] | null;
  quantity: number;
  unitPrice: number;
  discount?: number | null;
  isRedemptionLine?: boolean;
  /** True for BuyXGetY free items — exempts from backend price tamper check. */
  isPromoFreeLine?: boolean;
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
  /** 1 = Online, 2 = OfflineSynced. Undefined for older records. */
  source?: number;
  sourceName?: string;
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

// ─── Offline Sync ─────────────────────────────────────────────────────────

export interface SyncOfflineSaleItemParams extends CreateSaleParams {
  localId: string;
  offlineCreatedAt: string;
}

export interface SyncOfflineSalesParams {
  sales: SyncOfflineSaleItemParams[];
}

export interface SyncSaleResult {
  localId: string;
  success: boolean;
  sale?: SaleDetailDto;
  errorMessage?: string;
}

export interface SyncOfflineSalesResponseDto {
  results: SyncSaleResult[];
}

export type SyncOfflineSalesResponse =
  ApiResponse<SyncOfflineSalesResponseDto>;

// ─── Business Expense ──────────────────────────────────────────────────────

export interface BusinessExpenseDto {
  businessExpenseID: string;
  expenseDate: string;
  amount: number;
  description: string;
  notes: string | null;
  businessSupplyCategoryID: string | null;
  categoryName: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateBusinessExpenseParams {
  expenseDate: string;
  amount: number;
  description: string;
  notes?: string | null;
  businessSupplyCategoryID?: string | null;
}

export interface UpdateBusinessExpenseParams {
  businessExpenseID: string;
  expenseDate?: string | null;
  amount?: number | null;
  description?: string | null;
  notes?: string | null;
  businessSupplyCategoryID?: string | null;
}

export type BusinessExpenseListResponse = ApiResponse<BusinessExpenseDto[]>;
export type BusinessExpenseResponse = ApiResponse<BusinessExpenseDto>;

// ─── Shift Management ────────────────────────────────────────────────────────

export interface OpenShiftParams {
  openingCash: number;
  notes?: string | null;
}

export interface CloseShiftParams {
  cashierShiftID: string;
  actualCash: number;
  mpin: string;
  notes?: string | null;
}

export interface CashierShiftDto {
  cashierShiftID: string;
  shiftNumber: string;
  cashierUserID: string;
  cashierName: string;
  status: "Open" | "Closed";
  openedAt: string;
  closedAt: string | null;
  openingCash: number;
  actualCash: number | null;
  notes: string | null;
}

export interface ShiftSummaryDto extends CashierShiftDto {
  cashSales: number;
  nonCashSales: number;
  totalSales: number;
  transactionCount: number;
  totalRefunds: number;
  expectedCash: number;
  overShort: number | null;
  byPaymentMethod: Record<string, number>;
}

export type ActiveShiftResponse = ApiResponse<ShiftSummaryDto | null>;
export type ShiftResponse = ApiResponse<CashierShiftDto>;
export type ShiftSummaryResponse = ApiResponse<ShiftSummaryDto>;
export type ShiftListResponse = ApiResponse<CashierShiftDto[]>;
export type DeleteShiftResponse = ApiResponse<string>;

// ─── Promo Management ────────────────────────────────────────────────────────

export type PromoType = "PercentageDiscount" | "FixedDiscount" | "BuyXGetY" | "Bundle";
export type PromoStatus = "Draft" | "Active" | "Inactive" | "Scheduled" | "Expired";

export interface PromoItemDto {
  promoItemID: string;
  /** Set when this item targets a specific product. Null when it targets a category or variant. */
  productID: string | null;
  productName: string | null;
  /** Set when this item targets a whole category (auto-expands to sub-categories at sale time). */
  productCategoryID: string | null;
  productCategoryName: string | null;
  /** Set when this item targets a specific product variant. Null when targeting product or category. */
  productVariantID: string | null;
  productVariantName: string | null;
  quantity: number;
  isFreeItem: boolean;
}

export interface PromoDto {
  promoID: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  type: PromoType;
  status: PromoStatus;
  discountPercent: number | null;
  discountAmount: number | null;
  buyQuantity: number | null;
  getQuantity: number | null;
  bundlePrice: number | null;
  startDate: string | null;
  endDate: string | null;
  originalPrice: number | null;
  promoPrice: number | null;
  estimatedCost: number | null;
  estimatedProfit: number | null;
  estimatedMargin: number | null;
  isAiGenerated: boolean;
  reason: string | null;
  createdAt: string;
  items: PromoItemDto[];
  /** CRM targeting: restrict to a customer segment (1=New, 2=Regular, 3=VIP, 4=Occasional, 5=AtRisk). Null = all customers. */
  targetSegment: number | null;
  /** CRM targeting: customer must have totalStamps >= this value. Null = no requirement. */
  minLoyaltyStamps: number | null;
  /** Count of customers explicitly pinned to this promo. Drives the "Pinned N" badge in the list. */
  targetCustomerCount: number;
  /** True if this promo has explicit customer assignments (customer-specific); false if it applies to all customers. */
  isCustomerSpecific: boolean;
}

/** Customer pinned to a promo (returned by GET /Promo/{id}/customers). */
export interface AssignedCustomerDto {
  customerID: string;
  customerNumber: string;
  fullName: string;
  phone: string | null;
  segment: number;
}

export type AssignedCustomerListResponse = ApiResponse<AssignedCustomerDto[]>;

export interface CustomerPromoProductItemDto {
  productID: string;
  productName: string;
  imageUrl: string | null;
  originalPrice: number;
  adjustedPrice: number;
  isFreeItem: boolean;
}

export interface CustomerPromoProductDto {
  promoID: string;
  title: string;
  type: PromoType;
  discountPercent: number | null;
  discountAmount: number | null;
  items: CustomerPromoProductItemDto[];
}

export type CustomerPromoProductListResponse = ApiResponse<CustomerPromoProductDto[]>;

export interface PromoSuggestionDto {
  promoType: number;
  description: string;
  originalPrice: number;
  promoPrice: number;
  cost: number;
  profit: number;
  margin: number;
  reason: string;
  suggestedProductIDs: string[];
  suggestedDiscountPercent?: number | null;
  suggestedDiscountAmount?: number | null;
  suggestedBuyQuantity?: number | null;
  suggestedGetQuantity?: number | null;
  suggestedBundlePrice?: number | null;
}

export interface PromoItemInput {
  /** Exactly one of productID / productCategoryID / productVariantID must be set per item. */
  productID?: string | null;
  productCategoryID?: string | null;
  productVariantID?: string | null;
  quantity: number;
  isFreeItem: boolean;
}

export interface PromoCalculateRequest {
  promoType: number;
  discountPercent?: number | null;
  discountAmount?: number | null;
  buyQuantity?: number | null;
  getQuantity?: number | null;
  bundlePrice?: number | null;
  items: PromoItemInput[];
}

export interface PromoCalculateResult {
  originalPrice: number;
  finalPrice: number;
  totalCost: number;
  profit: number;
  marginPercent: number;
  isViable: boolean;
  hasCostData: boolean;
}

export interface CreatePromoParams {
  title: string;
  description?: string | null;
  imageFile?: File | null;
  type: number;
  discountPercent?: number | null;
  discountAmount?: number | null;
  buyQuantity?: number | null;
  getQuantity?: number | null;
  bundlePrice?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  reason?: string | null;
  isAiGenerated: boolean;
  items: PromoItemInput[];
  targetSegment?: number | null;
  minLoyaltyStamps?: number | null;
  targetCustomerIds?: string[];
}

export interface UpdatePromoParams {
  promoID: string;
  description?: string | null;
  imageUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  targetSegment?: number | null;
  minLoyaltyStamps?: number | null;
  targetCustomerIds?: string[];
}

export interface AssignPromoCustomersParams {
  customerIds: string[];
}

export type PromoResponse = ApiResponse<PromoDto>;
export type PromoListResponse = ApiResponse<PromoDto[]>;
export type PromoSuggestionListResponse = ApiResponse<PromoSuggestionDto[]>;
export type PromoCalculateResponse = ApiResponse<PromoCalculateResult>;

// ===== Product Variants =====
export interface ProductVariantDto {
  productVariantID: string;
  productID: string;
  name: string;
  price: number;
  displayOrder: number;
  isActive: boolean;
}
export interface CreateProductVariantDto {
  productID: string;
  name: string;
  price: number;
  displayOrder: number;
}
export interface UpdateProductVariantDto extends CreateProductVariantDto {
  productVariantID: string;
}
export type ProductVariantResponse = ApiResponse<ProductVariantDto>;
export type ProductVariantListResponse = ApiResponse<ProductVariantDto[]>;

// ===== Product Add-Ons =====
export interface ProductAddOnItemDto {
  productAddOnItemID: string;
  productAddOnGroupID: string;
  name: string;
  additionalPrice: number;
  displayOrder: number;
  isActive: boolean;
}
export interface ProductAddOnGroupDto {
  productAddOnGroupID: string;
  productID: string;
  name: string;
  isRequired: boolean;
  minSelections: number;
  maxSelections: number;
  displayOrder: number;
  isActive: boolean;
  items: ProductAddOnItemDto[];
}
export interface CreateProductAddOnGroupItemDto {
  name: string;
  additionalPrice: number;
  displayOrder: number;
}
export interface CreateProductAddOnGroupDto {
  productID: string;
  name: string;
  isRequired: boolean;
  minSelections: number;
  maxSelections: number;
  displayOrder: number;
  items?: CreateProductAddOnGroupItemDto[];
}
export interface UpdateProductAddOnGroupDto {
  productAddOnGroupID: string;
  productID: string;
  name: string;
  isRequired: boolean;
  minSelections: number;
  maxSelections: number;
  displayOrder: number;
}
export interface AddProductAddOnItemDto {
  productAddOnGroupID: string;
  name: string;
  additionalPrice: number;
  displayOrder: number;
}
export interface UpdateProductAddOnItemDto extends AddProductAddOnItemDto {
  productAddOnItemID: string;
}
export type ProductAddOnGroupResponse = ApiResponse<ProductAddOnGroupDto>;
export type ProductAddOnGroupListResponse = ApiResponse<ProductAddOnGroupDto[]>;
export type ProductAddOnItemResponse = ApiResponse<ProductAddOnItemDto>;

// ── Bulk product creation ────────────────────────────────────────────────────
export interface BulkCreateVariantItem {
  name: string;
  price: number;
  displayOrder?: number;
}
export interface BulkCreateAddOnItem {
  name: string;
  additionalPrice?: number;
  displayOrder?: number;
}
export interface BulkCreateAddOnGroup {
  name: string;
  isRequired?: boolean;
  minSelections?: number;
  maxSelections?: number;
  displayOrder?: number;
  items: BulkCreateAddOnItem[];
}
export interface BulkCreateProductItem {
  name: string;
  description?: string;
  unitPrice?: number;
  costPrice?: number;
  purchaseQuantity?: number;
  purchaseUnitID?: string;
  stockUnitID?: string;
  isMenuItem: boolean;
  imageUrl?: string;
  productCategoryID?: string;
  ingredientCategoryID?: string;
  brandID?: string;
  variants?: BulkCreateVariantItem[];
  addOnGroups?: BulkCreateAddOnGroup[];
}
export interface BulkCreateProductParams {
  products: BulkCreateProductItem[];
}
export interface BulkCreateError {
  index: number;
  name: string;
  messages: string[];
}
export interface BulkCreatedProduct {
  productID: string;
  name: string;
}
export interface BulkCreateProductResult {
  created: number;
  failed: number;
  products: BulkCreatedProduct[];
  errors: BulkCreateError[];
}
export type BulkCreateProductResponse = ApiResponse<BulkCreateProductResult>;

// ── Excel import ─────────────────────────────────────────────────────────────
export interface ImportExcelParams {
  file: File;
}
export type ImportExcelResponse = BulkCreateProductResponse;

// ── Variant templates ─────────────────────────────────────────────────────────
export interface ProductVariantTemplateItemDto {
  productVariantTemplateItemID: string;
  name: string;
  defaultPrice: number;
  displayOrder: number;
  isActive: boolean;
}
export interface ProductVariantTemplateDto {
  productVariantTemplateID: string;
  name: string;
  description?: string;
  items: ProductVariantTemplateItemDto[];
}
export type ProductVariantTemplateResponse = ApiResponse<ProductVariantTemplateDto>;
export type ProductVariantTemplateListResponse = ApiResponse<ProductVariantTemplateDto[]>;

export interface CreateVariantTemplateItemDto {
  name: string;
  defaultPrice: number;
  displayOrder: number;
}
export interface CreateVariantTemplateParams {
  name: string;
  description?: string;
  items: CreateVariantTemplateItemDto[];
}

export interface UpdateVariantTemplateItemDto {
  productVariantTemplateItemID?: string;
  name: string;
  defaultPrice: number;
  displayOrder: number;
  isActive: boolean;
}
export interface UpdateVariantTemplateParams {
  productVariantTemplateID: string;
  name: string;
  description?: string;
  items: UpdateVariantTemplateItemDto[];
}

export interface ApplyVariantOverride {
  productVariantTemplateItemID: string;
  name?: string;
  price?: number;
}
export interface ApplyVariantTemplateParams {
  productID: string;
  templateID: string;
  overrides?: ApplyVariantOverride[];
}
export type ApplyVariantTemplateResponse = ApiResponse<number>;

// ── Add-on templates ──────────────────────────────────────────────────────────
export interface ProductAddOnTemplateItemDto {
  productAddOnTemplateItemID: string;
  name: string;
  additionalPrice: number;
  displayOrder: number;
}
export interface ProductAddOnTemplateGroupDto {
  productAddOnTemplateGroupID: string;
  name: string;
  isRequired: boolean;
  minSelections: number;
  maxSelections: number;
  displayOrder: number;
  items: ProductAddOnTemplateItemDto[];
}
export interface ProductAddOnTemplateDto {
  productAddOnTemplateID: string;
  name: string;
  description?: string;
  groups: ProductAddOnTemplateGroupDto[];
}
export type ProductAddOnTemplateResponse = ApiResponse<ProductAddOnTemplateDto>;
export type ProductAddOnTemplateListResponse = ApiResponse<ProductAddOnTemplateDto[]>;

export interface CreateAddOnTemplateItemDto {
  name: string;
  additionalPrice: number;
  displayOrder: number;
}
export interface CreateAddOnTemplateGroupDto {
  name: string;
  isRequired: boolean;
  minSelections: number;
  maxSelections: number;
  displayOrder: number;
  items: CreateAddOnTemplateItemDto[];
}
export interface CreateAddOnTemplateParams {
  name: string;
  description?: string;
  groups: CreateAddOnTemplateGroupDto[];
}

export interface UpdateAddOnTemplateItemDto {
  productAddOnTemplateItemID?: string;
  name: string;
  additionalPrice: number;
  displayOrder: number;
  isActive: boolean;
}
export interface UpdateAddOnTemplateGroupDto {
  productAddOnTemplateGroupID?: string;
  name: string;
  isRequired: boolean;
  minSelections: number;
  maxSelections: number;
  displayOrder: number;
  isActive: boolean;
  items: UpdateAddOnTemplateItemDto[];
}
export interface UpdateAddOnTemplateParams {
  productAddOnTemplateID: string;
  name: string;
  description?: string;
  groups: UpdateAddOnTemplateGroupDto[];
}

export interface ApplyAddOnTemplateParams {
  productID: string;
  templateID: string;
}
export type ApplyAddOnTemplateResponse = ApiResponse<number>;

// ===== Product Performance =====
export interface ProductVariantPerformanceDto {
  productVariantID: string | null;
  variantName: string;
  quantitySold: number;
  revenue: number;
  transactionCount: number;
}

export interface ProductAddOnPerformanceDto {
  productAddOnItemID: string | null;
  groupName: string;
  itemName: string;
  timesOrdered: number;
  revenue: number;
}

export interface ProductPerformanceItemDto {
  productID: string;
  productName: string;
  categoryName: string | null;
  quantitySold: number;
  revenue: number;
  transactionCount: number;
  movementTag: "slow" | "normal" | "fast";
  variants: ProductVariantPerformanceDto[];
  addOns: ProductAddOnPerformanceDto[];
}
export interface ProductPerformanceReportDto {
  from: string;
  to: string;
  slowThreshold: number;
  fastThreshold: number;
  totalMenuItems: number;
  slowMovingCount: number;
  normalCount: number;
  fastMovingCount: number;
  items: ProductPerformanceItemDto[];
}
export interface SlowMovingPromoSuggestionDto extends PromoSuggestionDto {
  productID: string;
  productName: string;
  quantitySold: number;
  revenue: number;
}
export interface ProductPerformanceQueryParams {
  From?: string;
  To?: string;
  SlowThreshold?: number;
  FastThreshold?: number;
}
export interface SlowMovingPromoQueryParams {
  From?: string;
  To?: string;
  SlowThreshold?: number;
  MaxSuggestions?: number;
}
export type ProductPerformanceReportResponse = ApiResponse<ProductPerformanceReportDto>;
export type SlowMovingPromoSuggestionListResponse = ApiResponse<SlowMovingPromoSuggestionDto[]>;

// ─── Financial Report ─────────────────────────────────────────────────────────

export interface FinancialReportVariantRevenueDto {
  variantName: string;
  quantitySold: number;
  revenue: number;
}

export interface FinancialReportProductRevenueItemDto {
  productID: string;
  productName: string;
  categoryName: string | null;
  quantitySold: number;
  revenue: number;
  variants: FinancialReportVariantRevenueDto[];
}

export interface FinancialReportDto {
  from: string;
  to: string;
  grossSale: number;
  completedSalesCount: number;
  operationalExpenses: number;
  operationalExpensesPending: number;
  businessSupplyExpenses: number;
  businessSupplyExpensesPending: number;
  totalExpenses: number;
  totalExpensesPending: number;
  paidInvoiceCount: number;
  businessSupplyInvoiceCount: number;
  directStockValue: number;
  directStockItemCount: number;
  totalInventoryItems: number;
  outOfStockCount: number;
  lowStockCount: number;
  costOfGoodsSold: number;
  grossProfit: number;
  netProfit: number;
  revenueByProduct: FinancialReportProductRevenueItemDto[];
  promoPerformance: PromoPerformanceItemDto[];
}

export interface PromoPerformanceItemDto {
  promoID: string;
  promoTitle: string;
  promoType: string;
  usageCount: number;
  totalDiscountGiven: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface FinancialReportQueryParams {
  From?: string;
  To?: string;
}

export type FinancialReportResponse = ApiResponse<FinancialReportDto>;

// ─── Sales Forecast ──────────────────────────────────────────────────────────

export interface SalesForecastDailyDto {
  date: string;
  dayOfWeek: string;
  actualRevenue: number | null;
  forecastedRevenue: number;
}

export interface SalesForecastResponseDto {
  forecastWeekStart: string;
  forecastWeekEnd: string;
  totalForecastedRevenue: number;
  previousWeekRevenue: number;
  trendPercent: number;
  trendDirection: "up" | "down" | "flat";
  days: SalesForecastDailyDto[];
  insight: string | null;
  isAiGenerated: boolean;
  generatedAt: string;
}

export type SalesForecastResponse = ApiResponse<SalesForecastResponseDto>;

// ─── Sales Insight ────────────────────────────────────────────────────────────

export interface SalesInsightDto {
  summary: string;
  highlights: string[];
  recommendations: string[];
  isAiGenerated: boolean;
  periodLabel: string;
  from: string;
  to: string;
}

export interface SalesInsightQueryParams {
  From?: string;
  To?: string;
}

export type SalesInsightResponse = ApiResponse<SalesInsightDto>;

// ─── Customer Dashboard API ────────────────────────────────────────────────────
// Self-service customer portal endpoints under /api/v1/customer-api/customerdashboard.
// These DTOs are intentionally separate from the staff DTOs above: the customer
// surface hides stock/cost and returns numeric promo/order codes.

/** Customer-facing promo. Note `type`/`status` are numeric codes here (unlike the
 *  staff `PromoDto` which uses string unions). 1=Percentage,2=Fixed,3=BuyXGetY,4=Bundle;
 *  status 2=Active,4=Scheduled. */
export interface CustomerPromoDto {
  promoID: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  type: number;
  status: number;
  discountPercent: number | null;
  discountAmount: number | null;
  buyQuantity: number | null;
  getQuantity: number | null;
  bundlePrice: number | null;
  startDate: string | null;
  endDate: string | null;
  targetSegment: number | null;
}
export type CustomerPromoListResponse = ApiResponse<CustomerPromoDto[]>;

export interface CustomerMenuAddOnItemDto {
  productAddOnItemID: string;
  name: string;
  additionalPrice: number;
}
export interface CustomerMenuAddOnGroupDto {
  productAddOnGroupID: string;
  name: string;
  isRequired: boolean;
  items: CustomerMenuAddOnItemDto[];
}
export interface CustomerMenuVariantDto {
  productVariantID: string;
  name: string;
  price: number;
}
/** A menu item as seen by customers. No stock/cost fields are exposed; `isAvailable`
 *  is the only stock signal (true only when in stock). */
export interface CustomerMenuItemDto {
  productID: string;
  name: string;
  description?: string | null;
  sellingPrice: number;  // Change from 'price' to 'sellingPrice'
  price?: number; // Keep for compatibility if needed
  imageUrl: string | null;
  categoryID: string | null;
  categoryName: string | null;
  isAvailable: boolean;
  isOutOfStock: boolean;
  currentStock: number;
  variants: CustomerMenuVariantDto[];
  addOnGroups: CustomerMenuAddOnGroupDto[];
}

export type CustomerMenuResponse = ApiResponse<PaginatedResponse<CustomerMenuItemDto>>;

export interface CustomerMenuQueryParams {
  categoryId?: string;
  search?: string;
  pageNumber?: number;
  pageSize?: number;
}

export enum CustomerOrderStatus {
  OrderReceived = 1,
  OrderTaken = 2,
  PaymentReceived = 3,
  OrderConfirmed = 4,
  OrderQueued = 5,
  OrderAccepted = 6,
  InPreparation = 7,
  FinalizingOrder = 8,
  ReadyForPickup = 9,
  PickedUp = 10,
  OrderCompleted = 11,
  Cancelled = 12,
  Remake = 13,
}

export interface CustomerOrderItemDto {
  customerOrderItemID: string;
  productID: string;
  productName: string;
  productVariantID: string | null;
  variantName: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  /** JSON string of applied add-ons, e.g. '[{"AddOnItemID":"..","Name":"..","Price":25}]'. Null when none. */
  addOnsJson: string | null;
}

export interface CustomerOrderDto {
  customerOrderID: string;
  orderNumber: string;
  status: CustomerOrderStatus;
  statusLabel: string;
  paymentReference: string | null;
  specialInstructions: string | null;
  totalAmount: number;
  createdAt: string;
  items: CustomerOrderItemDto[];
}

/** Returned by checkout and single-order endpoints; adds the resolved customer name. */
export interface CustomerOrderDetailDto extends CustomerOrderDto {
  customerName: string;
}

export type CustomerOrderListResponse = ApiResponse<CustomerOrderDto[]>;
export type CustomerOrderResponse = ApiResponse<CustomerOrderDetailDto>;

export interface CustomerOrderQueryParams {
  status?: number;
  search?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface UpdateOrderStatusParams {
  status: number;
}

export interface SetPaymentReferenceParams {
  paymentReference: string;
}

export interface CustomerLoyaltyCardDto {
  customerLoyaltyCardID: string;
  totalStamps: number;
  availableRewards: number;
  totalRewardsEarned: number;
  totalRewardsRedeemed: number;
  lastStampedAt: string | null;
  lastRedeemedAt: string | null;
  stampsUntilNextReward: number;
}

export interface CustomerLoyaltyDto {
  customerID: string;
  firstName: string;
  lastName: string;
  loyaltyCard: CustomerLoyaltyCardDto | null;
}
export type CustomerLoyaltyResponse = ApiResponse<CustomerLoyaltyDto>;

export interface CustomerCheckoutItemParams {
  productID: string;
  productVariantID?: string | null;
  quantity: number;
  unitPrice: number;
  addOnsJson?: string | null;
}
export interface CustomerCheckoutParams {
  items: CustomerCheckoutItemParams[];
  specialInstructions?: string | null;
}

// ===== Facebook Post Management =====

export enum FacebookPostStatus {
  Draft = 1,
  Published = 2,
  Scheduled = 3,
}

export interface FacebookPostDto {
  facebookPostID: string;
  message: string;
  imageUrls: string[];
  status: FacebookPostStatus;
  statusName: string;
  scheduledAt: string | null;
  facebookGraphPostId: string | null;
  postedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface FacebookPageInfoDto {
  pageId: string;
  name: string;
  pictureUrl: string | null;
}

export interface CreateFacebookPostParams {
  message: string;
  imageFiles?: File[];
  status: FacebookPostStatus;
  scheduledAt?: string | null;
}

export interface UpdateFacebookPostParams {
  facebookPostID: string;
  message?: string | null;
  imageFiles?: File[];
  removeAllImages?: boolean;
  status?: FacebookPostStatus | null;
  scheduledAt?: string | null;
}

export interface FacebookReconnectParams {
  pageAccessToken: string;
  pageId?: string;
}

export interface FacebookConnectionStatusDto {
  isConnected: boolean;
  pageName: string | null;
  pageId: string | null;
  pictureUrl: string | null;
  errorMessage: string | null;
}

export type FacebookPostListResponse = ApiResponse<FacebookPostDto[]>;
export type FacebookPostResponse = ApiResponse<FacebookPostDto>;
export type FacebookPageInfoResponse = ApiResponse<FacebookPageInfoDto>;
export type FacebookConnectionStatusResponse = ApiResponse<FacebookConnectionStatusDto>;

export interface FacebookOAuthUrlDto {
  authorizationUrl: string;
  state: string;
}
export type FacebookOAuthUrlResponse = ApiResponse<FacebookOAuthUrlDto>;

// ===== Unit Conversion Dependency Detection =====

export interface AffectedProductDto {
  productID: string;
  name: string;
  fromUnit: string;
  toUnit: string;
}

export interface AffectedRecipeDto {
  recipeID: string;
  productName: string;
  unitName: string;
}

export interface UnitConversionDependenciesDto {
  unitConversionID: string;
  fromUnitName: string;
  toUnitName: string;
  conversionRate: number;
  affectedProducts: AffectedProductDto[];
  affectedRecipes: AffectedRecipeDto[];
  hasDependencies: boolean;
}

export type UnitConversionDependenciesResponse = ApiResponse<UnitConversionDependenciesDto>;

// ── Promo Feasibility ────────────────────────────────────────────────────────

export interface PromoFeasibilityItemRequestDto {
  productID: string;
  quantity: number;
  isFreeItem: boolean;
  /** Current stock from SellableProductDto — used as fallback when product has no direct Inventory record (menu items with recipes). */
  currentStock?: number;
  /** Product display name fallback when no Inventory record exists. */
  productName?: string;
}

export interface PromoFeasibilityRequestDto {
  type: number; // PromoType enum: 1=Percentage,2=Fixed,3=BuyXGetY,4=Bundle
  buyQuantity: number;
  getQuantity: number;
  bundlePrice?: number;
  startDate?: string; // ISO date "YYYY-MM-DD"
  endDate?: string;
  items: PromoFeasibilityItemRequestDto[];
}

export interface PromoFeasibilityItemResultDto {
  productID: string;
  productName: string;
  currentStock: number;
  reorderLevel: number;
  minimumStockLevel: number;
  maxUsesFromStock: number;
  averageDailyUsage?: number;
  projectedStockAfterPeriod?: number;
  willHitReorder: boolean;
  willHitLowStock: boolean;
  willGoOutOfStock: boolean;
  shortfall?: number;
}

export interface PromoFeasibilityResultDto {
  canFulfillCount: number;
  customerCapacity?: number;
  stockIsAdequate: boolean;
  scheduledDays?: number;
  items: PromoFeasibilityItemResultDto[];
}

export type PromoFeasibilityResponse = ApiResponse<PromoFeasibilityResultDto>;

// ─── User Presence / Who's Online ─────────────────────────────────────────────
export interface UserPresenceDto {
  userID: string;
  displayName: string;
  role: string;
  currentActivity: string;
  connectedAt: string;
  lastSeen: string;
}

export interface UpdateActivityParams {
  activity: string;
}

// ─── Recipe Import ────────────────────────────────────────────────────────────
export interface IngredientPreviewItemDto {
  name: string;
  packagePrice: number;
  qtyPerPack: number;
  unitName: string;
  unitCost: number;
  alreadyExistsInDb: boolean;
  unitExistsInDb: boolean;
  warnings: string[];
  categoryID?: string;
}

export interface RecipeItemPreviewDto {
  ingredientName: string;
  quantityRequired: number;
  unitName: string;
  ingredientExistsInDb: boolean;
  unitExistsInDb: boolean;
  warnings: string[];
  ingredientCategoryID?: string;
  packagePrice: number;
  qtyPerPack: number;
  ingredientDescription?: string;
  purchaseUnitID?: string;
  stockUnitID?: string;
}

export interface RecipePreviewItemDto {
  menuItemName: string;
  menuItemAlreadyExistsInDb: boolean;
  hasExistingActiveRecipe: boolean;
  estimatedCostPerServing: number;
  sellingPrice: number;
  foodCostPercent: number;
  grossProfitPerServing: number;
  items: RecipeItemPreviewDto[];
  warnings: string[];
  hasExistingVariants: boolean;
  existingVariantCount: number;
  hasExistingAddOnGroups: boolean;
  existingAddOnGroupCount: number;
  categoryID?: string;
  variantGroup?: string;
  variantSize?: string;
  description?: string;
  materialCost?: number;
}

export interface RecipeImportPreviewDto {
  recipes: RecipePreviewItemDto[];
  globalWarnings: string[];
}

export type RecipeImportPreviewResponse = ApiResponse<RecipeImportPreviewDto>;

export interface ImportIngredientItemDto {
  name: string;
  packagePrice: number;
  qtyPerPack: number;
  unitName: string;
  categoryID: string;
}

export interface ImportRecipeItemDto {
  ingredientName: string;
  quantityRequired: number;
  unitName: string;
  ingredientCategoryID?: string | null;
  packagePrice: number;
  qtyPerPack: number;
  ingredientExistsInDb: boolean;
  ingredientDescription?: string | null;
  purchaseUnitID?: string | null;
  stockUnitID?: string | null;
}

export interface ImportMenuItemDto {
  menuItemName: string;
  sellingPrice: number;
  categoryID: string;
  recipeItems: ImportRecipeItemDto[];
  variantGroup?: string | null;
  variantName?: string | null;
  description?: string | null;
  materialCost?: number | null;
}

export interface ImportRecipeExcelDto {
  password: string;
  mpin: string;
  recipes: ImportMenuItemDto[];
}

export interface RecipeImportResultDto {
  unitsCreated: number;
  ingredientsCreated: number;
  ingredientsSkipped: number;
  menuItemsCreated: number;
  menuItemsSkipped: number;
  recipesCreated: number;
  recipesSkipped: number;
  errors: string[];
}

export type RecipeImportResultResponse = ApiResponse<RecipeImportResultDto>;

export interface RecipeImportStagingResultDto {
  batchID: string;
  batchCode: string;
  ingredientsStaged: number;
  ingredientsSkipped: number;
  menuItemsStaged: number;
  menuItemsSkipped: number;
  recipesStaged: number;
  recipesSkipped: number;
  warnings: string[];
}

export interface RecipeImportBatchSummaryDto {
  batchID: string;
  batchCode: string;
  importedAt: string;
  importedByName: string;
  status: "Pending" | "Synced" | "Reverted" | "Discarded";
  totalIngredients: number;
  totalMenuItems: number;
  totalRecipes: number;
  syncedMenuItemCount: number;
  syncedAt: string | null;
  revertedAt: string | null;
}

export interface RecipeImportSyncResultDto {
  ingredientsCreated: number;
  menuItemsCreated: number;
  recipesCreated: number;
  errors: string[];
}

export type RecipeImportStagingResponse = ApiResponse<RecipeImportStagingResultDto>;
export type RecipeImportBatchListResponse = ApiResponse<RecipeImportBatchSummaryDto[]>;
export type RecipeImportSyncResponse = ApiResponse<RecipeImportSyncResultDto>;

export interface StagedIngredientDto {
  ingredientStagingID: string;
  name: string;
  packagePrice: number;
  qtyPerPack: number;
  unitName: string;
  categoryName: string;
  isSynced: boolean;
}

export interface StagedMenuItemDto {
  menuItemStagingID: string;
  menuItemName: string;
  sellingPrice: number;
  categoryName: string;
  description?: string | null;
  materialCost?: number | null;
  isSynced: boolean;
}

export interface StagedRecipeItemDto {
  ingredientName: string;
  quantityRequired: number;
  unitName: string;
  packagePrice: number;
  qtyPerPack: number;
  estimatedIngredientCost: number;
  isIngredientSynced: boolean;
}

export interface StagedRecipeDto {
  recipeStagingID: string;
  menuItemName: string;
  estimatedCostPerServing: number;
  items: StagedRecipeItemDto[];
  variantName?: string | null;
  variantPrice?: number | null;
  isSynced: boolean;
}

export interface RecipeImportBatchDetailDto {
  batchID: string;
  batchCode: string;
  importedAt: string;
  importedByName: string;
  status: string;
  syncedAt: string | null;
  revertedAt: string | null;
  syncedMenuItemCount: number;
  ingredients: StagedIngredientDto[];
  menuItems: StagedMenuItemDto[];
  recipes: StagedRecipeDto[];
}

export interface RecipeImportStepSyncResultDto {
  stepProcessed: number;
  totalMenuItems: number;
  syncedSoFar: number;
  isComplete: boolean;
  ingredientsCreated: number;
  recipesCreated: number;
  errors: string[];
}

export interface RevertBatchAffectedProductDto {
  productName: string;
  isMenuItem: boolean;
  currentQuantity: number;
}

export interface RevertBatchSafetyDto {
  hasInventory: boolean;
  inventoryCount: number;
  affectedProducts: RevertBatchAffectedProductDto[];
}
