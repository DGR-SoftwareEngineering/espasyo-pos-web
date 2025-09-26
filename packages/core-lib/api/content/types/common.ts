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
}

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
