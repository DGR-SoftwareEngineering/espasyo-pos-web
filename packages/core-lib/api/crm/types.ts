import { ApiResponse } from "../types";
import type { PaginatedResponse } from "../commons/types";

// Re-export PaginatedResponse for callers that want it from this module
export type { PaginatedResponse } from "../commons/types";

type Paginated<T> = PaginatedResponse<T>;

// ───── Enums ──────────────────────────────────────────────────────────────

export enum CustomerSegment {
  New = 1,
  Regular = 2,
  VIP = 3,
  Occasional = 4,
  AtRisk = 5,
}

export enum StampSource {
  Manual = 0,
  Sale = 1,
}

// ───── Core DTOs ──────────────────────────────────────────────────────────

export interface CustomerDto {
  customerID: string;
  customerNumber: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  segment: CustomerSegment;
  totalVisits: number;
  totalSpend: number;
  loyaltyStamps: number;
  lastVisitAt: string | null;
  hasPhysicalCard: boolean;
  isActive: boolean;
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
  // Server-computed fields (optional for backward compat)
  stampsInCurrentCard?: number;    // totalStamps % 12  (0–11)
  remainingStamps?: number;        // 12 - stampsInCurrentCard  (1–12)
  nextStampPosition?: number;      // stampsInCurrentCard + 1  (1–12, 1-indexed)
  stampsToday?: number;            // stamps earned today (UTC)
  dailyStampLimit?: number;        // admin setting (0 = unlimited)
  dailyStampsRemaining?: number;   // max(0, dailyStampLimit - stampsToday)
  canStampToday?: boolean;         // true if under limit or limit is 0
}

export interface CustomerNoteDto {
  customerNoteID: string;
  note: string;
  createdBy: string | null;
  createdAt: string | null;
}

export interface CustomerDetailDto {
  customerID: string;
  customerNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  birthday: string | null;
  tags: string[] | null;
  segment: CustomerSegment;
  totalVisits: number;
  totalSpend: number;
  firstVisitAt: string | null;
  lastVisitAt: string | null;
  hasPhysicalCard: boolean;
  loyaltyCard: CustomerLoyaltyCardDto | null;
  notes: CustomerNoteDto[];
  createdAt: string | null;
  isActive: boolean;
}


export interface CustomerSearchResultDto {
  customerID: string;
  customerNumber: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  totalStamps: number;
  availableRewards: number;
  segment: CustomerSegment;
  hasPhysicalCard: boolean;
}

export interface TopCustomerDto {
  customerID: string;
  customerNumber: string;
  fullName: string;
  totalSpend: number;
  totalVisits: number;
}

export interface CustomerAnalyticsDto {
  totalCustomers: number;
  newThisMonth: number;
  averageOrderValue: number;
  segmentDistribution: Record<string, number>;
  topBySpend: TopCustomerDto[];
  topByFrequency: TopCustomerDto[];
  retentionRate: number;
}

export interface LoyaltyStampEventDto {
  loyaltyStampEventID: string;
  customerLoyaltyCardID: string;
  source: StampSource;
  sourceName: string;
  reason: string | null;
  saleID: string | null;
  createdAt: string | null;
  createdBy: string | null;
}

export interface RedeemableProductDto {
  productID: string;
  name: string;
  description: string;
  unitPrice: number;
  imageUrl: string | null;
  productCategoryName: string;
}

export interface CustomerDetailWithRewardsDto {
  customerID: string;
  customer: CustomerDetailDto;
  redeemableProducts: RedeemableProductDto[];
  stampsUntilNextReward: number;
  nextRewardAtStamp: number;
  availableRewardsRemaining: number;
  totalRewardsRedeemed: number;
}

// ───── Request params ─────────────────────────────────────────────────────

export interface CreateCustomerParams {
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  birthday?: string | null;
  tags?: string[];
}

export interface UpdateCustomerParams {
  firstName?: string;
  lastName?: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  birthday?: string | null;
  hasPhysicalCard?: boolean;
}

export interface AddCustomerNoteParams {
  note: string;
}

export interface UpdateCustomerTagsParams {
  tags: string[];
}

export interface AddManualStampParams {
  stamps?: number;
  reason?: string | null;
}

export interface RemoveStampParams {
  stamps?: number;       // 1–12, default 1
  reason?: string | null;
}

export interface CustomerQueryParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  segment?: CustomerSegment;
  sortBy?: "spend" | "visits" | "name";
}

export interface CustomerPurchasesQueryParams {
  pageNumber?: number;
  pageSize?: number;
}

export interface CustomerStampsQueryParams {
  pageNumber?: number;
  pageSize?: number;
}

// ───── Response aliases ───────────────────────────────────────────────────

export type CustomerListResponse = ApiResponse<Paginated<CustomerDto>>;
export type CustomerDetailResponse = ApiResponse<CustomerDetailWithRewardsDto>;
export type CustomerDetailLegacyResponse = ApiResponse<CustomerDetailDto>;
export type CustomerSearchResponse = ApiResponse<CustomerSearchResultDto[]>;
export type CustomerStampsResponse = ApiResponse<Paginated<LoyaltyStampEventDto>>;
export type CustomerAnalyticsResponse = ApiResponse<CustomerAnalyticsDto>;
