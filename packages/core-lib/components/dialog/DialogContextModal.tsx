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
  RecipeResponse,
  SupplierDto,
  UserDto,
} from "../../api/commons/types";
import {
  ProductViewDialogContent,
  ProductEditDialogContent,
  ProductDeleteDialogContent,
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

    default:
      return null;
  }
};
