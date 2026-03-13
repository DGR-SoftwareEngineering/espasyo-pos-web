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
import { CategoryDataList, ProductDataList } from "../../api/commons/types";
import {
  ProductDeleteDialog,
  ProductEditDialog,
  ProductViewDialog,
} from "../blocks/products/list/dialogs/ProductDialogs";

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
      return <ProductViewDialog product={dialogData as ProductDataList} />;
    case "ProductEdit":
      return (
        <ProductEditDialog
          product={dialogData as ProductDataList}
          onSuccess={onSuccess!}
          onClose={onClose!}
        />
      );
    case "ProductDelete":
      return (
        <ProductDeleteDialog
          product={dialogData as ProductDataList}
          onSuccess={onSuccess!}
          onClose={onClose!}
        />
      );
    case "ProductCreate":
      // You'll create this later
      return <div>Product Create Form (Coming Soon)</div>;

    default:
      return null;
  }
};
