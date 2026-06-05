import React from "react";
import { InformationMessage } from "./InformationMessage";
import { Message } from "./Message";
import { MessageProps } from "../../../blocks/messages/types";

interface Props extends MessageProps {
  isInfoBlock?: boolean;
}

export const MessageBlock: React.FC<Props> = ({ isInfoBlock, ...props }) => {
  if (isInfoBlock) {
    return <InformationMessage {...props} text={props.text} loading={false} />;
  }

  return <Message {...props} text={props.text} loading={false} />;
};
