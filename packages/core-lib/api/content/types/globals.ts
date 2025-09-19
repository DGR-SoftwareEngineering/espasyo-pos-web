import {
  BooleanValue,
  ButtonElements,
  CallToAction,
  DialogElement,
  NumberValue,
  SelectionValue,
  StringValue,
} from "./common";
import { PanelListItem, ThemeBackgroundColorSelection } from "./page";

export interface CmsGlobals {
  buttons?: ButtonsEntity[] | null;
  tooltips?: TooltipsEntity[] | null;
  badges?: BadgesEntity[] | null;
  labels?: LabelsEntity[] | null;
  errors?: ErrorsEntity[] | null;
  messages?: MessagesEntity[] | null;
  modals?: ModalsEntity[] | null;
  dialogs?: DialogElement["value"][] | null;
  contentHtmlBlocks?: ContentBlockEntity[] | null;
  classifiers?: ClassifierEntity[] | null;
  icons?: IconsEntity[] | null;
}

export type PreloadedGlobals = Pick<CmsGlobals, "labels">;

interface ClassifierEntity {
  elements: {
    classifierKey?: StringValue;
    classifierItem: { values: { key: StringValue; value: StringValue }[] };
    assetItems: {
      values: {
        key: StringValue;
        value: {
          url: string;
        };
      }[];
    };
  };
  type: "Classifier";
}

interface ButtonsEntity {
  elements: ButtonElements;
  type: string;
}

interface TooltipsEntity {
  elements: {
    contentText: StringValue;
    headerText: StringValue;
    linkText: StringValue;
    tooltipKey: StringValue;
    makeInline: BooleanValue;
  };
  type: string;
}

interface BadgesEntity {
  elements: {
    badgeKey: StringValue;
    dataSourceUrl: StringValue;
    elementColor: ThemeBackgroundColorSelection;
    themeColorForBackground: ThemeBackgroundColorSelection;
    title: StringValue;
    makeInline: BooleanValue;
    addBorder: BooleanValue;
  };
  type: string;
}

interface ModalsEntity {
  elements: {
    header: StringValue;
    linkText: StringValue;
    text: StringValue;
    callToAction: CallToAction;
    modalInformationKey: StringValue;
    showInAlternateStyle: BooleanValue;
    hideCloseInAlternateStyle: BooleanValue;
    panel: { value: PanelListItem };
  };
  type: string;
}

interface LabelsEntity {
  elements: {
    labelKey: StringValue;
    labelText: StringValue;
    linkTarget: StringValue;
  };
  type: string;
}

interface ErrorsEntity {
  elements?: {
    alternateTexts: StringValue;
    errorKey: StringValue;
    text: StringValue;
  };
  type: string;
}

interface MessagesEntity {
  elements: {
    text: StringValue;
    header: StringValue;
    type: SelectionValue;
    messageKey: StringValue;
    callToAction: CallToAction;
    icon: StringValue;
  };
  type: string;
}

interface ContentBlockEntity {
  elements: {
    content: StringValue;
    contentBlockKey: StringValue;
    header: StringValue;
    headerLink: StringValue;
    subHeader?: StringValue;
    themeColorForBackground: StringValue;
  };
  type: string;
}

interface IconsEntity {
  elements: {
    iconKey: StringValue;
    iconName: StringValue;
    width: NumberValue;
    height: NumberValue;
    color: StringValue;
    svgData?: StringValue;
  };
  type: string;
}
