import React, {
  ForwardedRef,
  forwardRef,
  memo,
  ReactNode,
  useCallback,
  useId,
  useMemo,
  useState,
} from "react";
import {
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  IconButton,
  Typography,
  SxProps,
  Theme,
  PaperProps,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import Slide from "@mui/material/Slide";
import type { TransitionProps } from "@mui/material/transitions";
import { useResolution } from "../../core/hooks";

type DialogScroll = NonNullable<DialogProps["scroll"]>;

export interface Props extends Omit<DialogProps, "onClose" | "title"> {
  open: boolean;
  onClose: (
    event: object,
    reason: "backdropClick" | "escapeKeyDown" | "closeClick" | "programmatic"
  ) => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  hideCloseButton?: boolean;
  disableDismiss?: boolean;
  loading?: boolean;
  scroll?: DialogScroll;
  maxWidth?: DialogProps["maxWidth"];
  borderRadius?: number | string;
  stickyHeader?: boolean;
  stickyFooter?: boolean;
  actions?: ReactNode;
  footer?: ReactNode;
  contentMaxHeight?: number | string;
  dialogMaxHeight?: number | string;
  fullScreenOnMobile?: boolean;
  resizable?: boolean;
  draggable?: boolean;
  dragHandleSelector?: string;
  "data-testid"?: string;
  headerSx?: SxProps<Theme>;
  contentSx?: SxProps<Theme>;
  actionsSx?: SxProps<Theme>;
  contentHeight?: string;
  isOverflowing?: boolean;
}

type DraggableLikeProps = {
  handle?: string;
  cancel?: string;
  children: ReactNode;
};
type DraggableLikeComponent = React.ComponentType<DraggableLikeProps>;

const DefaultTransition = forwardRef(function DefaultTransition(
  props: TransitionProps & { children: React.ReactElement<unknown> },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

//prep draggable paper for dialog
function useDraggablePaper(
  draggable: boolean,
  handle: string | undefined
): React.ComponentType<PaperProps> | undefined {
  const [draggableComp, setDraggableComp] =
    useState<DraggableLikeComponent | null>(null);
  return undefined;
}

export const DialogBox = memo(
  forwardRef(function DialogBox(
    props: Props,
    ref: ForwardedRef<HTMLDivElement>
  ) {
    const { isSmallMobile } = useResolution();
    const {
      open,
      onClose,
      title,
      subtitle,
      hideCloseButton,
      disableDismiss,
      loading = false,
      scroll: scrollProp,
      maxWidth = "md",
      borderRadius = 0,
      stickyHeader = true,
      stickyFooter = false,
      actions,
      footer,
      contentMaxHeight,
      dialogMaxHeight,
      fullScreenOnMobile = true,
      resizable = false,
      draggable = false,
      dragHandleSelector,
      "data-testid": dataTestId = "dialog-box",
      headerSx,
      contentSx,
      actionsSx,
      contentHeight,
      isOverflowing,
      slots = { transition: DefaultTransition },
      PaperProps,
      BackdropProps,
      ...rest
    } = props;

    const fullScreen = fullScreenOnMobile && isSmallMobile;

    const titleId = useId();
    const contentId = useId();

    const scroll: DialogScroll = useMemo(() => {
      if (typeof isOverflowing === "boolean") {
        console.warn(
          "[DialogBox] `isOverflowing` is deprecated. Use `scroll='paper' | 'body'` instead."
        );
        return isOverflowing ? "paper" : "body";
      }
      return scrollProp ?? "paper";
    }, [isOverflowing, scrollProp]);

    const canonContentMaxHeight = useMemo(() => {
      if (contentHeight) {
        console.warn(
          "[DialogBox] `ContentHeight` is deprecated. Use `contentMaxHeight` instead."
        );
      }
      return contentMaxHeight ?? contentHeight ?? 500;
    }, [contentHeight, contentMaxHeight]);

    const handleCloseGuarded = useCallback(
      (
        event: object,
        reason:
          | "backdropClick"
          | "escapeKeyDown"
          | "closeClick"
          | "programmatic"
      ) => {
        if (loading || disableDismiss) return;
        onClose?.(event, reason);
      },
      [disableDismiss, loading, onClose]
    );

    const handleCloseIcon = useCallback(
      (event: React.MouseEvent) => {
        handleCloseGuarded(event, "closeClick");
      },
      [handleCloseGuarded]
    );

    const computedPaperSx: SxProps<Theme> = useMemo(
      () => ({
        borderRadius,
        ...(dialogMaxHeight ? { maxHeight: dialogMaxHeight } : {}),
        ...(resizable
          ? {
              resize: "both",
              overflow: "auto",
              minWidth: 320,
              minHeight: 240,
            }
          : {}),
        ...(PaperProps?.sx || {}),
      }),
      [PaperProps?.sx, borderRadius, dialogMaxHeight, resizable]
    );

    const LoadingState = loading && (
      <Box
        role="status"
        aria-live="polite"
        sx={{
          position: "absolute",
          inset: 0,
          bgcolor: "rgba(255,255,255,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: (t) => t.zIndex.modal + 1,
          backdropFilter: "blur(1px)",
        }}
      >
        <Box
          sx={{
            p: 2,
            borderRadius: 1,
            bgcolor: "background.paper",
            boxShadow: 3,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <CircularProgress size={22} />
          <Typography variant="body2">Please wait...</Typography>
        </Box>
      </Box>
    );

    return (
      <Dialog
        ref={ref}
        open={open}
        onClose={(e, reason) => {
          if (loading || disableDismiss) return;
          handleCloseGuarded(e, reason as "backdropClick" | "escapeKeyDown");
        }}
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={titleId}
        maxWidth={maxWidth}
        fullWidth
        fullScreen={fullScreen}
        scroll={scroll}
        slots={{ transition: slots.transition }}
        disableEscapeKeyDown={loading || disableDismiss}
        slotProps={{
          paper: {
            ...PaperProps,
            sx: computedPaperSx,
          },
          backdrop: {
            ...BackdropProps,
            sx: { ...(BackdropProps?.sx || {}) },
          },
        }}
        sx={{
          ...(rest.sx || {}),
          "& .MuiDialog-paper": {
            position: "relative",
          },
        }}
        data-testid={dataTestId}
      >
        {(title || !hideCloseButton) && (
          <DialogTitle
            id="dialog-title"
            sx={{
              position: stickyHeader ? "sticky" : "static",
              top: 0,
              zIndex: (t) => t.zIndex.appBar,
              bgcolor: "background.paper",
              borderBottom: 1,
              borderColor: "divider",
              px: { xs: 2.5, sm: 3 },
              py: { xs: 2, sm: 2.5 },
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              gap: 0.75,
              ...headerSx,
            }}
          >
            {!hideCloseButton && (
              <Box
                data-testid={`${dataTestId}-close-container`}
                sx={{
                  position: "absolute",
                  right: 8,
                  top: 8,
                }}
              >
                <IconButton
                  aria-label="Close"
                  onClick={handleCloseIcon}
                  color="primary"
                  disabled={loading}
                  size="small"
                  data-testid={`${dataTestId}-close`}
                  sx={{ height: 32, width: 32, fontSize: 32 }}
                >
                  <Close fontSize="inherit" />
                </IconButton>
              </Box>
            )}

            {title && (
              <Box>
                <Typography
                  id={titleId}
                  component="h2"
                  variant="h6"
                  fontWeight={700}
                  sx={{ fontFamily: "PT Sans", wordBreak: "break-word" }}
                >
                  {title}
                </Typography>
                {subtitle && (
                  <Typography variant="body2" color="text.secondary">
                    {subtitle}
                  </Typography>
                )}
              </Box>
            )}
          </DialogTitle>
        )}

        <DialogContent
          id={contentId}
          dividers={scroll === "paper"}
          sx={{
            position: "relative",
            px: { xs: 2.5, sm: 3 },
            py: { xs: 2, sm: 3 },
            ...(scroll === "paper"
              ? {
                  maxHeight: fullScreen ? "none" : canonContentMaxHeight,
                  overflowY: "auto",
                }
              : {}),
            ...contentSx,
          }}
        >
          {props.children}
          {LoadingState}
        </DialogContent>

        {(actions || footer) && (
          <DialogActions
            sx={{
              position: stickyFooter ? "sticky" : "static",
              bottom: 0,
              zIndex: (t) => t.zIndex.appBar,
              bgcolor: "background.paper",
              borderTop: 1,
              borderColor: "divider",
              px: { xs: 2.5, sm: 3 },
              py: { xs: 1.5, sm: 2 },
              display: "flex",
              justifyContent: "flex-end",
              gap: 1.5,
              ...actionsSx,
            }}
          >
            {actions ?? footer}
          </DialogActions>
        )}
      </Dialog>
    );
  })
);
