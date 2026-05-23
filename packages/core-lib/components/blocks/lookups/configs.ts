import {
  ScaleOutlined,
  CategoryOutlined,
  KitchenOutlined,
  PlaceOutlined,
  StorefrontOutlined,
  BusinessCenterOutlined,
} from "@mui/icons-material";
import {
  BrandDto,
  BusinessSupplyCategoryDto,
  IngredientCategoryDto,
  LocationDto,
  ProductCategoryDto,
  UnitDto,
} from "../../../api/commons/types";
import { LookupAdminConfig } from "./types";

export const UNIT_CONFIG: LookupAdminConfig<UnitDto> = {
  entityName: "Unit",
  entityNamePlural: "Units",
  description:
    "Units of measure used by products, recipes, inventory, and stock movements (kg, g, piece, ml, …).",
  icon: ScaleOutlined,
  idField: "unitID",
  parentIdField: "parentUnitID",
  parentNameField: "parentUnitName",
  selectors: {
    list: (api) => api.commons.unitList(),
    create: (api, values) =>
      api.commons.createUnit({
        name: values.name,
        description: values.description || null,
        displayOrder: values.displayOrder,
        parentUnitID: values.parentID,
      }),
    update: (api, id, values) =>
      api.commons.updateUnit({
        unitID: id,
        name: values.name,
        description: values.description || null,
        displayOrder: values.displayOrder,
        parentUnitID: values.parentID,
      }),
    delete: (api, ids) => api.commons.deleteUnits(ids),
  },
};

export const PRODUCT_CATEGORY_CONFIG: LookupAdminConfig<ProductCategoryDto> = {
  entityName: "Product Category",
  entityNamePlural: "Product Categories",
  description:
    "Top-level grouping for menu items / SKUs (Hot Drinks, Pastries, Sandwiches, …).",
  icon: CategoryOutlined,
  idField: "productCategoryID",
  parentIdField: "parentProductCategoryID",
  parentNameField: "parentProductCategoryName",
  enableTree: true,
  selectors: {
    list: (api) => api.commons.productCategoryList(),
    create: (api, values) =>
      api.commons.createProductCategory({
        name: values.name,
        description: values.description || null,
        displayOrder: values.displayOrder,
        parentProductCategoryID: values.parentID,
      }),
    update: (api, id, values) =>
      api.commons.updateProductCategory({
        productCategoryID: id,
        name: values.name,
        description: values.description || null,
        displayOrder: values.displayOrder,
        parentProductCategoryID: values.parentID,
      }),
    delete: (api, ids) => api.commons.deleteProductCategories(ids),
  },
};

export const INGREDIENT_CATEGORY_CONFIG: LookupAdminConfig<IngredientCategoryDto> =
  {
    entityName: "Ingredient Category",
    entityNamePlural: "Ingredient Categories",
    description:
      "Grouping for raw ingredients (Dairy, Meats, Vegetables, Spices, …).",
    icon: KitchenOutlined,
    idField: "ingredientCategoryID",
    parentIdField: "parentIngredientCategoryID",
    parentNameField: "parentIngredientCategoryName",
    selectors: {
      list: (api) => api.commons.ingredientCategoryList(),
      create: (api, values) =>
        api.commons.createIngredientCategory({
          name: values.name,
          description: values.description || null,
          displayOrder: values.displayOrder,
          parentIngredientCategoryID: values.parentID,
        }),
      update: (api, id, values) =>
        api.commons.updateIngredientCategory({
          ingredientCategoryID: id,
          name: values.name,
          description: values.description || null,
          displayOrder: values.displayOrder,
          parentIngredientCategoryID: values.parentID,
        }),
      delete: (api, ids) => api.commons.deleteIngredientCategories(ids),
    },
  };

export const LOCATION_CONFIG: LookupAdminConfig<LocationDto> = {
  entityName: "Location",
  entityNamePlural: "Locations",
  description:
    "Physical stores / warehouses where stock lives (Main Branch, Storage Room, …).",
  icon: PlaceOutlined,
  idField: "locationID",
  parentIdField: "parentLocationID",
  parentNameField: "parentLocationName",
  selectors: {
    list: (api) => api.commons.locationList(),
    create: (api, values) =>
      api.commons.createLocation({
        name: values.name,
        description: values.description || null,
        displayOrder: values.displayOrder,
        parentLocationID: values.parentID,
      }),
    update: (api, id, values) =>
      api.commons.updateLocation({
        locationID: id,
        name: values.name,
        description: values.description || null,
        displayOrder: values.displayOrder,
        parentLocationID: values.parentID,
      }),
    delete: (api, ids) => api.commons.deleteLocations(ids),
  },
};

export const BRAND_CONFIG: LookupAdminConfig<BrandDto> = {
  entityName: "Brand",
  entityNamePlural: "Brands",
  description:
    "Supplier / manufacturer brand tags for products and ingredients (Coca-Cola, Magnolia, Heinz, …).",
  icon: StorefrontOutlined,
  idField: "brandID",
  parentIdField: "parentBrandID",
  parentNameField: "parentBrandName",
  selectors: {
    list: (api) => api.commons.brandList(),
    create: (api, values) =>
      api.commons.createBrand({
        name: values.name,
        description: values.description || null,
        displayOrder: values.displayOrder,
        parentBrandID: values.parentID,
      }),
    update: (api, id, values) =>
      api.commons.updateBrand({
        brandID: id,
        name: values.name,
        description: values.description || null,
        displayOrder: values.displayOrder,
        parentBrandID: values.parentID,
      }),
    delete: (api, ids) => api.commons.deleteBrands(ids),
  },
};

export const BUSINESS_SUPPLY_CATEGORY_CONFIG: LookupAdminConfig<BusinessSupplyCategoryDto> =
  {
    entityName: "Business Supply Category",
    entityNamePlural: "Business Supply Categories",
    description:
      "Grouping for non-sellable business items (Furniture, Equipment, Cleaning Supplies, Uniforms, …).",
    icon: BusinessCenterOutlined,
    idField: "businessSupplyCategoryID",
    parentIdField: "parentBusinessSupplyCategoryID",
    parentNameField: "parentBusinessSupplyCategoryName",
    selectors: {
      list: (api) => api.commons.businessSupplyCategoryList(),
      create: async (api, values) => {
        const response = await api.commons.createBusinessSupplyCategory({
          name: values.name,
          description: values.description || null,
          displayOrder: values.displayOrder,
          parentBusinessSupplyCategoryID: values.parentID,
        });
        return {
          data: { ...response.data, response: "" },
          status: response.status,
        };
      },
      update: async (api, id, values) => {
        const response = await api.commons.updateBusinessSupplyCategory({
          businessSupplyCategoryID: id,
          name: values.name,
          description: values.description || null,
          displayOrder: values.displayOrder,
          parentBusinessSupplyCategoryID: values.parentID,
        });
        return {
          data: { ...response.data, response: "" },
          status: response.status,
        };
      },
      delete: (api, ids) => api.commons.deleteBusinessSupplyCategories(ids),
    },
  };
