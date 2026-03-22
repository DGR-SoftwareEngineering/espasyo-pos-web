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
  unitPrice?: number;
  costPrice?: number;
  isMenuItem: boolean;
  categoryID?: string | null;
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
  quantityRequired: number;
  unitID: string;
  unitName: string;
  displayOrder: number;
  notes: string | null;
  cost: number;
}

export interface RecipeResponse {
  recipeID: string;
  menuItemProductID: string;
  menuItemName: string;
  recipeItems: RecipeItemResponse[];
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

export type ProductionCapacityResponse = ApiResponse<ProductionCapacity>;
export type RecipeListResponse = ApiResponse<PaginatedResponse<RecipeResponse>>;
export type UserInfoResponse = ApiResponse<UserInformations>;
export type CategoryListResponse = ApiResponse<CategoryDataList[]>;
export type ProductListResponse = ApiResponse<ProductDataList[]>;
