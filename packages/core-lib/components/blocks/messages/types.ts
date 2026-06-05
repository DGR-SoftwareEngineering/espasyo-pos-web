import { MessageType } from "../../topAlertMessages/types";
import { CmsButton } from "../../../cms/types";

export interface MessageProps {
  id?: string;
  html?: string;
  text?: string;
  icon?: string;
  buttons?: CmsButton[];
  type?: MessageType;
  header?: string;
  loading?: boolean;
  dataReplaceProps?: (
    key?: string,
    path?: string
  ) => { "aria-tag"?: undefined } | { "aria-tag": string | undefined };
}
