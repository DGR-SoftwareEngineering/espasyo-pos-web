import type { ReactNode } from "react";
import {
  CategoryDataList,
  InventoryDto,
  ProductDataList,
  ProductionCapacity,
  PurchaseOrderDetailDto,
  RecipeResponse,
  SaleDetailDto,
  SupplierDto,
  SupplierInvoiceDetailDto,
  UserDto,
} from "../../commons/types";
import { PlatformDto } from "../../platform/types";

type AsyncFunction = () => Promise<void>;

export interface PosChargeDialogData {
  totalAmount: number;
  subtotal: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  itemCount: number;
  onConfirm: (payload: PosChargePayload) => Promise<void>;
}

export interface PosChargePaymentLine {
  method: number;
  amount: number;
  tendered: number | null;
  referenceNumber: string | null;
}

export interface PosChargePayload {
  payments: PosChargePaymentLine[];
  notes: string | null;
}

export interface PosReceiptDialogData {
  sale: SaleDetailDto;
}

export interface PosVoidSaleDialogData {
  sale: SaleDetailDto;
  onSuccess: (voidedSale: SaleDetailDto) => void;
}

export interface PostSaleDialogData {
  sale: SaleDetailDto;
  /** Factory called with the current sale (may be voided after a void action). */
  renderReceipt: (sale: SaleDetailDto) => ReactNode;
}

export interface OrderDetailDialogData {
  /** Order ID used to fetch the full OrderDetailDto on mount. */
  orderID: string;
  /** Factory called with the fetched / updated order detail for receipt rendering. */
  renderReceipt: (order: SaleDetailDto) => ReactNode;
  /** Called after a successful void or refund so the orders list can refresh. */
  onStateChange?: (updated: SaleDetailDto) => void;
}

export type CMSValue = { elementType?: string | { [key: string]: string } };

export interface MixedValue<T> extends CMSValue {
  value: T;
}

export interface StringValue extends CMSValue {
  value: string;
}

export interface BooleanValue extends CMSValue {
  value: boolean;
}

export interface NumberValue extends CMSValue {
  value: number;
}

export interface SelectionValue<T = string> {
  value?: {
    label: T;
    selection: T;
  };
}

export interface AccessGroupsValue extends CMSValue {
  values: {
    creatorId: string;
    typeId: string;
    id: string;
    status: string;
    url: string;
    protectedUrl: string;
  }[];
}

export interface MultiSelectionValue<T = string> {
  values?: {
    label: T;
    selection: T;
  }[];
}

export interface PageWidget {
  pageUrl: string;
  imageRelativeUrl: string;
}

export type ValueFormatType =
  | "Text"
  | "Date"
  | "Label"
  | "Multirows"
  | "File list"
  | "SortCode";

export type FormatSelection = SelectionValue<ValueFormatType>;

export type ButtonType =
  | "Primary"
  | "Secondary"
  | "PrimaryDarkBG"
  | "SecondaryDarkBG"
  | "Critical"
  | "Success"
  | "Link"
  | "ButtonWithIcon";

export type ButtonSelection = SelectionValue<ButtonType>;

export interface FileValue {
  asset: {
    altText: string;
    fileName: string;
    fileSize: number;
    height?: number;
    id: string;
    mediaType: string;
    resourceUri: string;
    width?: number;
  };
  link?: {
    target?: string;
    url?: string;
  };
  elementType: string;
  mode?: string;
  renditions?: {
    default?: {
      height?: number;
      source: string;
      url: string;
      width?: number;
    };
  };
  url: string;
  value?: string;
}

export type DialogDataType = {
  CategoryView: CategoryDataList;
  CategoryEdit: CategoryDataList;
  CategoryDelete: CategoryDataList;
  CategoryCreate: undefined; // No data needed for create
  UserAccessManagement: undefined;

  ProductView: ProductDataList;
  ProductEdit: ProductDataList;
  ProductDelete: ProductDataList;
  ProductBulkDelete: { ids: string[]; count: number };
  ProductCreate: undefined;

  RecipeView: {
    recipe: RecipeResponse;
    productionCapacity?: ProductionCapacity;
  };
  RecipeEdit: RecipeResponse;
  RecipeDelete: RecipeResponse;
  RecipeCreate: undefined;

  InventoryView: InventoryDto;
  InventoryAdjust: InventoryDto;
  InventoryThresholds: InventoryDto;
  InventoryDelete: InventoryDto;
  InventoryHistory: InventoryDto;

  UserView: UserDto;
  UserEdit: UserDto;
  UserDelete: UserDto;
  UserLock: UserDto;
  UserUnlock: UserDto;
  UserRevokeTokens: UserDto;

  SupplierView: SupplierDto;
  SupplierEdit: SupplierDto;
  SupplierDelete: SupplierDto;

  PurchaseOrderCreate: { prefillItems?: Array<{ productID: string; productName: string; quantity: number }> } | undefined;
  PurchaseOrderReceive: PurchaseOrderDetailDto;
  PurchaseOrderAddInvoice: PurchaseOrderDetailDto;
  InvoiceRecordPayment: SupplierInvoiceDetailDto;

  PosCharge: PosChargeDialogData;
  PosReceipt: PosReceiptDialogData;
  PosVoidSale: PosVoidSaleDialogData;
  PostSale: PostSaleDialogData;
  OrderDetail: OrderDetailDialogData;

  PlatformView: PlatformDto;
  PlatformCreate: undefined;
  PlatformEdit: PlatformDto;
  AssignUserDialogContent: PlatformDto;
};

// Dialog content type as a union
export type DialogContentType = keyof DialogDataType;

export interface DialogElement {
  value?: {
    elements?: {
      closeDialogButtonText?: StringValue;
      dialogKey?: StringValue;
      header?: StringValue;
      dataSourceUrl?: StringValue;
      callToAction?: CallToAction;
      showInAlternateStyle?: BooleanValue;
      hideCloseInAlternateStyle?: BooleanValue;
      hideModalCloseButton?: BooleanValue;
    };
    type: "Dialog";
  };
  title?: string;
  dialogContentType?: DialogContentType;
  data?: DialogDataType[DialogContentType];
  onSuccess?: () => void;
  onClose?: () => void;
}

export type CustomDialogElement = DialogElement & {
  customOnClick?: AsyncFunction | (() => void);
  customOnClose?: AsyncFunction | (() => void);
  loading?: boolean;
};

export interface CallToAction {
  values: {
    elements: ButtonElements;
  }[];
  value?: {
    elements: ButtonElements;
  };
}

export interface ButtonElements {
  customActionKey?: StringValue;
  analyticsKey?: StringValue;
  anchor?: StringValue;
  buttonKey?: StringValue;
  buttonLink?: StringValue;
  buttonText?: StringValue;
  notification?: StringValue;
  openDialog?: DialogElement;
  buttonType?: ButtonSelection;
  pageKey?: StringValue;
  icon?: FileValue;
  iconName?: StringValue;
  rightSideIcon?: BooleanValue;
  largeIcon?: BooleanValue;
  openFile?: FileValue;
  openInTheNewTab?: BooleanValue;
  reuseUrlParameters?: BooleanValue;
  disabled?: BooleanValue;
  widthPercentage?: NumberValue;
  disabledReason?: StringValue;
  fastForwardComparisonPageKey?: StringValue;
  fastForwardRedirectPageKey?: StringValue;
  postToEndpoint?: StringValue;
}
