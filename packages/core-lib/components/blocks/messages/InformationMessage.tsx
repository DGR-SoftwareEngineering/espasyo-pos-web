import { CircularProgress, Grid, Typography } from "@mui/material";
import { ContentButtonBlock } from "../ContentButtonBlock";
import { MessageProps } from "./types";

export const InformationMessage: React.FC<MessageProps> = ({
  id,
  html,
  text,
  header,
  loading,
  buttons,
  dataReplaceProps,
}) => {
  return (
    <Grid
      id={id}
      role="note"
      data-testid="information-message-component"
      container
      direction="column"
      p={6}
      sx={{
        color: (theme) => theme.palette.primary.main,
        position: "relative",
        borderRadius: "16px",
        backgroundColor: (theme) => theme.palette.primary.light,
      }}
      {...dataReplaceProps?.(id, html)}
    >
      <Grid pl={3} mb={buttons?.length ? 4 : 0}>
        {header && (
          <Typography
            className="info-message-header"
            component="h2"
            variant="body1"
            fontWeight="bold"
          >
            {header}
          </Typography>
        )}
      </Grid>
      {loading && <CircularProgress size={30} sx={{ color: "primary.main" }} />}
      {!loading && text && (
        <Grid pl={3} mb={buttons?.length ? 4 : 0}>
          {text}
        </Grid>
      )}
      <Grid container pl={3} spacing={4}>
        {buttons?.map((button, index) => (
          <Grid key={index} size={{ xs: 12 }} width="100%">
            <ContentButtonBlock
              {...button}
              type="Secondary"
              widthPercentage={100}
            />
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
};
