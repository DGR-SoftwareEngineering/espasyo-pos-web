import {
  ActionColumnCustomizationType,
  DataTableColumn,
  PageContentValues,
} from "../../../api/content/types/page";

export const parseButtonProps = (
  element: Partial<NonNullable<PageContentValues["elements"]>>
) => {
  return {
    key: element.buttonKey?.value,
    customActionKey: element.customActionKey?.value,
    linkKey: element.pageKey?.value,
    link: element.buttonLink?.value,
    anchor: element.anchor?.value ? formatAnchor(element.anchor.value) : "",
    type: element.buttonType?.value?.selection,
    text: element.buttonText?.value,
    icon: element.icon,
    iconName: element.iconName?.value,
    rightSideIcon: element.rightSideIcon?.value,
    notification: element.notification?.value,
    reuseUrlParameters: element.reuseUrlParameters?.value,
    openInTheNewTab: element.openInTheNewTab?.value,
    widthPercentage: element.widthPercentage?.value,
    disabledReason: element.disabledReason?.value,
    analyticsKey: element.analyticsKey?.value,
    dialogElement: element.openDialog,
    fastForwardComparisonPageKey: element.fastForwardComparisonPageKey?.value,
    fastForwardRedirectPageKey: element.fastForwardRedirectPageKey?.value,
    postRequestUrl: element.postToEndpoint?.value,
    largeIcon: element.largeIcon?.value,
    disabled: element.disabled?.value,
  };
};

export type ParsedButtonProps = ReturnType<typeof parseButtonProps>;

function formatAnchor(anchor: string) {
  return `#${encodeURIComponent(anchor).trim()}`;
}

export interface DataTableProps {
  id: string;
  tableKey?: string;
  sourceUrl?: string;
  paramName?: string;
  pageSize?: number;
  isFunctional?: boolean;
  withLabelPrefix?: boolean;
  columns?: DataTableColumn[];
  defaultOrderingColumn?: string;
  defaultOrderingOrder?: string;
  selectableRows?: boolean;
  buttons?: ParsedButtonProps[];
  actionColumn?: ActionColumnProps;
}

export interface ActionColumnProps {
  column?: string | null;
  status?: string | null;
  customization?: ActionColumnCustomizationType["values"] | null;
}
export interface DataTableV2Props {
  id: string;
  tableKey?: string;
  sourceUrl?: string;
  paramName?: string;
  pageSize?: number;
  withLabelPrefix?: boolean;
  columns?: DataTableColumn[];
  defaultOrderingColumn?: string;
  defaultOrderingOrder?: string;
  selectableRows?: boolean;
  buttons?: ParsedButtonProps[];
  actionColumn?: ActionColumnProps;
}

export type DataTableRow = Record<string, string>;

export type DataTableResponse<TRow = DataTableRow> = {
  items?: TRow[];
} & Record<string, TRow[]>;
