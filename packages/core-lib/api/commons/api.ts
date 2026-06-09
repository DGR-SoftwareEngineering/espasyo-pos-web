import { AxiosInstance } from "axios";
import qs from "query-string";
import { ApiResponse } from "../types";
import {
  BusinessExpenseListResponse,
  BusinessExpenseResponse,
  CategoryListResponse,
  ChartDataApiResponse,
  ChartQueryParams,
  CreateBusinessExpenseParams,
  CreateCategoryParams,
  CreatePaymentParams,
  CreateProductParams,
  CreatePurchaseOrderParams,
  CreateReceiptParams,
  CreateSupplierInvoiceParams,
  UpdateBusinessExpenseParams,
  UpdateProductParams,
  UpdatePurchaseOrderParams,
  UpdateSupplierInvoiceParams,
  CreateUnitConversionParams,
  DetectGapResponseDto,
  NotificationCountResponse,
  NotificationListResponse,
  NotificationQueryParams,
  NotificationResponse,
  PaymentListResponse,
  PaymentQueryParams,
  PaymentResponse,
  ProductionCapacityResponse,
  ProductListResponse,
  PurchaseOrderListResponse,
  PurchaseOrderQueryParams,
  PurchaseOrderResponse,
  ReceiptListResponse,
  ReceiptResponse,
  RecipeListResponse,
  RecipeParams,
  RecipeResponse,
  SupplierInvoiceListResponse,
  SupplierInvoiceQueryParams,
  SupplierInvoiceResponse,
  UnitConversionListResponse,
  UpdateRecipeParams,
  UserInfoResponse,
} from "./types";
import {
  AdjustStockParams,
  CreateInventoryParams,
  InventoryListResponse,
  InventoryResponse,
  LowStockResponse,
  StockMovementArrayResponse,
  StockMovementListResponse,
  StockMovementResponse,
  StockMovementType,
  UpdateInventoryParams,
} from "./types";
import {
  BrandListResponse,
  BrandResponse,
  CreateBrandParams,
  CreateBusinessSupplyCategoryParams,
  CreateIngredientCategoryParams,
  CreateLocationParams,
  CreateProductCategoryParams,
  CreateUnitParams,
  BusinessSupplyCategoryDto,
  IngredientCategoryListResponse,
  IngredientCategoryResponse,
  LocationListResponse,
  LocationResponse,
  ProductCategoryListResponse,
  ProductCategoryResponse,
  UnitListResponse,
  UnitResponse,
  UpdateBrandParams,
  UpdateBusinessSupplyCategoryParams,
  UpdateIngredientCategoryParams,
  UpdateLocationParams,
  UpdateProductCategoryParams,
  UpdateUnitParams,
} from "./types";
import {
  CreateUserParams,
  RoleListResponse,
  UpdateUserParams,
  UserArrayResponse,
  UserListResponse,
  UserResponse,
} from "./types";
import {
  CreateSupplierParams,
  SupplierListResponse,
  SupplierResponse,
  UpdateSupplierParams,
} from "./types";
import {
  AuditLogListResponse,
  AuditLogQueryParams,
  AuditLogResponse,
  BulkUpdateContentBlockParams,
  BulkUpdateSystemSettingParams,
  ContentBlockListResponse,
  ContentBlockResponse,
  CreateContentBlockParams,
  CreateDocumentationParams,
  DocumentationListResponse,
  DocumentationResponse,
  FacebookPageInfoResponse,
  FacebookPostListResponse,
  FacebookPostResponse,
  FacebookConnectionStatusResponse,
  CreateFacebookPostParams,
  UpdateFacebookPostParams,
  FacebookReconnectParams,
  SystemSettingListResponse,
  SystemSettingResponse,
  UpdateContentBlockParams,
  UpdateDocumentationParams,
  UpdateSystemSettingParams,
  UploadSettingImageParams,
} from "./types";
import { AdminConfirmationParams } from "../authentication/types";
import {
  BackupHistoryListResponse,
  ExportBackupParams,
  ImportBackupParams,
  ImportPreviewResponse,
  ImportResultResponse,
  PreviewImportParams,
} from "./types";
import {
  CreateSaleParams,
  DailySalesSummaryResponse,
  OrderDetailResponse,
  OrderListResponse,
  OrderQueryParams,
  RefundSaleParams,
  SaleListResponse,
  SaleQueryParams,
  SaleResponse,
  SellableProductListResponse,
  SellableProductQueryParams,
  VoidSaleParams,
  ActiveShiftResponse,
  ShiftResponse,
  ShiftSummaryResponse,
  ShiftListResponse,
  OpenShiftParams,
  CloseShiftParams,
  CreatePromoParams,
  UpdatePromoParams,
  PromoCalculateRequest,
  PromoResponse,
  PromoListResponse,
  PromoSuggestionListResponse,
  PromoCalculateResponse,
  AssignedCustomerListResponse,
  AssignPromoCustomersParams,
  CustomerPromoProductListResponse,
  ProductPerformanceQueryParams,
  ProductPerformanceReportResponse,
  SlowMovingPromoQueryParams,
  SlowMovingPromoSuggestionListResponse,
  FinancialReportQueryParams,
  FinancialReportResponse,
  SalesForecastResponse,
  CreateProductVariantDto,
  UpdateProductVariantDto,
  ProductVariantResponse,
  ProductVariantListResponse,
  CreateProductAddOnGroupDto,
  UpdateProductAddOnGroupDto,
  AddProductAddOnItemDto,
  UpdateProductAddOnItemDto,
  ProductAddOnGroupResponse,
  ProductAddOnGroupListResponse,
  ProductAddOnItemResponse,
  BulkCreateProductParams,
  BulkCreateProductResponse,
  ImportExcelParams,
  ImportExcelResponse,
  ProductVariantTemplateListResponse,
  ProductVariantTemplateResponse,
  CreateVariantTemplateParams,
  UpdateVariantTemplateParams,
  ApplyVariantTemplateParams,
  ApplyVariantTemplateResponse,
  ProductAddOnTemplateListResponse,
  ProductAddOnTemplateResponse,
  CreateAddOnTemplateParams,
  UpdateAddOnTemplateParams,
  ApplyAddOnTemplateParams,
  ApplyAddOnTemplateResponse,
} from "./types";
import {
  CustomerCheckoutParams,
  CustomerLoyaltyResponse,
  CustomerMenuQueryParams,
  CustomerMenuResponse,
  CustomerOrderListResponse,
  CustomerOrderQueryParams,
  CustomerOrderResponse,
  CustomerPromoListResponse,
  UpdateOrderStatusParams,
  SetPaymentReferenceParams,
} from "./types";

export class CommonsApi {
  constructor(
    private readonly axios: AxiosInstance,
    private readonly ssrAxios: AxiosInstance,
  ) {} //axios = client-side, ssrAxios = server-side (next)

  public getByUrl<T = unknown>(url: string) {
    return this.axios.get<T>(url);
  }

  public postByUrl<T = unknown>(url: string, body: object) {
    return this.axios.post<T>(url, body);
  }

  public dataSummary<T = Record<string, object>>(
    url: string,
    params: Record<string, any> = {},
  ) {
    return this.axios.get<T>(`${url}?${qs.stringify(params)}`);
  }

  public getChartByKey(chartKey: string, query?: ChartQueryParams) {
    const params: Record<string, unknown> = {};
    if (query) {
      Object.entries(query).forEach(([k, v]) => {
        if (v === undefined || v === null) return;
        if (Array.isArray(v) && v.length === 0) return;
        params[k] = v;
      });
    }
    const search = qs.stringify(params, { arrayFormat: "comma" });
    return this.axios.get<ChartDataApiResponse>(
      `/api/v1/chart-api/Chart/${encodeURIComponent(chartKey)}${search ? `?${search}` : ""}`,
    );
  }

