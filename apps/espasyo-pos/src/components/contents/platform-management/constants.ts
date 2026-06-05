import { PlatformDto } from "core-lib/api/platform/types";
import { FeatureConfigBuilder } from "core-lib/core/types/constants/feature-config.builder";

const config = new FeatureConfigBuilder<PlatformDto>("Platform")
  .setTableHeaders([
    { id: "name", name: "Platform", width: "30%", sortable: true, align: "left" },
    { id: "slugKey", name: "Slug Key", width: "20%", sortable: false, align: "left" },
    { id: "isSystem", name: "Type", width: "12%", sortable: false, align: "left" },
    { id: "isActive", name: "Status", width: "12%", sortable: false, align: "left" },
    { id: "actions", name: "Actions", width: "26%", sortable: false, align: "right" },
  ])
  .setSortOptions([])
  .setSortStrategies({})
  .build();

export const TABLE_HEADERS = config.TABLE_HEADERS;

export const DIALOG_TYPES = {
  view: "PlatformView",
  edit: "PlatformEdit",
  delete: "PlatformDelete",
  manageUsers: "AssignUserDialogContent",
  create: "PlatformCreate",
};

export const DIALOG_TITLES = {
  view: "Platform Details",
  edit: "Edit Platform",
  delete: "Delete Platform",
  manageUsers: "Manage Users",
  create: "New Platform",
};
