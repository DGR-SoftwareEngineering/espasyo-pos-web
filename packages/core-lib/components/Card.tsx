import React, { ReactNode } from "react";
import {
  Card as MuiCard,
  CardContent,
  CardProps,
  CardActions,
  styled,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { ChartBlock } from "./blocks/chart/ChartBlock";

interface Props extends CardProps {
  elevation?: CardProps["elevation"];
  actionsNode?: ReactNode;
  hasActionsNode?: boolean;
  sx?: CardProps["sx"];
  hoverEffect?: boolean;
  imageSrc?: string;
  text?: string;
  icon?: React.ReactElement;
  showChart?: boolean;
  chartProps?: {
    id: string;
    chartKey: string;
    sourceUrl?: string;
    type?: string;
    hideLegend?: boolean;
    xAxisName?: string;
    yAxisName?: string;
    fullHeight?: boolean;
    heightToWidthRatio?: number;
    customColors?: string[];
    defaultColors?: string[];
    lightLoader?: boolean;
    labelLengthLimit?: number;
  };
}

export const Card: React.FC<React.PropsWithChildren<Props>> = ({
  elevation,
  children,
  actionsNode = false,
  sx,
  hoverEffect,
  imageSrc,
  text,
  icon,
  showChart = false,
  chartProps,
  ...rest
}) => {
  const CardComponent = hoverEffect ? StyledCard : MuiCard;

  return (
    <CardComponent {...rest} sx={sx} elevation={elevation}>
      <CardContent sx={{ display: "flex", flexDirection: "column" }}>
        {imageSrc && (
          <div style={{ position: "relative", width: "100%", height: "150px" }}>
            <Image
              src={imageSrc}
              alt={text || "Card image"}
              layout="fill"
              objectFit="cover"
              quality={75}
              style={{ borderRadius: "10px" }} // Optional: Add styling for border radius
            />
          </div>
        )}
        {text && (
          <Typography
            variant="body1"
            align="center"
            style={{ marginTop: "8px" }}
          >
            {text}
          </Typography>
        )}

        {showChart && chartProps && (
          <div style={{ marginTop: "16px", width: "100%" }}>
            <ChartBlock
              id={chartProps.id}
              chartKey={chartProps.chartKey}
              sourceUrl={chartProps.sourceUrl}
              type={chartProps.type}
              hideLegend={chartProps.hideLegend}
              xAxisName={chartProps.xAxisName}
              yAxisName={chartProps.yAxisName}
              fullHeight={chartProps.fullHeight}
              heightToWidthRatio={chartProps.heightToWidthRatio}
              customColors={chartProps.customColors}
              defaultColors={chartProps.defaultColors}
              lightLoader={chartProps.lightLoader}
              labelLengthLimit={chartProps.labelLengthLimit}
            />
          </div>
        )}

        {children}
      </CardContent>
      {actionsNode && <CardActions>{actionsNode}</CardActions>}
    </CardComponent>
  );
};

const StyledCard = styled(MuiCard)(({ theme }) => ({
  position: "relative",
  transition: "transform 0.3s, box-shadow 0.3s",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "10px",
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.3)",
  },
}));
