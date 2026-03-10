import { Box, Fade } from "@mui/material";
import { usePageLoaderContext } from "../core/contexts";

interface Props {
  children: React.ReactNode;
}

export const ContentArea = ({ children }: Props) => {
  const { isContentTransition } = usePageLoaderContext();

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "calc(100vh - 64px)", // Adjust based on your layout
        transition: "opacity 0.2s ease",
        opacity: isContentTransition ? 0.7 : 1,
        pointerEvents: isContentTransition ? "none" : "auto",
      }}
    >
      <Fade in={!isContentTransition} timeout={300}>
        <Box>{children}</Box>
      </Fade>
    </Box>
  );
};
