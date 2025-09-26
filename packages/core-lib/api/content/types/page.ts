import {
  AccessGroupsValue,
  BooleanValue,
  ButtonElements,
  CallToAction,
  DialogElement,
  FileValue,
  FormatSelection,
  MixedValue,
  MultiSelectionValue,
  NumberValue,
  PageWidget,
  SelectionValue,
  StringValue,
} from "./common";
import { DataSummaryBlocksValue } from "./data-summary";

export interface PageFeedWidgets {
  widgets: PageWidget[];
}

export interface CmsPageResponse {
  description: string;
}

export interface CmsPage {
  content: PageContent;
  pageHeader?: StringValue;
  headerIcon?: FileValue;
  pageUrl: StringValue;
  pageKey: StringValue;
  showAsStickOut?: BooleanValue;
  backPageKey?: StringValue;
  heroBlocks?: { values: HeroBlock[] };
  pageMenu?: { value: PageContentValues };
  showDialogOnLoad?: DialogElement;
  hideTemplateNavigation?: BooleanValue;
  pageBackground?: BackgroundColorConfig;
}

export interface HeroBlock {
  elements: {
    heroContent: {
      value: PageContentValues;
    };
    heroImage?: FileValue;
  };
  type: string;
}

interface PageElements
  extends Partial<ButtonElements>,
    Partial<ResourceListElements>,
    Partial<ResourceListItemElements>,
    Partial<InfoTileElements>,
    Partial<DataSummaryElements>,
    Partial<TimelineElements>,
    Partial<DataTableElements> {
  textLabel?: StringValue | null;
  type?: SelectionValue;
  themeColorForBackround?: ThemeBackgroundColorSelection | null;
  themeColorForBackground?: ThemeBackgroundColorSelection | null;
  elementColor?: ThemeBackgroundColorSelection | null;
  elementsColor?: ThemeBackgroundColorSelection | null;
  backgroundColor?: ThemeBackgroundColorSelection | null;
  gridBackgroundColour?: StringValue;
  blockeHeader?: BlockHeader | null;
  content?: StringValue | null;
  header?: StringValue;
  panelNameLabel?: StringValue;
  formKey?: StringValue;
  panelList?: { values?: PanelListItem[] };
  panels?: { values?: PanelListItem[] };
  labels?: { values?: LabelValues[] };
  tooltips?: { values?: TooltipValues[] };
  buttons?: { values?: ButonValues[] };
  linkGroups?: { values?: LinkGroup[] };
  cards?: { values?: CardsValues[] };
  text?: StringValue;
  reverseStacking?: BooleanValue;
  layout?: PanelLayoutSelection;
  panelKey?: StringValue;
  columns?: { values?: PanelColumn[]; value?: number };
  rows?: { value?: number };
  bottomPanel?: { value?: PanelListItem };
  showInDropdown?: BooleanValue;
  hideSaveAndExit?: BooleanValue;
  disableCallToAction?: BooleanValue;
  contentBlockKey?: StringValue;
  openFile?: FileValue;
  pageKey?: StringValue;
  customActionKey?: StringValue;
  analyticsKey?: StringValue;
  headerLink?: StringValue;
  subHeader?: StringValue;
  parameters?: Parameters;
  showAlwaysOnTop?: BooleanValue;
  callToAction?: CallToAction;
  callToActionIfData?: CallToAction;
  backgroundColour?: StringValue;
  showInAccordion?: SelectionValue;
  linkText?: StringValue;
  pageMenuItem?: Parameters;
  orderedListItems?: { values?: { elements: OrderedListItemElement }[] };
  orderedListKey?: StringValue;
  hideNumber?: BooleanValue;
  defaultItemImage?: FileValue;
  showAllItems?: BooleanValue;
  items?: StringValue;
  actionButtons?: CallToAction;
  checkbox?: { values: Checkbox[] };
  checkboxListKey?: StringValue;
  description?: StringValue;
  mainContent?: StringValue;
  footerIcon?: FileValue;
  contentBlocks?: { values: PageContentValues[] };
  panel?: { value: PanelListItem };
  errorContent?: StringValue;
  dataSourceUrl?: StringValue;
  errorText?: StringValue;
  alternateTableStyle?: SelectionValue<"Transparent">;
  badgeKey?: StringValue;
  addBorder?: BooleanValue;
  showInAlternateStyle?: BooleanValue;
  hideCloseInAlternateStyle?: BooleanValue;
}

