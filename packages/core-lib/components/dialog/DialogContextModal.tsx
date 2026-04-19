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
  ProductDataList,
  ProductionCapacity,
  RecipeResponse,
  UnitConversionResponse,
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
  UnitConversionDeleteDialog,
  UnitConversionEditDialog,
  UnitConversionViewDialog,
} from "./contents/unitconversion"

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

    default:
      return null;
    
    case "UnitConversionView":
    return(
      <UnitConversionViewDialog
      conversion={dialogData as UnitConversionResponse}
      />
    );
    case "UnitConversionEdit":
      return(
        <UnitConversionEditDialog
        conversion={dialogData as UnitConversionResponse}
        onSuccess={onSuccess!}
        onClose={onClose!}
        />
      );
    case "UnitConversionDelete":
      return(
        <UnitConversionDeleteDialog
        conversion={dialogData as UnitConversionResponse}
        onSuccess={onSuccess!}
        onClose={onClose!}
        />

      );
  }
};
