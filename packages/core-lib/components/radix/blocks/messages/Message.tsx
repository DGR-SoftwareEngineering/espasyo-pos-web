import React from "react";
import { Box, Flex, Text } from "@radix-ui/themes";
import { useResolution } from "../../../../core/hooks";
import { MessageType } from "../../../topAlertMessages/types";
import { MessageProps } from "../../../blocks/messages/types";
import { ListLoader } from "../../loaders/ListLoader";
import { Button } from "../../buttons/Button";
import { MessageIconBox } from "./MessageIconBox";

type Props = MessageProps & { section?: boolean };

interface PaletteEntry {
  text: string;
  border: string;
  background: string;
}

const PALETTE: Record<MessageType, PaletteEntry> = {
  [MessageType.Info]: {
    text: "var(--green-11)",
    border: "var(--green-9)",
    background: "var(--green-a3)",
  },
  [MessageType.Success]: {
    text: "var(--green-11)",
    border: "var(--green-9)",
    background: "var(--green-a3)",
  },
  [MessageType.Problem]: {
    text: "var(--red-11)",
    border: "var(--red-9)",
    background: "var(--red-a3)",
  },
  [MessageType.Warning]: {
    text: "var(--gray-12)",
    border: "var(--amber-9)",
    background: "var(--amber-a3)",
  },
  [MessageType.Note]: {
    text: "var(--gray-12)",
    border: "var(--amber-9)",
    background: "var(--amber-a3)",
  },
};

export const Message: React.FC<Props> = ({
  id,
  type = MessageType.Info,
  html,
  text,
  icon,
  buttons,
  loading,
  section,
  dataReplaceProps,
}) => {
  const { isMobile } = useResolution();
  const palette = PALETTE[type];
  const hasButtons = !!buttons?.length;

  if (loading) {
    return <ListLoader data-testid="message-loader" loadersCount={1} />;
  }

  const Container = section ? "section" : "div";
  const containerRole = section ? undefined : "mark";

  return (
    <Container
      id={id}
      role={containerRole}
      data-testid="message-component"
      style={{
        position: "relative",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "stretch" : "center",
        padding: 24,
        gap: isMobile ? 16 : 24,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: palette.border,
        backgroundColor: palette.background,
        borderLeft: isMobile ? undefined : `4px solid ${palette.border}`,
        borderTop: isMobile ? `4px solid ${palette.border}` : undefined,
        color: palette.text,
      }}
      {...dataReplaceProps?.(id, html)}
    >
      {type && type !== MessageType.Note && (
        <Flex
          justify="center"
          align="center"
          style={{
            width: isMobile ? "100%" : 24,
            flexShrink: 0,
          }}
        >
          <MessageIconBox icon={icon} type={type} size="medium" />
        </Flex>
      )}

      <Flex direction="column" gap={hasButtons ? "4" : "0"} style={{ flex: 1 }}>
        {(html || text) && (
          <Box>
            {html ? (
              <Box
                dangerouslySetInnerHTML={{ __html: html }}
                style={{ color: "inherit" }}
              />
            ) : (
              <Text style={{ color: "inherit" }}>{text}</Text>
            )}
          </Box>
        )}

        {hasButtons && (
          <Flex gap="3" wrap="wrap">
            {buttons!.map((button, idx) => (
              <Box
                key={idx}
                style={{
                  width: isMobile
                    ? "100%"
                    : button.widthPercentage
                      ? `${button.widthPercentage}%`
                      : "auto",
                }}
              >
                <Button
                  type={button.type ?? "Primary"}
                  customActionKey={button.customActionKey}
                  href={button.link}
                  fullWidth={isMobile || !!button.widthPercentage}
                  data-testid={`message-button-${idx}`}
                >
                  {button.text}
                </Button>
              </Box>
            ))}
          </Flex>
        )}
      </Flex>
    </Container>
  );
};
