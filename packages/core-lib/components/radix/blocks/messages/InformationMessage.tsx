import React from "react";
import { Box, Flex, Heading, Spinner, Text } from "@radix-ui/themes";
import { MessageProps } from "../../../blocks/messages/types";
import { Button } from "../../buttons/Button";

export const InformationMessage: React.FC<MessageProps> = ({
  id,
  html,
  text,
  header,
  loading,
  buttons,
  dataReplaceProps,
}) => {
  const hasButtons = !!buttons?.length;

  return (
    <Box
      id={id}
      role="note"
      data-testid="information-message-component"
      p="5"
      style={{
        position: "relative",
        borderRadius: 16,
        background: "var(--accent-a3)",
        color: "var(--accent-11)",
      }}
      {...dataReplaceProps?.(id, html)}
    >
      <Flex direction="column" gap="3">
        {header && (
          <Heading
            as="h2"
            size="3"
            weight="bold"
            className="info-message-header"
            style={{ color: "inherit" }}
          >
            {header}
          </Heading>
        )}

        {loading ? (
          <Flex align="center" gap="2">
            <Spinner size="2" loading />
            <Text size="2" style={{ color: "inherit" }}>
              Loading…
            </Text>
          </Flex>
        ) : (
          (html || text) && (
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
          )
        )}

        {hasButtons && (
          <Flex direction="column" gap="3">
            {buttons!.map((button, index) => (
              <Button
                key={index}
                type="Secondary"
                fullWidth
                customActionKey={button.customActionKey}
                href={button.link}
                data-testid={`information-message-button-${index}`}
              >
                {button.text}
              </Button>
            ))}
          </Flex>
        )}
      </Flex>
    </Box>
  );
};
