import { ApiResponse, ChartData } from "../types";

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
  isMenuItem: boolean;
  categoryID: string | null;
  categoryName: string | null;
  categoryType: number | null;
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

export interface RecipeResponse {
  recipeID: string;
  menuItemProductID: string;
  menuItemName: string;
  recipeItems: RecipeItemResponse[];
  totalCost: number;
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

export interface EndpointRegistry {
  endpointId: string;
  keyUrl: string;
  sourceUrl: string;
  isActive: boolean;
}

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
export type EndpointRegistryResponse = ApiResponse<EndpointRegistry>;
export type ProductionCapacityResponse = ApiResponse<ProductionCapacity>;
export type RecipeListResponse = ApiResponse<PaginatedResponse<RecipeResponse>>;
export type UserInfoResponse = ApiResponse<UserInformations>;
export type CategoryListResponse = ApiResponse<CategoryDataList[]>;
export type ProductListResponse = ApiResponse<ProductDataList[]>;
export type ChartDataResponse = ApiResponse<ChartData>;
