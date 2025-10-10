import { InformationMessage } from "./InformationMessage";
import { Message } from "./Message";
import { MessageProps } from "./types";

interface Props extends MessageProps {
  isInfoBlock?: boolean;
}

export const MessageBlock: React.FC<Props> = ({ isInfoBlock, ...props }) => {
  if (isInfoBlock) {
    return (
      <InformationMessage
        {...props}
        text={props.text}
        // loading set to false by default temporarily.
        loading={false}
      />
    );
  }

  return <Message {...props} text={props.text} loading={false} />;
};