export interface PageContent {
  values?: PageContentValues[] | null;
}

export interface PageContentValues {
  elements: PageElements;
  type: string;
  name: string;
}

export interface PanelListItem {
  elements: {
    columns: { values?: PanelColumn[] };
    header?: StringValue;
    layout?: PanelLayoutSelection;
    reverseStacking?: BooleanValue;
    panelKey?: StringValue;
  };
}

export type ThemeBackgroundColorSelection = SelectionValue<AppColorType>;

export type AppColorType =
  | "Primary"
  | "Secondary"
  | "SecondaryDark"
  | "Tertiary"
  | "TertiaryDark"
  | "Support60"
  | "Support60Dark"
  | "Support80"
  | "Support80Dark"
  | "White"
  | "Black"
  | "None";

export type PanelLayoutSelection = SelectionValue<
  "50/50" | "80/20" | "20/80" | "45/10/45" | "66/33" | "33/33/33" | "100"
>;

export type ResourceItemDisplayType = "Image" | "Icon" | "Video";
export interface ColumnAlignment {
  label: string;
  selection:
    | "top-left"
    | "top-center"
    | "top-right"
    | "middle-left"
    | "middle-center"
    | "middle-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";
}

export type PanelSideSelection = "right" | "left" | "top" | "bottom";

export interface Checkbox {
  checkboxKey: StringValue;
  checkboxText: StringValue;
  isMandatory: BooleanValue;
  defaultState: BooleanValue;
}

export interface ResourceListElements {
  header: StringValue;
  displayType: SelectionValue<ResourceItemDisplayType>;
  resourceListKey: StringValue;
  resources: {
    values: { type: "Resource"; elements: ResourceListItemElements }[];
  };
}

export interface InfoTileElements {
  data: StringValue;
  iconName: StringValue;
  tileKey: StringValue;
  title: StringValue;
  tooltip?: MixedValue<TooltipValues>;
  textColor?: ThemeBackgroundColorSelection | null;
  iconColor?: ThemeBackgroundColorSelection | null;
}

export interface ResourceListItemElements {
  title: StringValue;
  resourceKey: StringValue;
  link: StringValue;
  image: FileValue;
  icon: FileValue;
  document: FileValue;
  documentType: SelectionValue<"Factsheet">;
  standaloneSize: SelectionValue<ResourceItemDisplayType>;
}

interface Parameters {
  values: { key: StringValue; value: StringValue }[];
}

interface LinkGroup {
  elements?: {
    defaultHeaderLabel?: StringValue;
    header?: StringValue;
    items: {
      values?: {
        type: string;
        elements: {
          content: StringValue;
          header: StringValue;
          headerLink: StringValue;
        } | null;
      }[];
    };
  };
}

interface BlockHeader {
  value?: {
    description: string;
    elements: LabelElements;
    id: string;
    name: string;
    status: string;
    type: string;
  };
}

interface LabelElements {
  labelKey: StringValue;
  labelText: StringValue;
  linkTarget: StringValue;
  tenant: StringValue;
}

export interface TooltipValues {
  description: string;
  elements: Tooltip;
  id: string;
  name: string;
  status: string;
  type: string;
}

interface Tooltip {
  accessGroups: StringValue;
  contentText: StringValue;
  headerText: StringValue;
  linkText: StringValue;
  tooltipKey: StringValue;
}

