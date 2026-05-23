import React from "react";
import {
  DialogContentType,
  DialogDataType,
} from "../../api/content/types/common";
import {
  CategoryViewDialog,
  CategoryDeleteDialog,
  CategoryEditDialog,
} from "../blocks/category/dialogs/CategoryDialogs";
import {
  CategoryDataList,
  InventoryDto,
  ProductDataList,
  ProductionCapacity,
  PurchaseOrderDetailDto,
  RecipeResponse,
  SupplierDto,
  SupplierInvoiceDetailDto,
  UserDto,
} from "../../api/commons/types";
import type {
  OrderDetailDialogData,
  PosChargeDialogData,
  PosVoidSaleDialogData,
  PostSaleDialogData,
} from "../../api/content/types/common";
import {
  ProductViewDialogContent,
  ProductEditDialogContent,
  ProductDeleteDialogContent,
  ProductBulkDeleteDialogContent,
} from "./contents";
import {
  RecipeViewDialogContent,
  RecipeDeleteDialogContent,
  RecipeEditDialogContent,
} from "./contents/recipe";
import {
  InventoryViewDialogContent,
  AdjustStockDialogContent,
  ThresholdsDialogContent,
  InventoryDeleteDialogContent,
  MovementHistoryDialogContent,
} from "./contents/inventory";
import {
  UserViewDialogContent,
  UserEditDialogContent,
  UserDeleteDialogContent,
} from "./contents/users";
import {
  SupplierViewDialogContent,
  SupplierEditDialogContent,
  SupplierDeleteDialogContent,
} from "./contents/suppliers";
import {
  CreatePurchaseOrderDialogContent,
  ReceiveItemsDialogContent,
  AddInvoiceDialogContent,
  RecordPaymentDialogContent,
} from "./contents/procurement";
import {
  CompleteSaleDialogContent,
  OrderDetailDialogContent,
  PostSaleDialogContent,
  VoidSaleDialogContent,
} from "./contents/pos";

interface Props {
  dialogFormType?: DialogContentType;
  dialogData?: DialogDataType[DialogContentType];
  onSuccess?: () => void;
  onClose?: () => void;
}

