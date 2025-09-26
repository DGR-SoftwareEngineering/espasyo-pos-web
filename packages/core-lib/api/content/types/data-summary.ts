import {
  BooleanValue,
  CMSValue,
  CallToAction,
  FormatSelection,
  StringValue,
} from "./common";

export interface DataSummaryBlocksValue {
  elements: {
    header: StringValue;
    highlightedBackground: BooleanValue;
    summaryItems: { values: DataSummaryBlocksValue[] };
    hideButtonColumn?: BooleanValue;
  };
  type: string;
}

interface DataSummaryItemElements {
  description: StringValue;
  divider: BooleanValue;
  explanationSummaryItems: ExplanationDataSummaryItems;
  format: FormatSelection;
  header: StringValue;
  link: StringValue;
  linkText: StringValue;
  tooltip: Tooltip;
  value: StringValue;
  callToAction?: CallToAction;
  boldValue?: BooleanValue;
  showDespiteEmpty?: BooleanValue;
}

interface ExplanationDataSummaryItems {
  elementType?: string;
  values?: {
    elements: DataSummaryItemElements;
    type: string;
  }[];
}

interface Tooltip extends CMSValue {
  value?: {
    elements: {
      contentText: StringValue;
      linkText: StringValue;
      tooltipKey: StringValue;
      headerText: StringValue;
    };
    type: string;
  };
}
