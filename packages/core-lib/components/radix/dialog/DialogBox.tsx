import React, {
  ForwardedRef,
  forwardRef,
  memo,
  ReactNode,
  useCallback,
  useId,
  useMemo,
} from "react";
import {
  Dialog,
  Flex,
  Heading,
  Text,
  IconButton,
  Box,
  Spinner,
} from "@radix-ui/themes";
import { Cross1Icon } from "@radix-ui/react-icons";

export interface DialogBoxProps {
  open: boolean;
  onClose?: (
    event: object,
    reason: "backdropClick" | "escapeKeyDown" | "closeClick" | "programmatic",
  ) => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  hideCloseButton?: boolean;
  disableDismiss?: boolean;
  loading?: boolean;
  /** Radix `maxWidth` is a CSS value (e.g. "600px"). For MUI parity we also
   *  accept "xs"|"sm"|"md"|"lg"|"xl" and map to sensible pixel widths. */
  maxWidth?:
    | "xs"
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | (string & {});
  actions?: ReactNode;
  footer?: ReactNode;
  stickyFooter?: boolean;
  fullScreenOnMobile?: boolean;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  actionsClassName?: string;
  "data-testid"?: string;
  children?: ReactNode;
}

const SIZE_TO_WIDTH: Record<string, string> = {
  xs: "420px",
  sm: "560px",
  md: "720px",
  lg: "900px",
  xl: "1140px",
};

export const DialogBox = memo(
  forwardRef(function DialogBox(
    props: DialogBoxProps,
    ref: ForwardedRef<HTMLDivElement>,
  ) {
    const {
      open,
      onClose,
      title,
      subtitle,
      hideCloseButton,
      disableDismiss,
      loading = false,
      maxWidth = "md",
      actions,
      footer,
      stickyFooter = false,
      fullScreenOnMobile = true,
      className,
      contentClassName,
      headerClassName,
      actionsClassName,
      "data-testid": dataTestId = "dialog-box",
      children,
    } = props;

    const titleId = useId();
    const contentId = useId();

    const resolvedMaxWidth = useMemo(() => {
      if (maxWidth in SIZE_TO_WIDTH) return SIZE_TO_WIDTH[maxWidth];
      return String(maxWidth);
    }, [maxWidth]);

    const guardedClose = useCallback(
      (
        e: object,
        reason: "backdropClick" | "escapeKeyDown" | "closeClick" | "programmatic",
      ) => {
        if (loading || disableDismiss) return;
        onClose?.(e, reason);
      },
      [disableDismiss, loading, onClose],
    );

    return (
      <Dialog.Root
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) guardedClose({}, "backdropClick");
        }}
      >
        <Dialog.Content
          ref={ref}
          className={className}
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={contentId}
          data-testid={dataTestId}
          style={{
            maxWidth: resolvedMaxWidth,
            position: "relative",
            padding: 0,
            ...(fullScreenOnMobile
              ? {
                  // Radix already handles small viewports well; this gives us
                  // an extra nudge to full-screen on phones.
                }
              : {}),
          }}
          onEscapeKeyDown={(e) => {
            if (loading || disableDismiss) {
              e.preventDefault();
              return;
            }
            guardedClose(e, "escapeKeyDown");
          }}
          onInteractOutside={(e) => {
            if (loading || disableDismiss) {
              e.preventDefault();
              return;
            }
          }}
        >
          {(title || !hideCloseButton) && (
            <Flex
              align="center"
              justify="between"
              gap="3"
              px="5"
              py="4"
              className={headerClassName}
              style={{
                position: "sticky",
                top: 0,
                background: "var(--color-panel-solid)",
                borderBottom: "1px solid var(--gray-a4)",
                zIndex: 1,
              }}
            >
              <Box>
                {title && (
                  <Dialog.Title>
                    <Heading id={titleId} size="4" weight="bold">
                      {title}
                    </Heading>
                  </Dialog.Title>
                )}
                {subtitle && (
                  <Text size="2" color="gray">
                    {subtitle}
                  </Text>
                )}
              </Box>

              {!hideCloseButton && (
                <IconButton
                  variant="ghost"
                  size="2"
                  color="gray"
                  aria-label="Close"
                  disabled={loading || disableDismiss}
                  onClick={(e) => guardedClose(e, "closeClick")}
                  data-testid={`${dataTestId}-close`}
                >
                  <Cross1Icon />
                </IconButton>
              )}
            </Flex>
          )}

          <Box
            id={contentId}
            px="5"
            py="4"
            className={contentClassName}
            style={{
              maxHeight: "70vh",
              overflowY: "auto",
              position: "relative",
            }}
          >
            {children}
            {loading && (
              <Box
                role="status"
                aria-live="polite"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "var(--color-overlay)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(2px)",
                }}
              >
                <Flex
                  gap="2"
                  align="center"
                  px="3"
                  py="2"
                  style={{
                    background: "var(--color-panel-solid)",
                    borderRadius: "var(--radius-3)",
                    boxShadow: "var(--shadow-4)",
                  }}
                >
                  <Spinner loading />
                  <Text size="2">Please wait…</Text>
                </Flex>
              </Box>
            )}
          </Box>

          {(actions || footer) && (
            <Flex
              justify="end"
              gap="3"
              px="5"
              py="3"
              className={actionsClassName}
              style={{
                position: stickyFooter ? "sticky" : "static",
                bottom: 0,
                background: "var(--color-panel-solid)",
                borderTop: "1px solid var(--gray-a4)",
              }}
            >
              {actions ?? footer}
            </Flex>
          )}
        </Dialog.Content>
      </Dialog.Root>
    );
  }),
);