interface LabelValues {
  description: string;
  elements: LabelElements;
  id: string;
  name: string;
  status: string;
  type: string;
}

interface ButonValues {
  description: string;
  elements: ButtonElements;
  id: string;
  name: string;
  status: string;
  type: string;
}

export interface OrderedListItemElement {
  content?: StringValue | null;
  contentBlockKey?: StringValue;
  header?: StringValue | null;
  headerLink?: StringValue;
  showInAccordion?: SelectionValue;
  themeColorForBackround?: ThemeBackgroundColorSelection | null;
}

export interface PanelColumn {
  alignment: { elementType: "optionselection"; value: ColumnAlignment };
  themeColorForBackround?: ThemeBackgroundColorSelection | null;
  contentBlocks?: ContentBlockListItems;
  enablePadding?: BooleanValue;
  roundCorners?: BooleanValue;
  reducedGap?: BooleanValue;
  border?: MultiSelectionValue<PanelSideSelection>;
  paddingSide?: MultiSelectionValue<PanelSideSelection>;
  desktopPaddingMultiplier?: NumberValue;
}

export interface DataSummaryElements {
  dataSourceUrl: StringValue;
  summaryBlocks: {
    values: DataSummaryBlocksValue[];
  };
}

export interface ColorSchemesValue {
  value?: {
    elements: {
      colorSchemes: {
        values: {
          colors: StringValue;
        }[];
      };
    };
  };
}

export type ActionColumnCustomizationType = {
  values?: Array<{
    accessibilityText?: StringValue | null;
    destination?: StringValue | null;
    iconKey?: StringValue | null;
  }>;
};

export interface TimelineElements {
  key: Partial<StringValue>;
  dataSourceUrl: StringValue;
  simplifiedVersion?: BooleanValue;
  timelineItems: {
    values: {
      description: StringValue;
      header: StringValue;
      status: SelectionValue<TimelineItemStatus>;
    }[];
  };
}

export type TimelineItemStatus = "Completed" | "Current" | "Future";

export interface DataTableElements {
  dataColumns: { values: DataTableColumn[] };
  dataArray: StringValue;
  dataSourceUrl: StringValue;
  dataTableKey: StringValue;
  functionalTable: BooleanValue;
  addPrefixForLabelFields: BooleanValue;
  pageSize: NumberValue;
  defaultOrderingColumn: StringValue;
  defaultOrderingOrder: {
    elementType: string;
    value: {
      label: string;
      selection: string;
    };
  };
  selectableRows: BooleanValue;
  actionableColumn?: StringValue | null;
  actionableStatus?: StringValue | null;
  actionColumnCustomisation?: ActionColumnCustomizationType | null;
  actionButton?: CallToAction;
}

export interface DataTableColumn {
  alignment: SelectionValue<"Left" | "Right" | "Center">;
  dataField: StringValue;
  dataFormat: FormatSelection;
  enableSortability?: BooleanValue;
  header: StringValue;
  widthPercentage: NumberValue;
  actionButton?: CallToAction;
}

interface ContentBlockListItems {
  values?: PageContentValues[] | null;
}

export interface BackgroundColorConfig {
  values: BackgroundConfigItem[];
}

export interface CardsValues {
  elements: CardsItem;
  type: string;
}

export interface CardsItem {
  callToAction: CallToAction;
  description: StringValue;
  image: FileValue;
  title: StringValue;
}

export interface BackgroundConfigItem {
  elements: {
    backgroundConfigItemElement: {
      values: BackgroundConfigItemElement[];
    };
  };
  type: "Background Config";
}

export interface BackgroundConfigItemElement {
  backgroundColorBase?: StringValue;
  backgroundColorTop?: StringValue;
  themeBackgroundColorBase?: ThemeBackgroundColorSelection | null;
  themeBackgroundColorTop?: ThemeBackgroundColorSelection | null;
  colorSeparatorId?: StringValue;
}