  public getUserById() {
    return this.ssrAxios.get<UserInfoResponse>(`/api/commons/get-user-info`);
  }

  // ===== Notifications =====

  public notificationList(params: NotificationQueryParams = {}) {
    const cleaned: Record<string, unknown> = {};
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      cleaned[k] = v;
    });
    const search = qs.stringify(cleaned);
    return this.axios.get<NotificationListResponse>(
      `/api/v1/notifications-api/Notifications${search ? `?${search}` : ""}`,
    );
  }

  public notificationCount() {
    return this.axios.get<NotificationCountResponse>(
      `/api/v1/notifications-api/Notifications/count`,
    );
  }

  public markNotificationRead(notificationID: string) {
    return this.axios.post<NotificationResponse>(
      `/api/v1/notifications-api/Notifications/${encodeURIComponent(notificationID)}/read`,
      {},
    );
  }

  public markAllNotificationsRead() {
    return this.axios.post<ApiResponse<number>>(
      `/api/v1/notifications-api/Notifications/read-all`,
      {},
    );
  }

  /**
   * Returns the SSE stream URL for live notifications. Caller is responsible
   * for opening the EventSource. The URL is built from the configured API
   * base + the route below.
   */
  public notificationStreamUrl(baseUrl: string, accessToken: string) {
    return `${baseUrl}/api/v1/notifications-api/Notifications/stream?access_token=${encodeURIComponent(accessToken)}`;
  }

  public async getRoleById(roleId?: string) {
    return await this.axios.get<ApiResponse<{ roleName: string }>>(
      `/api/v1/role-api/role/${roleId}`,
    );
  }

  public createNewCategory(params: CreateCategoryParams) {
    return this.axios.post<ApiResponse>(
      `/api/v1/category-api/category`,
      params,
    );
  }

  public categoryList() {
    return this.axios.get<CategoryListResponse>(
      `/api/v1/category-api/category`,
    );
  }

  public updateCategory(params: CreateCategoryParams) {
    return this.axios.put<ApiResponse>(`/api/v1/category-api/category`, params);
  }

  public deleteCategory(id: string[]) {
    return this.axios.delete<ApiResponse>(`/api/v1/category-api/category`, {
      data: { id: id },
    });
  }

  public createNewProduct(params: CreateProductParams) {
    const form = new FormData();
    form.append("Name", params.name);
    form.append("Description", params.description ?? "");
    form.append("IsMenuItem", String(params.isMenuItem));

    const appendOptional = (key: string, value: unknown) => {
      if (value === undefined || value === null || value === "") return;
      form.append(key, String(value));
    };

    appendOptional("UnitPrice", params.unitPrice);
    appendOptional("CostPrice", params.costPrice);
    appendOptional("PurchaseQuantity", params.purchaseQuantity);
    appendOptional("PurchaseUnitID", params.purchaseUnitID);
    appendOptional("StockUnitID", params.stockUnitID);

    if (params.isMenuItem) {
      appendOptional("ProductCategoryID", params.categoryID);
    } else {
      appendOptional("IngredientCategoryID", params.categoryID);
    }

    if (params.imageFile instanceof File) {
      form.append("ImageFile", params.imageFile, params.imageFile.name);
    }

    return this.axios.post<ApiResponse>(`/api/v1/product-api/product`, form);
  }

  public productList() {
    return this.axios.get<ProductListResponse>(`/api/v1/product-api/product`);
  }

  public updateProduct(params: UpdateProductParams) {
    const form = new FormData();
    form.append("ProductID", params.productID);

    const appendOptional = (key: string, value: unknown) => {
      if (value === undefined || value === null || value === "") return;
      form.append(key, String(value));
    };

    appendOptional("Name", params.name);
    appendOptional("Description", params.description);
    appendOptional("IsMenuItem", params.isMenuItem);
    appendOptional("UnitPrice", params.unitPrice);
    appendOptional("CostPrice", params.costPrice);
    appendOptional("PurchaseQuantity", params.purchaseQuantity);
    appendOptional("PurchaseUnitID", params.purchaseUnitID);
    appendOptional("StockUnitID", params.stockUnitID);

    if (params.isMenuItem === true) {
      appendOptional("ProductCategoryID", params.categoryID);
    } else if (params.isMenuItem === false) {
      appendOptional("IngredientCategoryID", params.categoryID);
    }

    if (params.imageFile instanceof File) {
      form.append("ImageFile", params.imageFile, params.imageFile.name);
    } else if (params.removeImage) {
      form.append("RemoveImage", "true");
    }

    return this.axios.put<ApiResponse>(`/api/v1/product-api/product`, form);
  }

  public deleteProduct(id: string[]) {
    return this.axios.delete<ApiResponse>(`/api/v1/product-api/product`, {
      data: { id: id },
    });
  }

  public getProductByIngredientsOrMenu(isMenuItem: boolean) {
    return this.axios.get<ProductListResponse>(
      `/api/v1/product-api/product/product-by-menuitem?isMenuItem=${isMenuItem}`,
    );
  }

  // ── Product Variants ───────────────────────────────────────────
  public productVariantsByProduct(productId: string) {
    return this.axios.get<ProductVariantListResponse>(
      `/api/v1/product-api/ProductVariant/by-product/${productId}`,
    );
  }
  public productVariantGet(id: string) {
    return this.axios.get<ProductVariantResponse>(
      `/api/v1/product-api/ProductVariant/${id}`,
    );
  }
  public productVariantCreate(params: CreateProductVariantDto) {
    return this.axios.post<ProductVariantResponse>(
      `/api/v1/product-api/ProductVariant`,
      params,
    );
  }
  public productVariantUpdate(params: UpdateProductVariantDto) {
    return this.axios.put<ProductVariantResponse>(
      `/api/v1/product-api/ProductVariant`,
      params,
    );
  }
  public productVariantDelete(id: string) {
    return this.axios.delete<ApiResponse<number>>(
      `/api/v1/product-api/ProductVariant/${id}`,
    );
  }

  // ── Product Add-Ons ────────────────────────────────────────────
  public productAddOnGroupsByProduct(productId: string) {
    return this.axios.get<ProductAddOnGroupListResponse>(
      `/api/v1/product-api/ProductAddOn/groups/by-product/${productId}`,
    );
  }
  public productAddOnGroupGet(groupId: string) {
    return this.axios.get<ProductAddOnGroupResponse>(
      `/api/v1/product-api/ProductAddOn/groups/${groupId}`,
    );
  }
  public productAddOnGroupCreate(params: CreateProductAddOnGroupDto) {
    return this.axios.post<ProductAddOnGroupResponse>(
      `/api/v1/product-api/ProductAddOn/groups`,
      params,
    );
  }
  public productAddOnGroupUpdate(params: UpdateProductAddOnGroupDto) {
    return this.axios.put<ProductAddOnGroupResponse>(
      `/api/v1/product-api/ProductAddOn/groups`,
      params,
    );
  }
  public productAddOnGroupDelete(groupId: string) {
    return this.axios.delete<ApiResponse<number>>(
      `/api/v1/product-api/ProductAddOn/groups/${groupId}`,
    );
  }
  public productAddOnItemCreate(params: AddProductAddOnItemDto) {
    return this.axios.post<ProductAddOnItemResponse>(
      `/api/v1/product-api/ProductAddOn/items`,
      params,
    );
  }
  public productAddOnItemUpdate(params: UpdateProductAddOnItemDto) {
    return this.axios.put<ProductAddOnItemResponse>(
      `/api/v1/product-api/ProductAddOn/items`,
      params,
    );
  }
  public productAddOnItemDelete(itemId: string) {
    return this.axios.delete<ApiResponse<number>>(
      `/api/v1/product-api/ProductAddOn/items/${itemId}`,
    );
  }

  public createRecipe(params: RecipeParams) {
    return this.axios.post<ApiResponse>(
      `/api/v1/product/recipe-api/recipe`,
      params,
    );
  }

  public getRecipe() {
    return this.axios.get<RecipeListResponse>(
      `/api/v1/product/recipe-api/recipe?pageNumber=1&pageSize=10`, //static for now
    );
  }

  public getUnitConversions(pageNumber: number = 1, pageSize: number = 10) {
    return this.axios.get<UnitConversionListResponse>(
      `/api/v1/unit-api/unitconversion?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    );
  }

  public updateRecipe(params: UpdateRecipeParams) {
    return this.axios.put<ApiResponse<RecipeResponse>>(
      `/api/v1/product/recipe-api/recipe`,
      params,
    );
  }

  public async softDeleteRecipe(recipeId: string) {
    return await this.axios.delete<ApiResponse>(
      `/api/v1/product/recipe-api/recipe?recipeId=${recipeId}`,
    );
  }

  public calculateMaxProduction(menuItemProductId: string) {
    return this.axios.get<ProductionCapacityResponse>(
      `/api/v1/product/recipe-api/recipe/calculate-max-production?menuItemProductId=${menuItemProductId}`,
    );
  }

  public detectGap(menuItemProductId: string) {
    return this.axios.post<ApiResponse<DetectGapResponseDto>>(
      `/api/v1/product/recipe-api/recipe/detect-gap`,
      JSON.stringify(menuItemProductId),
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  public createUnitConversion(params: CreateUnitConversionParams) {
    return this.axios.post<ApiResponse>(
      `/api/v1/unit-api/unitconversion`,
      params,
    );
  }

  // ===== Lookups (Unit / ProductCategory / IngredientCategory / Location / Brand) =====

  // Unit
  public unitGetById(id: string) {
    return this.axios.get<UnitResponse>(`/api/v1/unit-api/unit/${id}`);
  }
  public unitList() {
    return this.axios.get<UnitListResponse>(`/api/v1/unit-api/unit`);
  }
  public createUnit(params: CreateUnitParams) {
    return this.axios.post<ApiResponse<string>>(`/api/v1/unit-api/unit`, params);
  }
  public updateUnit(params: UpdateUnitParams) {
    return this.axios.put<ApiResponse<string>>(`/api/v1/unit-api/unit`, params);
  }
  public deleteUnits(ids: string[]) {
    return this.axios.delete<ApiResponse<string>>(`/api/v1/unit-api/unit`, {
      data: { id: ids },
    });
  }

  // ProductCategory
  public productCategoryGetById(id: string) {
    return this.axios.get<ProductCategoryResponse>(
      `/api/v1/productcategory-api/productcategory/${id}`,
    );
  }
  public productCategoryList() {
    return this.axios.get<ProductCategoryListResponse>(
      `/api/v1/productcategory-api/productcategory`,
    );
  }
  public createProductCategory(params: CreateProductCategoryParams) {
    return this.axios.post<ApiResponse<string>>(
      `/api/v1/productcategory-api/productcategory`,
      params,
    );
  }
  public updateProductCategory(params: UpdateProductCategoryParams) {
    return this.axios.put<ApiResponse<string>>(
      `/api/v1/productcategory-api/productcategory`,
      params,
    );
  }
  public deleteProductCategories(ids: string[]) {
    return this.axios.delete<ApiResponse<string>>(
      `/api/v1/productcategory-api/productcategory`,
      { data: { id: ids } },
    );
  }

  // IngredientCategory
  public ingredientCategoryGetById(id: string) {
    return this.axios.get<IngredientCategoryResponse>(
      `/api/v1/ingredientcategory-api/ingredientcategory/${id}`,
    );
  }
  public ingredientCategoryList() {
    return this.axios.get<IngredientCategoryListResponse>(
      `/api/v1/ingredientcategory-api/ingredientcategory`,
    );
  }
  public createIngredientCategory(params: CreateIngredientCategoryParams) {
    return this.axios.post<ApiResponse<string>>(
      `/api/v1/ingredientcategory-api/ingredientcategory`,
      params,
    );
  }
  public updateIngredientCategory(params: UpdateIngredientCategoryParams) {
    return this.axios.put<ApiResponse<string>>(
      `/api/v1/ingredientcategory-api/ingredientcategory`,
      params,
    );
  }
  public deleteIngredientCategories(ids: string[]) {
    return this.axios.delete<ApiResponse<string>>(
      `/api/v1/ingredientcategory-api/ingredientcategory`,
      { data: { id: ids } },
    );
  }

  // Business Supply Category
  public businessSupplyCategoryList() {
    return this.axios.get<ApiResponse<BusinessSupplyCategoryDto[]>>(
      `/api/v1/businesssupplycategory-api/businesssupplycategory`,
    );
  }
  public createBusinessSupplyCategory(
    params: CreateBusinessSupplyCategoryParams,
  ) {
    return this.axios.post<ApiResponse<BusinessSupplyCategoryDto>>(
      `/api/v1/businesssupplycategory-api/businesssupplycategory`,
      params,
    );
  }
  public updateBusinessSupplyCategory(
    params: UpdateBusinessSupplyCategoryParams,
  ) {
    return this.axios.put<ApiResponse<BusinessSupplyCategoryDto>>(
      `/api/v1/businesssupplycategory-api/businesssupplycategory`,
      params,
    );
  }
  public deleteBusinessSupplyCategories(ids: string[]) {
    return this.axios.delete<ApiResponse<string>>(
      `/api/v1/businesssupplycategory-api/businesssupplycategory`,
      { data: { id: ids } },
    );
  }

  // Business Expense
  public businessExpenseList(params?: {
    from?: string;
    to?: string;
    categoryId?: string;
  }) {
    return this.axios.get<BusinessExpenseListResponse>(
      `/api/v1/businessexpense-api/BusinessExpense`,
      { params },
    );
  }

  public businessExpenseGetById(id: string) {
    return this.axios.get<BusinessExpenseResponse>(
      `/api/v1/businessexpense-api/BusinessExpense/${id}`,
    );
  }

  public createBusinessExpense(params: CreateBusinessExpenseParams) {
    return this.axios.post<BusinessExpenseResponse>(
      `/api/v1/businessexpense-api/BusinessExpense`,
      params,
    );
  }

  public updateBusinessExpense(params: UpdateBusinessExpenseParams) {
    return this.axios.put<BusinessExpenseResponse>(
      `/api/v1/businessexpense-api/BusinessExpense`,
      params,
    );
  }

  public deleteBusinessExpense(id: string) {
    return this.axios.delete<ApiResponse<string>>(
      `/api/v1/businessexpense-api/BusinessExpense/${id}`,
    );
  }

  // Location
  public locationGetById(id: string) {
    return this.axios.get<LocationResponse>(
      `/api/v1/location-api/location/${id}`,
    );
  }
  public locationList() {
    return this.axios.get<LocationListResponse>(
      `/api/v1/location-api/location`,
    );
  }
  public createLocation(params: CreateLocationParams) {
    return this.axios.post<ApiResponse<string>>(
      `/api/v1/location-api/location`,
      params,
    );
  }
  public updateLocation(params: UpdateLocationParams) {
    return this.axios.put<ApiResponse<string>>(
      `/api/v1/location-api/location`,
      params,
    );
  }
  public deleteLocations(ids: string[]) {
    return this.axios.delete<ApiResponse<string>>(
      `/api/v1/location-api/location`,
      { data: { id: ids } },
    );
  }

  // Brand
  public brandGetById(id: string) {
    return this.axios.get<BrandResponse>(`/api/v1/brand-api/brand/${id}`);
  }
  public brandList() {
    return this.axios.get<BrandListResponse>(`/api/v1/brand-api/brand`);
  }
  public createBrand(params: CreateBrandParams) {
    return this.axios.post<ApiResponse<string>>(
      `/api/v1/brand-api/brand`,
      params,
    );
  }
  public updateBrand(params: UpdateBrandParams) {
    return this.axios.put<ApiResponse<string>>(
      `/api/v1/brand-api/brand`,
      params,
    );
  }
  public deleteBrands(ids: string[]) {
    return this.axios.delete<ApiResponse<string>>(`/api/v1/brand-api/brand`, {
      data: { id: ids },
    });
  }

  // ===== Inventory =====

  public inventoryGetById(id: string) {
    return this.axios.get<InventoryResponse>(
      `/api/v1/inventory-api/inventory/${id}`,
    );
  }

  public inventoryList(pageNumber: number = 1, pageSize: number = 10) {
    return this.axios.get<InventoryListResponse>(
      `/api/v1/inventory-api/inventory?${qs.stringify({ pageNumber, pageSize })}`,
    );
  }

  public inventoryByProduct(productId: string) {
    return this.axios.get<InventoryResponse>(
      `/api/v1/inventory-api/inventory/by-product/${productId}`,
    );
  }

  public inventoryLowStock() {
    return this.axios.get<LowStockResponse>(
      `/api/v1/inventory-api/inventory/low-stock`,
    );
  }

  public createInventory(params: CreateInventoryParams) {
    return this.axios.post<InventoryResponse>(
      `/api/v1/inventory-api/inventory`,
      params,
    );
  }

  public updateInventoryThresholds(params: UpdateInventoryParams) {
    return this.axios.put<InventoryResponse>(
      `/api/v1/inventory-api/inventory`,
      params,
    );
  }

  public adjustInventoryStock(params: AdjustStockParams) {
    return this.axios.post<InventoryResponse>(
      `/api/v1/inventory-api/inventory/adjust`,
      params,
    );
  }

  public softDeleteInventory(id: string) {
    return this.axios.delete<ApiResponse<boolean>>(
      `/api/v1/inventory-api/inventory/${id}`,
    );
  }

  // ===== Stock Movement =====

  public stockMovementGetById(id: string) {
    return this.axios.get<StockMovementResponse>(
      `/api/v1/inventory-api/stockmovement/${id}`,
    );
  }

  public stockMovementByInventory(
    inventoryId: string,
    pageNumber: number = 1,
    pageSize: number = 20,
  ) {
    return this.axios.get<StockMovementListResponse>(
      `/api/v1/inventory-api/stockmovement/by-inventory/${inventoryId}?${qs.stringify(
        { pageNumber, pageSize },
      )}`,
    );
  }

  public stockMovementByProduct(
    productId: string,
    pageNumber: number = 1,
    pageSize: number = 20,
  ) {
    return this.axios.get<StockMovementListResponse>(
      `/api/v1/inventory-api/stockmovement/by-product/${productId}?${qs.stringify(
        { pageNumber, pageSize },
      )}`,
    );
  }

  public stockMovementByReference(referenceType: string, referenceId: string) {
    return this.axios.get<StockMovementArrayResponse>(
      `/api/v1/inventory-api/stockmovement/by-reference?${qs.stringify({
        referenceType,
        referenceId,
      })}`,
    );
  }

  public stockMovementByDateRange(args: {
    fromDate: string;
    toDate: string;
    pageNumber?: number;
    pageSize?: number;
    movementType?: StockMovementType;
  }) {
    const {
      fromDate,
      toDate,
      pageNumber = 1,
      pageSize = 20,
      movementType,
    } = args;
    return this.axios.get<StockMovementListResponse>(
      `/api/v1/inventory-api/stockmovement/by-date-range?${qs.stringify({
        fromDate,
        toDate,
        pageNumber,
        pageSize,
        ...(movementType !== undefined ? { movementType } : {}),
      })}`,
    );
  }

  public roleList() {
    return this.axios.get<RoleListResponse>(`/api/v1/role-api/role`);
  }

  public userList(pageNumber = 1, pageSize = 20) {
    return this.axios.get<UserListResponse>(
      `/api/v1/user?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    );
  }

  public getUserDetail(id: string) {
    return this.axios.get<UserResponse>(`/api/v1/user/${id}`);
  }

  public getUsersByRole(roleId: string, includes: string[] = ["Role", "UserInfo", "Auth"]) {
    return this.axios.get<UserArrayResponse>(
      `/api/v1/user/GetUserByRole?${qs.stringify({ id: roleId, includes }, { arrayFormat: "none" })}`,
    );
  }

  public getCurrentUserRole() {
    return this.axios.get<ApiResponse<string>>(
      `/api/v1/user/GetCurrentUserRole`,
    );
  }

  public createUser(params: CreateUserParams) {
    const form = new FormData();
    form.append("roleID", params.roleID);
    form.append("username", params.username);
    form.append("password", params.password);
    form.append("firstName", params.firstName);
    if (params.middleName) form.append("middleName", params.middleName);
    form.append("lastName", params.lastName);
    form.append("email", params.email);
    form.append("contactNumber", params.contactNumber);
    if (params.licenseNumber) form.append("licenseNumber", params.licenseNumber);
    if (params.imageFile instanceof File) {
      form.append("imageFile", params.imageFile, params.imageFile.name);
    }
    return this.axios.post<UserResponse>(`/api/v1/user`, form);
  }

  public updateUser(params: UpdateUserParams) {
    const form = new FormData();
    form.append("userID", params.userID);
    const appendOptional = (key: string, value: unknown) => {
      if (value === undefined || value === null || value === "") return;
      form.append(key, String(value));
    };
    appendOptional("roleID", params.roleID);
    appendOptional("firstName", params.firstName);
    appendOptional("middleName", params.middleName);
    appendOptional("lastName", params.lastName);
    appendOptional("email", params.email);
    appendOptional("contactNumber", params.contactNumber);
    appendOptional("licenseNumber", params.licenseNumber);
    appendOptional("password", params.password);
    if (params.imageFile instanceof File) {
      form.append("imageFile", params.imageFile, params.imageFile.name);
    } else if (params.removeImage) {
      form.append("removeImage", "true");
    }
    return this.axios.put<UserResponse>(`/api/v1/user`, form);
  }

  public softDeleteUser(id: string) {
    return this.axios.delete<ApiResponse<boolean>>(`/api/v1/user/${id}`);
  }

  // ===== Supplier =====

  public supplierList(pageNumber = 1, pageSize = 20) {
    return this.axios.get<SupplierListResponse>(
      `/api/v1/supplier-api/supplier?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    );
  }

  public getSupplierById(id: string) {
    return this.axios.get<SupplierResponse>(`/api/v1/supplier-api/supplier/${id}`);
  }

  public createSupplier(params: CreateSupplierParams) {
    const form = new FormData();
    form.append("companyName", params.companyName);
    const appendOptional = (key: string, value: unknown) => {
      if (value === undefined || value === null || value === "") return;
      form.append(key, String(value));
    };
    appendOptional("contactPersonName", params.contactPersonName);
    appendOptional("email", params.email);
    appendOptional("contactNumber", params.contactNumber);
    appendOptional("address", params.address);
    appendOptional("taxID", params.taxID);
    appendOptional("paymentTerms", params.paymentTerms);
    appendOptional("notes", params.notes);
    appendOptional("userID", params.userID);
    if (params.logoFile instanceof File) {
      form.append("logoFile", params.logoFile, params.logoFile.name);
    }
    return this.axios.post<SupplierResponse>(`/api/v1/supplier-api/supplier`, form);
  }

  public updateSupplier(params: UpdateSupplierParams) {
    const form = new FormData();
    form.append("supplierID", params.supplierID);
    const appendOptional = (key: string, value: unknown) => {
      if (value === undefined || value === null || value === "") return;
      form.append(key, String(value));
    };
    appendOptional("companyName", params.companyName);
    appendOptional("contactPersonName", params.contactPersonName);
    appendOptional("email", params.email);
    appendOptional("contactNumber", params.contactNumber);
    appendOptional("address", params.address);
    appendOptional("taxID", params.taxID);
    appendOptional("paymentTerms", params.paymentTerms);
    appendOptional("notes", params.notes);
    appendOptional("userID", params.userID);
    if (params.logoFile instanceof File) {
      form.append("logoFile", params.logoFile, params.logoFile.name);
    } else if (params.removeLogo) {
      form.append("removeLogo", "true");
    }
    return this.axios.put<SupplierResponse>(`/api/v1/supplier-api/supplier`, form);
  }

  public softDeleteSupplier(id: string) {
    return this.axios.delete<ApiResponse<boolean>>(
      `/api/v1/supplier-api/supplier/${id}`,
    );
  }

  // ===== Settings =====

  public settingsList() {
    return this.axios.get<SystemSettingListResponse>(
      `/api/v1/settings-api/Settings`,
    );
  }

  public settingsGetById(id: string) {
    return this.axios.get<SystemSettingResponse>(
      `/api/v1/settings-api/Settings/${id}`,
    );
  }

  public settingsByKey(key: string) {
    return this.axios.get<SystemSettingResponse>(
      `/api/v1/settings-api/Settings/by-key/${encodeURIComponent(key)}`,
    );
  }

  public settingsByCategory(category: string) {
    return this.axios.get<SystemSettingListResponse>(
      `/api/v1/settings-api/Settings/by-category/${encodeURIComponent(category)}`,
    );
  }

  public settingsPublic() {
    return this.axios.get<SystemSettingListResponse>(
      `/api/v1/settings-api/Settings/public`,
    );
  }

  public updateSetting(params: UpdateSystemSettingParams) {
    return this.axios.put<SystemSettingResponse>(
      `/api/v1/settings-api/Settings`,
      params,
    );
  }

  public bulkUpdateSettings(params: BulkUpdateSystemSettingParams) {
    return this.axios.put<SystemSettingListResponse>(
      `/api/v1/settings-api/Settings/bulk`,
      params,
    );
  }

  public uploadSettingImage(params: UploadSettingImageParams) {
    const form = new FormData();
    form.append("key", params.key);
    form.append("file", params.file, params.file.name);
    return this.axios.post<SystemSettingResponse>(
      `/api/v1/settings-api/Settings/upload-image`,
      form,
    );
  }

  // ===== Content Blocks =====

  public contentBlockList() {
    return this.axios.get<ContentBlockListResponse>(
      `/api/v1/settings-api/ContentBlock`,
    );
  }

  public contentBlockGetById(id: string) {
    return this.axios.get<ContentBlockResponse>(
      `/api/v1/settings-api/ContentBlock/${id}`,
    );
  }

  public contentBlockByPage(pageKey: string) {
    return this.axios.get<ContentBlockListResponse>(
      `/api/v1/settings-api/ContentBlock/by-page/${encodeURIComponent(pageKey)}`,
    );
  }

  public createContentBlock(params: CreateContentBlockParams) {
    return this.axios.post<ContentBlockResponse>(
      `/api/v1/settings-api/ContentBlock`,
      params,
    );
  }

  public updateContentBlock(params: UpdateContentBlockParams) {
    return this.axios.put<ContentBlockResponse>(
      `/api/v1/settings-api/ContentBlock`,
      params,
    );
  }

  public bulkUpdateContentBlocks(params: BulkUpdateContentBlockParams) {
    return this.axios.put<ContentBlockListResponse>(
      `/api/v1/settings-api/ContentBlock/bulk`,
      params,
    );
  }

  public deleteContentBlock(id: string) {
    return this.axios.delete<ApiResponse<boolean>>(
      `/api/v1/settings-api/ContentBlock/${id}`,
    );
  }

  // ===== Audit Log =====

  public auditLogList(params: AuditLogQueryParams = {}) {
    const query = qs.stringify(
      Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== ""),
      ),
    );
    return this.axios.get<AuditLogListResponse>(
      `/api/v1/settings-api/AuditLog${query ? `?${query}` : ""}`,
    );
  }

  public auditLogGetById(id: string) {
    return this.axios.get<AuditLogResponse>(
      `/api/v1/settings-api/AuditLog/${id}`,
    );
  }

  public resetAllSettings(params: AdminConfirmationParams) {
    return this.axios.post<ApiResponse<number>>(
      `/api/v1/settings-api/Settings/reset-all`,
      params,
    );
  }

  public deleteAllAuditLogs(params: AdminConfirmationParams) {
    return this.axios.post<ApiResponse<number>>(
      `/api/v1/settings-api/AuditLog/delete-all`,
      params,
    );
  }

  // ===== Backup & Restore =====

  public async exportBackup(params: ExportBackupParams) {
    try {
      return await this.axios.post<Blob>(
        `/api/v1/backup-api/Backup/export`,
        {
          password: params.password,
          mpin: params.mpin,
          includeAuditLog: params.includeAuditLog ?? false,
          includeStockMovements: params.includeStockMovements ?? true,
        },
        { responseType: "blob" },
      );
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: unknown; status?: number };
      };
      if (err?.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          err.response.data = JSON.parse(text);
        } catch {
          // Leave the Blob in place — handleError will fall through to a generic message.
        }
      }
      throw error;
    }
  }

  public previewImportBackup(params: PreviewImportParams) {
    const form = new FormData();
    form.append("file", params.file, params.file.name);
    if (params.mode) form.append("mode", params.mode);
    return this.axios.post<ImportPreviewResponse>(
      `/api/v1/backup-api/Backup/preview-import`,
      form,
    );
  }

  public importBackup(params: ImportBackupParams) {
    const form = new FormData();
    form.append("file", params.file, params.file.name);
    form.append("mode", params.mode);
    form.append("password", params.password);
    form.append("mpin", params.mpin);
    return this.axios.post<ImportResultResponse>(
      `/api/v1/backup-api/Backup/import`,
      form,
    );
  }

  public backupHistory(pageNumber = 1, pageSize = 20) {
    return this.axios.get<BackupHistoryListResponse>(
      `/api/v1/backup-api/Backup/history?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    );
  }

  public purchaseOrderList(params: PurchaseOrderQueryParams = {}) {
    const cleaned: Record<string, unknown> = {};
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      cleaned[k] = v;
    });
    const search = qs.stringify(cleaned);
    return this.axios.get<PurchaseOrderListResponse>(
      `/api/v1/procurement-api/PurchaseOrders${search ? `?${search}` : ""}`,
    );
  }

  public purchaseOrderGetById(id: string) {
    return this.axios.get<PurchaseOrderResponse>(
      `/api/v1/procurement-api/PurchaseOrders/${encodeURIComponent(id)}`,
    );
  }

  public createPurchaseOrder(params: CreatePurchaseOrderParams) {
    return this.axios.post<PurchaseOrderResponse>(
      `/api/v1/procurement-api/PurchaseOrders`,
      params,
    );
  }

  public updatePurchaseOrder(id: string, params: UpdatePurchaseOrderParams) {
    return this.axios.put<PurchaseOrderResponse>(
      `/api/v1/procurement-api/PurchaseOrders/${encodeURIComponent(id)}`,
      params,
    );
  }

  public submitPurchaseOrder(id: string) {
    return this.axios.post<PurchaseOrderResponse>(
      `/api/v1/procurement-api/PurchaseOrders/${encodeURIComponent(id)}/submit`,
      {},
    );
  }

  public approvePurchaseOrder(id: string) {
    return this.axios.post<PurchaseOrderResponse>(
      `/api/v1/procurement-api/PurchaseOrders/${encodeURIComponent(id)}/approve`,
      {},
    );
  }

  public cancelPurchaseOrder(id: string, reason: string) {
    return this.axios.post<PurchaseOrderResponse>(
      `/api/v1/procurement-api/PurchaseOrders/${encodeURIComponent(id)}/cancel`,
      { reason },
    );
  }

  public closePurchaseOrder(id: string) {
    return this.axios.post<PurchaseOrderResponse>(
      `/api/v1/procurement-api/PurchaseOrders/${encodeURIComponent(id)}/close`,
      {},
    );
  }

  public deletePurchaseOrder(id: string) {
    return this.axios.delete<ApiResponse<boolean>>(
      `/api/v1/procurement-api/PurchaseOrders/${encodeURIComponent(id)}`,
    );
  }

  public receiptsByPurchaseOrder(purchaseOrderId: string) {
    return this.axios.get<ReceiptListResponse>(
      `/api/v1/procurement-api/Receipts?purchaseOrderId=${encodeURIComponent(purchaseOrderId)}`,
    );
  }

  public createReceipt(params: CreateReceiptParams) {
    return this.axios.post<ReceiptResponse>(
      `/api/v1/procurement-api/Receipts`,
      params,
    );
  }

  public supplierInvoiceList(params: SupplierInvoiceQueryParams = {}) {
    const cleaned: Record<string, unknown> = {};
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      cleaned[k] = v;
    });
    const search = qs.stringify(cleaned);
    return this.axios.get<SupplierInvoiceListResponse>(
      `/api/v1/procurement-api/SupplierInvoices${search ? `?${search}` : ""}`,
    );
  }

  public supplierInvoiceGetById(id: string) {
    return this.axios.get<SupplierInvoiceResponse>(
      `/api/v1/procurement-api/SupplierInvoices/${encodeURIComponent(id)}`,
    );
  }

  public createSupplierInvoice(params: CreateSupplierInvoiceParams) {
    return this.axios.post<SupplierInvoiceResponse>(
      `/api/v1/procurement-api/SupplierInvoices`,
      params,
    );
  }

  public updateSupplierInvoice(
    id: string,
    params: UpdateSupplierInvoiceParams,
  ) {
    return this.axios.put<SupplierInvoiceResponse>(
      `/api/v1/procurement-api/SupplierInvoices/${encodeURIComponent(id)}`,
      params,
    );
  }

  public voidSupplierInvoice(id: string, reason: string) {
    return this.axios.post<SupplierInvoiceResponse>(
      `/api/v1/procurement-api/SupplierInvoices/${encodeURIComponent(id)}/void`,
      { reason },
    );
  }

  public paymentList(params: PaymentQueryParams = {}) {
    const cleaned: Record<string, unknown> = {};
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      cleaned[k] = v;
    });
    const search = qs.stringify(cleaned);
    return this.axios.get<PaymentListResponse>(
      `/api/v1/procurement-api/Payments${search ? `?${search}` : ""}`,
    );
  }

  public createPayment(params: CreatePaymentParams) {
    return this.axios.post<PaymentResponse>(
      `/api/v1/procurement-api/Payments`,
      params,
    );
  }

  public voidPayment(id: string, reason: string) {
    return this.axios.post<PaymentResponse>(
      `/api/v1/procurement-api/Payments/${encodeURIComponent(id)}/void`,
      { reason },
    );
  }

  // ===== POS / Sales =====

  public sellableProductList(params: SellableProductQueryParams = {}) {
    const cleaned: Record<string, unknown> = {};
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      cleaned[k] = v;
    });
    const search = qs.stringify(cleaned);
    return this.axios.get<SellableProductListResponse>(
      `/api/v1/sales-api/Sales/sellable-products${search ? `?${search}` : ""}`,
    );
  }

  public createSale(params: CreateSaleParams) {
    return this.axios.post<SaleResponse>(`/api/v1/sales-api/Sales`, params);
  }

  public saleGetById(id: string) {
    return this.axios.get<SaleResponse>(
      `/api/v1/sales-api/Sales/${encodeURIComponent(id)}`,
    );
  }

  public saleGetByNumber(saleNumber: string) {
    return this.axios.get<SaleResponse>(
      `/api/v1/sales-api/Sales/by-number/${encodeURIComponent(saleNumber)}`,
    );
  }

  public saleList(params: SaleQueryParams = {}) {
    const cleaned: Record<string, unknown> = {};
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      cleaned[k] = v;
    });
    const search = qs.stringify(cleaned);
    return this.axios.get<SaleListResponse>(
      `/api/v1/sales-api/Sales${search ? `?${search}` : ""}`,
    );
  }

  public voidSale(id: string, params: VoidSaleParams) {
    return this.axios.post<SaleResponse>(
      `/api/v1/sales-api/Sales/${encodeURIComponent(id)}/void`,
      params,
    );
  }

  public refundSale(id: string, params: RefundSaleParams) {
    return this.axios.post<SaleResponse>(
      `/api/v1/sales-api/Sales/${encodeURIComponent(id)}/refund`,
      params,
    );
  }

  public salesDailySummary(date?: string) {
    const search = date ? `?${qs.stringify({ date })}` : "";
    return this.axios.get<DailySalesSummaryResponse>(
      `/api/v1/sales-api/Sales/daily-summary${search}`,
    );
  }

  // ─── Shift API ───────────────────────────────────────────────────────────────

  public getActiveShift() {
    return this.axios.get<ActiveShiftResponse>(
      `/api/v1/shift-api/CashierShift/active`,
    );
  }

  public openShift(params: OpenShiftParams) {
    return this.axios.post<ShiftResponse>(
      `/api/v1/shift-api/CashierShift/open`,
      params,
    );
  }

  public closeShift(params: CloseShiftParams) {
    return this.axios.post<ShiftSummaryResponse>(
      `/api/v1/shift-api/CashierShift/close`,
      params,
    );
  }

  public getShiftById(id: string) {
    return this.axios.get<ShiftSummaryResponse>(
      `/api/v1/shift-api/CashierShift/${encodeURIComponent(id)}`,
    );
  }

  public listShifts() {
    return this.axios.get<ShiftListResponse>(`/api/v1/shift-api/CashierShift`);
  }

  // ─── Promo API ───────────────────────────────────────────────────────────────

  public promoSuggestions() {
    return this.axios.get<PromoSuggestionListResponse>(`/api/v1/promo-api/promo/suggestions`);
  }

  public promoCalculate(params: PromoCalculateRequest) {
    return this.axios.post<PromoCalculateResponse>(`/api/v1/promo-api/promo/calculate`, params);
  }

  public promoCreate(params: CreatePromoParams) {
    const form = new FormData();
    form.append("title", params.title);
    if (params.description != null) form.append("description", params.description);
    form.append("type", String(params.type));
    form.append("isAiGenerated", String(params.isAiGenerated));
    if (params.discountPercent != null) form.append("discountPercent", String(params.discountPercent));
    if (params.discountAmount != null) form.append("discountAmount", String(params.discountAmount));
    if (params.buyQuantity != null) form.append("buyQuantity", String(params.buyQuantity));
    if (params.getQuantity != null) form.append("getQuantity", String(params.getQuantity));
    if (params.bundlePrice != null) form.append("bundlePrice", String(params.bundlePrice));
    if (params.startDate != null) form.append("startDate", params.startDate);
    if (params.endDate != null) form.append("endDate", params.endDate);
    if (params.reason != null) form.append("reason", params.reason);
    if (params.targetSegment != null) form.append("targetSegment", String(params.targetSegment));
    if (params.minLoyaltyStamps != null) form.append("minLoyaltyStamps", String(params.minLoyaltyStamps));
    if (params.imageFile instanceof File) form.append("imageFile", params.imageFile, params.imageFile.name);
    params.items.forEach((item, idx) => {
      if (item.productID) {
        form.append(`items[${idx}].productID`, item.productID);
      }
      if (item.productCategoryID) {
        form.append(
          `items[${idx}].productCategoryID`,
          item.productCategoryID,
        );
      }
      if (item.productVariantID) {
        form.append(
          `items[${idx}].productVariantID`,
          item.productVariantID,
        );
      }
      form.append(`items[${idx}].quantity`, String(item.quantity));
      form.append(`items[${idx}].isFreeItem`, String(item.isFreeItem));
    });
    (params.targetCustomerIds ?? []).forEach((id, idx) => {
      form.append(`targetCustomerIds[${idx}]`, id);
    });
    return this.axios.post<PromoResponse>(`/api/v1/promo-api/promo`, form);
  }

  // ─── Promo Customer Assignment (CRM targeting) ──────────────────────────────

  public promoCustomersList(promoId: string) {
    return this.axios.get<AssignedCustomerListResponse>(
      `/api/v1/promo-api/promo/${encodeURIComponent(promoId)}/customers`,
    );
  }

  public promoCustomersAssign(promoId: string, params: AssignPromoCustomersParams) {
    return this.axios.post<AssignedCustomerListResponse>(
      `/api/v1/promo-api/promo/${encodeURIComponent(promoId)}/customers`,
      params,
    );
  }

  public promoCustomerRemove(promoId: string, customerId: string) {
    return this.axios.delete<ApiResponse<string>>(
      `/api/v1/promo-api/promo/${encodeURIComponent(promoId)}/customers/${encodeURIComponent(customerId)}`,
    );
  }

  public promoList() {
    return this.axios.get<PromoListResponse>(`/api/v1/promo-api/promo`);
  }

  public promoProductsForCustomer(customerId: string) {
    return this.axios.get<CustomerPromoProductListResponse>(
      `/api/v1/promo-api/promo/customer/${encodeURIComponent(customerId)}/promo-products`,
    );
  }

  public promoGetById(id: string) {
    return this.axios.get<PromoResponse>(
      `/api/v1/promo-api/promo/${encodeURIComponent(id)}`,
    );
  }

  public promoUpdate(params: UpdatePromoParams) {
    return this.axios.put<PromoResponse>(
      `/api/v1/promo-api/promo/${encodeURIComponent(params.promoID)}`,
      params,
    );
  }

  public promoActivate(id: string) {
    return this.axios.put<PromoResponse>(
      `/api/v1/promo-api/promo/${encodeURIComponent(id)}/activate`,
    );
  }

  public promoDeactivate(id: string) {
    return this.axios.put<PromoResponse>(
      `/api/v1/promo-api/promo/${encodeURIComponent(id)}/deactivate`,
    );
  }

  public promoDelete(id: string) {
    return this.axios.delete<ApiResponse<string>>(
      `/api/v1/promo-api/promo/${encodeURIComponent(id)}`,
    );
  }

  // ─── Orders API ─────────────────────────────────────────────────────────────

  public orderList(params: OrderQueryParams = {}) {
    const search = qs.stringify(params, { skipEmptyString: true, skipNull: true });
    return this.axios.get<OrderListResponse>(
      `/api/v1/orders-api/Orders${search ? `?${search}` : ""}`,
    );
  }

  public getOrderById(id: string) {
    return this.axios.get<OrderDetailResponse>(
      `/api/v1/orders-api/Orders/${encodeURIComponent(id)}`,
    );
  }

  public getOrderByNumber(orderNumber: string) {
    return this.axios.get<OrderDetailResponse>(
      `/api/v1/orders-api/Orders/by-number/${encodeURIComponent(orderNumber)}`,
    );
  }

  public voidOrder(id: string, params: VoidSaleParams) {
    return this.axios.post<OrderDetailResponse>(
      `/api/v1/orders-api/Orders/${encodeURIComponent(id)}/void`,
      params,
    );
  }

  public refundOrder(id: string, params: RefundSaleParams) {
    return this.axios.post<OrderDetailResponse>(
      `/api/v1/orders-api/Orders/${encodeURIComponent(id)}/refund`,
      params,
    );
  }

  // ── Bulk product creation ──────────────────────────────────────────────────
  public bulkCreateProducts(params: BulkCreateProductParams, imageFiles?: (File | null)[]) {
    const form = new FormData();
    form.append("productsJson", JSON.stringify(params));
    imageFiles?.forEach((file, i) => {
      if (file) form.append(`imageFiles[${i}]`, file, file.name);
    });
    return this.axios.post<BulkCreateProductResponse>(
      `/api/v1/product-api/Product/bulk`,
      form,
    );
  }

  public downloadImportTemplate() {
    return this.axios.get(`/api/v1/product-api/Product/import-template`, {
      responseType: "blob",
    });
  }

  public importFromExcel(params: ImportExcelParams) {
    const form = new FormData();
    form.append("file", params.file);
    return this.axios.post<ImportExcelResponse>(
      `/api/v1/product-api/Product/import-excel`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
  }

  // ── Variant templates ──────────────────────────────────────────────────────
  public variantTemplateList() {
    return this.axios.get<ProductVariantTemplateListResponse>(
      `/api/v1/product-api/ProductVariantTemplate`,
    );
  }

  public variantTemplateGet(id: string) {
    return this.axios.get<ProductVariantTemplateResponse>(
      `/api/v1/product-api/ProductVariantTemplate/${encodeURIComponent(id)}`,
    );
  }

  public variantTemplateCreate(params: CreateVariantTemplateParams) {
    return this.axios.post<ProductVariantTemplateResponse>(
      `/api/v1/product-api/ProductVariantTemplate`,
      params,
    );
  }

  public variantTemplateUpdate(params: UpdateVariantTemplateParams) {
    return this.axios.put<ProductVariantTemplateResponse>(
      `/api/v1/product-api/ProductVariantTemplate`,
      params,
    );
  }

  public variantTemplateDelete(id: string) {
    return this.axios.delete(
      `/api/v1/product-api/ProductVariantTemplate/${encodeURIComponent(id)}`,
    );
  }

  public variantTemplateApply(params: ApplyVariantTemplateParams) {
    return this.axios.post<ApplyVariantTemplateResponse>(
      `/api/v1/product-api/ProductVariantTemplate/apply`,
      params,
    );
  }

  // ── Add-on templates ───────────────────────────────────────────────────────
  public addOnTemplateList() {
    return this.axios.get<ProductAddOnTemplateListResponse>(
      `/api/v1/product-api/ProductAddOnTemplate`,
    );
  }

  public addOnTemplateGet(id: string) {
    return this.axios.get<ProductAddOnTemplateResponse>(
      `/api/v1/product-api/ProductAddOnTemplate/${encodeURIComponent(id)}`,
    );
  }

  public addOnTemplateCreate(params: CreateAddOnTemplateParams) {
    return this.axios.post<ProductAddOnTemplateResponse>(
      `/api/v1/product-api/ProductAddOnTemplate`,
      params,
    );
  }

  public addOnTemplateUpdate(params: UpdateAddOnTemplateParams) {
    return this.axios.put<ProductAddOnTemplateResponse>(
      `/api/v1/product-api/ProductAddOnTemplate`,
      params,
    );
  }

  public addOnTemplateDelete(id: string) {
    return this.axios.delete(
      `/api/v1/product-api/ProductAddOnTemplate/${encodeURIComponent(id)}`,
    );
  }

  public addOnTemplateApply(params: ApplyAddOnTemplateParams) {
    return this.axios.post<ApplyAddOnTemplateResponse>(
      `/api/v1/product-api/ProductAddOnTemplate/apply`,
      params,
    );
  }

  // ─── Product Performance API ──────────────────────────────────────────────────
  public productPerformanceReport(params: ProductPerformanceQueryParams = {}) {
    const queryStr = qs.stringify(params, { skipNull: true, skipEmptyString: true });
    return this.axios.get<ProductPerformanceReportResponse>(
      `/api/v1/report-api/ProductPerformance${queryStr ? `?${queryStr}` : ""}`,
    );
  }

  public productPerformancePromoSuggestions(params: SlowMovingPromoQueryParams = {}) {
    const queryStr = qs.stringify(params, { skipNull: true, skipEmptyString: true });
    return this.axios.get<SlowMovingPromoSuggestionListResponse>(
      `/api/v1/report-api/ProductPerformance/promo-suggestions${queryStr ? `?${queryStr}` : ""}`,
    );
  }

  // ─── Financial Report API ────────────────────────────────────────────────────

  public financialReport(params: FinancialReportQueryParams = {}) {
    const queryStr = qs.stringify(params, { skipNull: true, skipEmptyString: true });
    return this.axios.get<FinancialReportResponse>(
      `/api/v1/report-api/FinancialReport${queryStr ? `?${queryStr}` : ""}`,
    );
  }

  // ─── Smart API ───────────────────────────────────────────────────────────────

  public salesForecast() {
    return this.axios.get<SalesForecastResponse>(`/api/v1/smart-api/SalesForecast`);
  }

  // ─── Customer Dashboard API ────────────────────────────────────────────────────
  // Self-service customer portal (role: Customer). Base: /api/v1/customer-api/customerdashboard.

  public customerDashboardPromos() {
    return this.axios.get<CustomerPromoListResponse>(
      `/api/v1/customer-api/customerdashboard/promos`,
    );
  }

  public customerDashboardMenu(params: CustomerMenuQueryParams = {}) {
    const search = qs.stringify(params, { skipNull: true, skipEmptyString: true });
    return this.axios.get<CustomerMenuResponse>(
      `/api/v1/customer-api/customerdashboard/menu${search ? `?${search}` : ""}`,
    );
  }

  public customerDashboardLoyalty() {
    return this.axios.get<CustomerLoyaltyResponse>(
      `/api/v1/customer-api/customerdashboard/loyalty`,
    );
  }

  public customerDashboardOrders(params: CustomerOrderQueryParams = {}) {
    const search = qs.stringify(params, { skipNull: true, skipEmptyString: true });
    return this.axios.get<CustomerOrderListResponse>(
      `/api/v1/customer-api/customerdashboard/orders${search ? `?${search}` : ""}`,
    );
  }

  public customerDashboardOrderById(id: string) {
    return this.axios.get<CustomerOrderResponse>(
      `/api/v1/customer-api/customerdashboard/orders/${encodeURIComponent(id)}`,
    );
  }

  /** Place a pickup order. Does not deduct inventory or take payment — the cashier
   *  records payment and advances status to PaymentReceived at the counter. */
  public customerCheckout(params: CustomerCheckoutParams) {
    return this.axios.post<CustomerOrderResponse>(
      `/api/v1/customer-api/customerdashboard/checkout`,
      params,
    );
  }

  /** List customer online orders for the cashier panel. */
  public cashierListCustomerOrders(params: CustomerOrderQueryParams = {}) {
    const search = qs.stringify(params, { skipNull: true, skipEmptyString: true });
    return this.axios.get<CustomerOrderListResponse>(
      `/api/v1/customer-order-api/customerorders${search ? `?${search}` : ""}`,
    );
  }

  public cashierGetCustomerOrderById(id: string) {
    return this.axios.get<CustomerOrderResponse>(
      `/api/v1/customer-order-api/customerorders/${encodeURIComponent(id)}`,
    );
  }

  /** Advancing to PaymentReceived (status=3) triggers inventory deduction on the backend. */
  public cashierUpdateOrderStatus(id: string, params: UpdateOrderStatusParams) {
    return this.axios.put<CustomerOrderResponse>(
      `/api/v1/customer-order-api/customerorders/${encodeURIComponent(id)}/status`,
      params,
    );
  }

  public cashierSetPaymentReference(id: string, params: SetPaymentReferenceParams) {
    return this.axios.put<CustomerOrderResponse>(
      `/api/v1/customer-order-api/customerorders/${encodeURIComponent(id)}/reference`,
      params,
    );
  }

  // ===== Documentation =====

  public documentationList() {
    return this.axios.get<DocumentationListResponse>(
      `/api/v1/settings-api/Documentation`,
    );
  }

  public documentationGetById(id: string) {
    return this.axios.get<DocumentationResponse>(
      `/api/v1/settings-api/Documentation/${encodeURIComponent(id)}`,
    );
  }

  public documentationByRole(role: "Admin" | "Cashier" | "Both") {
    return this.axios.get<DocumentationListResponse>(
      `/api/v1/settings-api/Documentation/by-role/${encodeURIComponent(role)}`,
    );
  }

  public createDocumentation(params: CreateDocumentationParams) {
    return this.axios.post<DocumentationResponse>(
      `/api/v1/settings-api/Documentation`,
      params,
    );
  }

  public updateDocumentation(params: UpdateDocumentationParams) {
    return this.axios.put<DocumentationResponse>(
      `/api/v1/settings-api/Documentation`,
      params,
    );
  }

  public deleteDocumentation(id: string) {
    return this.axios.delete<DocumentationResponse>(
      `/api/v1/settings-api/Documentation/${encodeURIComponent(id)}`,
    );
  }

  // ===== Facebook Post Management =====

  public facebookPostList() {
    return this.axios.get<FacebookPostListResponse>(
      `/api/v1/social-api/FacebookPost`,
    );
  }

  public facebookPostById(id: string) {
    return this.axios.get<FacebookPostResponse>(
      `/api/v1/social-api/FacebookPost/${encodeURIComponent(id)}`,
    );
  }

  public facebookPageInfo() {
    return this.axios.get<FacebookPageInfoResponse>(
      `/api/v1/social-api/FacebookPost/page-info`,
    );
  }

  public createFacebookPost(params: CreateFacebookPostParams) {
    const form = new FormData();
    form.append("Message", params.message);
    form.append("Status", String(params.status));
    if (params.scheduledAt) form.append("ScheduledAt", params.scheduledAt);
    params.imageFiles?.forEach((file) => {
      form.append("ImageFiles", file, file.name);
    });
    return this.axios.post<FacebookPostResponse>(
      `/api/v1/social-api/FacebookPost`,
      form,
    );
  }

  public updateFacebookPost(params: UpdateFacebookPostParams) {
    const form = new FormData();
    form.append("FacebookPostID", params.facebookPostID);
    if (params.message != null) form.append("Message", params.message);
    if (params.status != null) form.append("Status", String(params.status));
    if (params.scheduledAt) form.append("ScheduledAt", params.scheduledAt);
    params.imageFiles?.forEach((file) => {
      form.append("ImageFiles", file, file.name);
    });
    if (params.removeAllImages) form.append("RemoveAllImages", "true");
    return this.axios.put<FacebookPostResponse>(
      `/api/v1/social-api/FacebookPost`,
      form,
    );
  }

  public deleteFacebookPost(id: string) {
    return this.axios.delete<ApiResponse<string>>(
      `/api/v1/social-api/FacebookPost/${encodeURIComponent(id)}`,
    );
  }

  public reconnectFacebook(params: FacebookReconnectParams) {
    return this.axios.patch<FacebookConnectionStatusResponse>(
      `/api/v1/social-api/FacebookPost/reconnect`,
      params,
    );
  }

  public disconnectFacebook() {
    return this.axios.delete<ApiResponse<string>>(`/api/v1/social-api/FacebookPost/disconnect`);
  }
}
