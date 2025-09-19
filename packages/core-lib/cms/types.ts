import {
  ButtonType,
  DialogElement,
  FileValue,
} from "../api/content/types/common";
import { PanelListItem } from "../api/content/types/page";

export type InterpolationTokens = { [key: string]: string | null | undefined };

export interface CmsModal {
  header?: string;
  text?: string;
  linkText?: string;
  buttons?: CmsButton[];
  key?: string;
  isAlternateStyle?: boolean;
  hideCloseInAlternateStyle?: boolean;
  panel?: PanelListItem;
}

export interface CmsTooltip {
  header?: string;
  html?: string;
  text?: string;
  key?: string;
  makeInline?: boolean;
}

export interface CmsBadge {
  key: string;
  text?: string;
  backgroundColor?: string;
  borderColor?: string;
  color?: string;
  accessibilityText?: string;
  urls?: string;
  makeInline?: boolean;
  addBorder?: boolean;
}

export interface CmsButton {
  customActionKey?: string;
  anchor?: string;
  linkKey?: string;
  link?: string;
  type?: ButtonType;
  text?: string;
  key?: string;
  pageKey?: string;
  openInTheNewTab?: boolean;
  icon?: FileValue;
  widthPercentage?: number;
  notification?: string;
  disabledReason?: string;
  dialogElement?: DialogElement;
}

export interface CmsLabel {
  key?: string;
  value?: string;
  linkTarget?: string;
}

export interface CmsMessage {
  key?: string;
  type: string;
  header?: string;
  html?: string;
  icon?: string;
  buttons?: CmsButton[];
}

export interface CmsError {
  alt?: string;
  key?: string;
  text?: string;
}

export interface CmsHtmlContent {
  key: string;
  header: string;
  subHeader?: string;
  html: string;
  backgroundColor: string;
}

export interface CmsIcon {
  key: string;
  name: string;
  width: number;
  height: number;
  color: string;
  svgData?: string;
}
