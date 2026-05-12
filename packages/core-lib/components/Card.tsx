import React, { ReactNode, useEffect, useState } from "react";
import {
  Card as MuiCard,
  CardContent,
  CardProps,
  CardActions,
  styled,
  Typography,
  Box,
} from "@mui/material";
import Image from "next/image";
import { ChartBlock } from "./blocks/chart/ChartBlock";

interface ChartProps {
  // TL Mode (FusionCharts / API-driven)
  id?: string;
  chartKey?: string;
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

  // Your Direct Data Mode
  categories?: string[];
  datasets?: {
    name: string;
    data: number[];
  }[];

  // backward compatibility
  colors?: string[];
}

interface Props extends CardProps {
  elevation?: CardProps["elevation"];
  actionsNode?: ReactNode;
  hasActionsNode?: boolean;
  sx?: CardProps["sx"];
  hoverEffect?: boolean;
  imageSrc?: string;
  text?: string;
  icon?: React.ReactElement;

  // TL implementation
  showChart?: boolean;

  chartProps?: ChartProps;
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

  /* ✅ CUSTOM DIRECT DATA STATE */
  const [resolvedData, setResolvedData] = useState<{
    categories: string[];
    datasets: { name: string; data: number[] }[];
  } | null>(null);

  useEffect(() => {
    if (!chartProps) return;

    // DIRECT DATA MODE
    if (chartProps.categories && chartProps.datasets) {
      setResolvedData({
        categories: chartProps.categories,
        datasets: chartProps.datasets,
      });
      return;
    }

    // JSON SOURCE MODE
    if (!showChart && chartProps.sourceUrl && !chartProps.chartKey) {
      fetch(chartProps.sourceUrl)
        .then((res) => res.json())
        .then((data) => {
          const categories = data.datasets[0].data.map((d: any) => d.label);

          const datasets = data.datasets.map((set: any) => ({
            name: set.name,
            data: set.data.map((d: any) => Number(d.value)),
          }));

          setResolvedData({ categories, datasets });
        })
        .catch(() => {
          console.error("Failed to load chart data");
        });
    }
  }, [chartProps, showChart]);

  const maxValue = resolvedData
    ? Math.max(...resolvedData.datasets.flatMap((d) => d.data))
    : 0;

  const colors = chartProps?.customColors || chartProps?.colors;

  return (
    <CardComponent {...rest} sx={sx} elevation={elevation}>
      <CardContent sx={{ display: "flex", flexDirection: "column" }}>
        {/* IMAGE */}
        {imageSrc && (
          <div style={{ position: "relative", width: "100%", height: "150px" }}>
            <Image
              src={imageSrc}
              alt={text || "Card image"}
              layout="fill"
              objectFit="cover"
              quality={75}
              style={{ borderRadius: "10px" }}
            />
          </div>
        )}

        {/* TITLE */}
        {text && (
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 1,
            }}
          >
            {text}
          </Typography>
        )}

        {showChart && chartProps && (
          <Box sx={{ mt: 2, width: "100%" }}>
            <ChartBlock
              id={chartProps.id || "chart"}
              chartKey={chartProps.chartKey || "default-chart"}
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
          </Box>
        )}

        {!showChart && chartProps && resolvedData && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ position: "relative", height: 260, display: "flex" }}>
              {/* Y AXIS */}
              <Box
                sx={{
                  width: 40,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  pr: 1,
                }}
              >
                {[100, 75, 50, 25, 0].map((val) => (
                  <Typography
                    key={val}
                    variant="caption"
                    color="text.secondary"
                  >
                    {Math.round((val / 100) * maxValue)}
                  </Typography>
                ))}
              </Box>

              {/* GRAPH */}
              <Box sx={{ flex: 1, position: "relative" }}>
                {/* GRID */}
                {[0, 25, 50, 75, 100].map((val) => (
                  <Box
                    key={val}
                    sx={{
                      position: "absolute",
                      bottom: `${val}%`,
                      left: 0,
                      right: 0,
                      height: "1px",
                      bgcolor: "divider",
                    }}
                  />
                ))}

                {/* BARS */}
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    display: "flex",
                    justifyContent: "space-around",
                    alignItems: "flex-end",
                    height: "100%",
                    px: 1,
                  }}
                >
                  {resolvedData.categories.map((label, i) => (
                    <Box
                      key={label}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        height: "100%",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-end",
                          gap: 0.8,
                          height: "100%",
                        }}
                      >
                        {resolvedData.datasets.map((set, idx) => {
                          const value = set.data[i];
                          const height = (value / maxValue) * 100;

                          return (
                            <Box
                              key={set.name}
                              sx={{
                                width: 22,
                                height: `${height}%`,
                                borderRadius: 2,
                                background: `linear-gradient(
                                  180deg,
                                  ${colors?.[idx] || "#64b5f6"} 0%,
                                  ${colors?.[idx] || "#1976d2"} 100%
                                )`,
                                boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                                transition: "0.25s",
                                "&:hover": {
                                  transform: "translateY(-4px) scale(1.05)",
                                },
                              }}
                            />
                          );
                        })}
                      </Box>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        {label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>

            {/* LEGEND */}
            {!chartProps.hideLegend && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 3,
                  mt: 2,
                }}
              >
                {resolvedData.datasets.map((s, i) => (
                  <Box
                    key={s.name}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        backgroundColor: colors?.[i] || "primary.main",
                      }}
                    />
                    <Typography variant="caption">{s.name}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
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
  borderRadius: "10px",

  "&:hover": {
    transform: "scale(1.03)",
    boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
  },
}));
