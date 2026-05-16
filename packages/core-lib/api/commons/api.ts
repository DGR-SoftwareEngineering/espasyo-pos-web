import { AxiosInstance } from "axios";
import qs from "query-string";
import { ApiResponse } from "../types";
import {
  CategoryListResponse,
  ChartDataResponse,
  CreateCategoryParams,
  CreateProductParams,
  UpdateProductParams,
  CreateUnitConversionParams,
  EndpointRegistryResponse,
  ProductionCapacityResponse,
  ProductListResponse,
  RecipeListResponse,
  RecipeParams,
  RecipeResponse,
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
  CreateIngredientCategoryParams,
  CreateLocationParams,
  CreateProductCategoryParams,
  CreateUnitParams,
  IngredientCategoryListResponse,
  IngredientCategoryResponse,
  LocationListResponse,
  LocationResponse,
  ProductCategoryListResponse,
  ProductCategoryResponse,
  UnitListResponse,
  UnitResponse,
  UpdateBrandParams,
  UpdateIngredientCategoryParams,
  UpdateLocationParams,
  UpdateProductCategoryParams,
  UpdateUnitParams,
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

  public chartData(url: string, key?: string) {
    return this.axios.get<ChartDataResponse>(`${url}${key}`);
  }

  public getUserById() {
    return this.ssrAxios.get<UserInfoResponse>(`/api/commons/get-user-info`);
  }

  public findEndpointByKey(key: string) {
    return this.axios.get<EndpointRegistryResponse>(
      `/api/v1/endpoint-api/endpointregistry/get-sourceurl-by-key?key=${key}`,
    );
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
}