export const DialogContextModal: React.FC<Props> = ({
  dialogFormType,
  dialogData,
  onSuccess,
  onClose,
}) => {
  if (!dialogFormType) return null;

  switch (dialogFormType) {
    case "UserAccessManagement":
      return <>Dialog for user access management</>;

    // Category dialogs
    case "CategoryView":
      return <CategoryViewDialog category={dialogData as CategoryDataList} />;
    case "CategoryEdit":
      return (
        <CategoryEditDialog
          category={dialogData as CategoryDataList}
          onSuccess={onSuccess!}
          onClose={onClose!}
          isInDialog={true}
        />
      );
    case "CategoryDelete":
      return (
        <CategoryDeleteDialog
          category={dialogData as CategoryDataList}
          onSuccess={onSuccess!}
          onClose={onClose!}
        />
      );

    // Product dialogs
    case "ProductView":
      return (
        <ProductViewDialogContent product={dialogData as ProductDataList} />
      );
    case "ProductEdit":
      return (
        <ProductEditDialogContent
          product={dialogData as ProductDataList}
          onSuccess={onSuccess!}
          onClose={onClose!}
        />
      );
    case "ProductDelete":
      return (
        <ProductDeleteDialogContent
          product={dialogData as ProductDataList}
          onSuccess={onSuccess!}
          onClose={onClose!}
        />
      );
    case "ProductBulkDelete": {
      const bulkData = dialogData as { ids: string[]; count: number };
      return (
        <ProductBulkDeleteDialogContent
          ids={bulkData.ids}
          count={bulkData.count}
          onSuccess={onSuccess!}
          onClose={onClose!}
        />
      );
    }
    // Recipe dialogs
    case "RecipeView":
      const viewData = dialogData as {
        recipe: RecipeResponse;
        productionCapacity?: ProductionCapacity;
      };
      return (
        <RecipeViewDialogContent
          recipe={viewData.recipe}
          productionCapacity={viewData.productionCapacity}
        />
      );
    case "RecipeEdit":
      return (
        <RecipeEditDialogContent
          recipe={dialogData as RecipeResponse}
          onSuccess={onSuccess!}
          onClose={onClose!}
        />
      );
    case "RecipeDelete":
      return (
        <RecipeDeleteDialogContent
          recipe={dialogData as RecipeResponse}
          onSuccess={onSuccess!}
          onClose={onClose!}
        />
      );
    case "ProductCreate":
      // You'll create this later
      return <div>Product Create Form (Coming Soon)</div>;

    // Inventory dialogs
    case "InventoryView":
      return (
        <InventoryViewDialogContent inventory={dialogData as InventoryDto} />
      );
    case "InventoryAdjust":
      return (
        <AdjustStockDialogContent
          inventory={dialogData as InventoryDto}
          onSuccess={onSuccess!}
          onClose={onClose!}
        />
      );
    case "InventoryThresholds":
      return (
        <ThresholdsDialogContent
          inventory={dialogData as InventoryDto}
          onSuccess={onSuccess!}
          onClose={onClose!}
        />
      );
    case "InventoryDelete":
      return (
        <InventoryDeleteDialogContent
          inventory={dialogData as InventoryDto}
          onSuccess={onSuccess!}
          onClose={onClose!}
        />
      );
    case "InventoryHistory":
      return (
        <MovementHistoryDialogContent
          inventory={dialogData as InventoryDto}
        />
      );

    case "UserView":
      return <UserViewDialogContent user={dialogData as UserDto} />;
    case "UserEdit":
      return (
        <UserEditDialogContent
          user={dialogData as UserDto}
          onSuccess={onSuccess!}
          onClose={onClose!}
        />
      );
    case "UserDelete":
      return (
        <UserDeleteDialogContent
          user={dialogData as UserDto}
          onSuccess={onSuccess!}
          onClose={onClose!}
        />
      );

    case "SupplierView":
      return (
        <SupplierViewDialogContent supplier={dialogData as SupplierDto} />
      );
    case "SupplierEdit":
      return (
        <SupplierEditDialogContent
          supplier={dialogData as SupplierDto}
          onSuccess={onSuccess!}
          onClose={onClose!}
        />
      );
    case "SupplierDelete":
      return (
        <SupplierDeleteDialogContent
          supplier={dialogData as SupplierDto}
          onSuccess={onSuccess!}
          onClose={onClose!}
        />
      );

    case "PurchaseOrderCreate":
      return (
        <CreatePurchaseOrderDialogContent
          onSuccess={() => onSuccess?.()}
          onClose={onClose!}
        />
      );
    case "PurchaseOrderReceive":
      return (
        <ReceiveItemsDialogContent
          purchaseOrder={dialogData as PurchaseOrderDetailDto}
          onSuccess={onSuccess!}
          onClose={onClose!}
        />
      );
    case "PurchaseOrderAddInvoice":
      return (
        <AddInvoiceDialogContent
          purchaseOrder={dialogData as PurchaseOrderDetailDto}
          onSuccess={onSuccess!}
          onClose={onClose!}
        />
      );
    case "InvoiceRecordPayment":
      return (
        <RecordPaymentDialogContent
          invoice={dialogData as SupplierInvoiceDetailDto}
          onSuccess={onSuccess!}
          onClose={onClose!}
        />
      );

    case "PosCharge":
      return (
        <CompleteSaleDialogContent
          data={dialogData as PosChargeDialogData}
          onClose={onClose!}
        />
      );

    case "PosVoidSale":
      return (
        <VoidSaleDialogContent
          data={dialogData as PosVoidSaleDialogData}
          onClose={onClose!}
        />
      );

    case "PostSale":
      return (
        <PostSaleDialogContent
          data={dialogData as PostSaleDialogData}
          onClose={onClose!}
        />
      );

    case "OrderDetail":
      return (
        <OrderDetailDialogContent
          data={dialogData as OrderDetailDialogData}
          onClose={onClose!}
        />
      );

    default:
      return null;
  }
};
