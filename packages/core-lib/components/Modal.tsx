import CloseIcon from "@mui/icons-material/Close";
import {
  Breakpoint,
  Dialog,
  DialogContent,
  DialogProps,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useResolution } from "../core/hooks";
import { useRouter } from "../core/router";
import { Button, PrimaryButton, SecondaryButton } from "./buttons";
import { CmsButton } from "../cms/types";

interface Props extends DialogProps {
  topCloseButton?: boolean;
  bottomCloseButton?: boolean;
  isBottomCloseButtonVisibleXS?: boolean;
  hideCloseInAlternateStyle?: boolean;
  headerBackgroundColor?: string;
  headerColor?: string;
  headerTitle?: string;
  showBottomActionButtons?: boolean;
  bottomActionButtons?: CmsButton[];
  maxWidth?: false | Breakpoint;
  disableTopPadding?: boolean;
}

export const Modal: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  onClose,
  topCloseButton,
  bottomCloseButton,
  isBottomCloseButtonVisibleXS,
  hideCloseInAlternateStyle,
  headerBackgroundColor = "#ffffff",
  headerColor = "#000000",
  headerTitle,
  showBottomActionButtons,
  bottomActionButtons,
  maxWidth = false,
  disableTopPadding = false,
  ...props
}) => {
  const router = useRouter();
  const { isMobile } = useResolution(); // use for desktop or mobile logo.

  return (
    <Dialog
      {...props}
      onClose={onClose}
      maxWidth={maxWidth}
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
      sx={{ margin: 0, ...props.sx }}
      slotProps={{
        paper: {
          sx: { borderRadius: 0, mx: { xs: 4, md: 0 } },
          ...props.slotProps?.paper,
        },
      }}
    >
      {((topCloseButton && onClose) || headerTitle) && (
        <Stack
          direction="row"
          justifyContent={headerTitle ? "space-between" : "flex-end"}
          alignItems="flex-start" // TODO (jm): if logo is present add condition logo ? 'center' : 'flex-start'
          pt={{ xs: 4, md: 8 }}
          px={{ xs: 4, md: 12 }}
          pb={0} // TODO (jm): if logo is present add this as condition logo ? { xs: 4, md: 8 } : 0
          sx={{ backgroundColor: headerBackgroundColor }}
        >
          {headerTitle && (
            <Typography id="dialog-title" align="left" variant="h2" mr={4}>
              {headerTitle}
            </Typography>
          )}
          {topCloseButton && onClose && (
            <IconButton
              size="small"
              onClick={() => onClose({}, "backdropClick")}
              data-testid="modal-close-button"
              aria-label="aria-label-close-button"
            >
              <CloseIcon fontSize="large" sx={{ color: headerColor }} />
            </IconButton>
          )}
        </Stack>
      )}
      <DialogContent
        sx={{
          paddingX: { md: 12, xs: 4 },
          paddingTop: disableTopPadding ? 0 : { md: 12, xs: 4 },
          paddingBottom:
            showBottomActionButtons && onClose ? 4 : { md: 12, xs: 4 },
        }}
        id="dialog-description"
      >
        {children}
      </DialogContent>
      {!showBottomActionButtons &&
        bottomCloseButton &&
        !hideCloseInAlternateStyle &&
        onClose && (
          <PrimaryButton
            sx={{
              padding: 1,
              display: {
                xs: !isBottomCloseButtonVisibleXS ? "none" : "flex",
                md: "flex",
              },
            }}
            onClick={() => onClose({}, "backdropClick")}
          >
            Close
          </PrimaryButton>
        )}
      {showBottomActionButtons && onClose && (
        <Grid
          container
          spacing={4}
          sx={{
            paddingX: { md: 12, xs: 4 },
            paddingBottom: { md: 12, xs: 4 },
            paddingTop: 4,
          }}
        >
          {!!bottomActionButtons?.length &&
            bottomActionButtons.map((button, idx) => (
              <Grid key={idx}>
                <Button
                  onClick={handleClick(button)}
                  loading={router.loading}
                  {...button}
                >
                  {button.text}
                </Button>
              </Grid>
            ))}
          <Grid>
            <SecondaryButton onClick={() => onClose({}, "backdropClick")}>
              Close
            </SecondaryButton>
          </Grid>
        </Grid>
      )}
    </Dialog>
  );

  function handleClick(button: CmsButton) {
    return async () => {
      if (!button.link) {
        return;
      }

      await router.push(button.link);
    };
  }
};
