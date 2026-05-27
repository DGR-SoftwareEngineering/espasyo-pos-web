import { AxiosInstance } from "axios";
import qs from "query-string";
import { ApiResponse } from "../types";
import type { PaginatedResponse } from "../commons/types";
import {
  AddCustomerNoteParams,
  AddManualStampParams,
  CreateCustomerParams,
  CustomerAnalyticsResponse,
  CustomerDetailLegacyResponse,
  CustomerDetailResponse,
  CustomerListResponse,
  CustomerPurchasesQueryParams,
  CustomerQueryParams,
  CustomerSearchResponse,
  CustomerSearchResultDto,
  CustomerStampsQueryParams,
  CustomerStampsResponse,
  RemoveStampParams,
  UpdateCustomerParams,
  UpdateCustomerTagsParams,
} from "./types";
import type { SaleDto } from "../commons/types";

const BASE = "/api/v1/crm-api";

export class CrmApi {
  constructor(private readonly axios: AxiosInstance) {}

  // ───── Search (POS optimised) ────────────────────────────────────────────

  public search(q: string) {
    return this.axios.get<CustomerSearchResponse>(
      `${BASE}/Customers/search?q=${encodeURIComponent(q)}`,
    );
  }

  // ───── List / CRUD ───────────────────────────────────────────────────────

  public list(params: CustomerQueryParams = {}) {
    const search = qs.stringify(params, {
      skipEmptyString: true,
      skipNull: true,
    });
    return this.axios.get<CustomerListResponse>(
      `${BASE}/Customers${search ? `?${search}` : ""}`,
    );
  }

  public browse(params: CustomerQueryParams = {}) {
    const search = qs.stringify(params, {
      skipEmptyString: true,
      skipNull: true,
    });
    return this.axios.get<ApiResponse<PaginatedResponse<CustomerSearchResultDto>>>(
      `${BASE}/Customers/browse${search ? `?${search}` : ""}`,
    );
  }

  public getById(id: string) {
    return this.axios.get<CustomerDetailLegacyResponse>(
      `${BASE}/Customers/${encodeURIComponent(id)}`,
    );
  }

  public create(params: CreateCustomerParams) {
    return this.axios.post<CustomerDetailLegacyResponse>(
      `${BASE}/Customers`,
      params,
    );
  }

  public update(id: string, params: UpdateCustomerParams) {
    return this.axios.put<CustomerDetailLegacyResponse>(
      `${BASE}/Customers/${encodeURIComponent(id)}`,
      params,
    );
  }

  public softDelete(id: string) {
    return this.axios.delete<ApiResponse<string>>(
      `${BASE}/Customers/${encodeURIComponent(id)}`,
    );
  }

  // ───── Purchases ─────────────────────────────────────────────────────────

  public getPurchases(id: string, params: CustomerPurchasesQueryParams = {}) {
    const search = qs.stringify(params, {
      skipEmptyString: true,
      skipNull: true,
    });
    return this.axios.get<ApiResponse<PaginatedResponse<SaleDto>>>(
      `${BASE}/Customers/${encodeURIComponent(id)}/purchases${
        search ? `?${search}` : ""
      }`,
    );
  }

  // ───── Stamp History ──────────────────────────────────────────────────────

  public getStamps(id: string, params: CustomerStampsQueryParams = {}) {
    const search = qs.stringify(params, {
      skipEmptyString: true,
      skipNull: true,
    });
    return this.axios.get<CustomerStampsResponse>(
      `${BASE}/Customers/${encodeURIComponent(id)}/stamps${
        search ? `?${search}` : ""
      }`,
    );
  }

  // ───── Notes ─────────────────────────────────────────────────────────────

  public addNote(id: string, params: AddCustomerNoteParams) {
    return this.axios.post<CustomerDetailLegacyResponse>(
      `${BASE}/Customers/${encodeURIComponent(id)}/notes`,
      params,
    );
  }

  public deleteNote(id: string, noteId: string) {
    return this.axios.delete<ApiResponse<string>>(
      `${BASE}/Customers/${encodeURIComponent(id)}/notes/${encodeURIComponent(
        noteId,
      )}`,
    );
  }

  // ───── Tags ──────────────────────────────────────────────────────────────

  public updateTags(id: string, params: UpdateCustomerTagsParams) {
    return this.axios.put<CustomerDetailLegacyResponse>(
      `${BASE}/Customers/${encodeURIComponent(id)}/tags`,
      params,
    );
  }

  // ───── Loyalty ───────────────────────────────────────────────────────────

  public addStamp(id: string, params: AddManualStampParams = {}) {
    return this.axios.post<CustomerDetailLegacyResponse>(
      `${BASE}/Customers/${encodeURIComponent(id)}/add-stamp`,
      params,
    );
  }

  public removeStamp(id: string, params: RemoveStampParams = {}) {
    return this.axios.post<CustomerDetailLegacyResponse>(
      `${BASE}/Customers/${encodeURIComponent(id)}/remove-stamp`,
      params,
    );
  }

  public getRedeemableProducts(id: string) {
    return this.axios.post<CustomerDetailResponse>(
      `${BASE}/Customers/${encodeURIComponent(id)}/redeem-reward`,
    );
  }

  public confirmRedeem(id: string) {
    return this.axios.post<CustomerDetailLegacyResponse>(
      `${BASE}/Customers/${encodeURIComponent(id)}/confirm-redeem`,
    );
  }

  // ───── Analytics ─────────────────────────────────────────────────────────

  public analytics() {
    return this.axios.get<CustomerAnalyticsResponse>(
      `${BASE}/Customers/analytics`,
    );
  }
}
