import { AxiosInstance } from "axios";
import qs from "query-string";
import { ApiResponse } from "../types";
import {
  CategoryListResponse,
  ChartDataResponse,
  CreateCategoryParams,
  CreateProductParams,
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
    return this.axios.post<ApiResponse>(`/api/v1/product-api/product`, params);
  }

  public productList() {
    return this.axios.get<ProductListResponse>(`/api/v1/product-api/product`);
  }

  public updateProduct(params: CreateProductParams) {
    return this.axios.put<ApiResponse>(`/api/v1/product-api/product`, params);
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
}
