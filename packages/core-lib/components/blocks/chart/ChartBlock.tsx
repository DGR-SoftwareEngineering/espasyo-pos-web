import { Box } from "@mui/material";
import dynamic from "next/dynamic";
import { memo, useEffect } from "react";
import { ChartData } from "../../../api/types";
import { useToastContext } from "../../../core/contexts";
import { useApi } from "../../../core/hooks";
import { ChartLoader } from "./ChartLoader";
import { ChartNoDataMessage } from "./ChartNoData";
import { useChartConfig } from "./config";

interface Props {
  id: string;
  hideLegend?: boolean;
  xAxisName?: string;
  yAxisName?: string;
  chartKey?: string;
  sourceUrl?: string;
  customColors?: string[];
  defaultColors?: string[];
  lightLoader?: boolean;
  type?: string;
  fullHeight?: boolean;
  heightToWidthRatio?: number;
  labelLengthLimit?: number;
  loading?: boolean;
  data?: ChartData;
}

const DynamicChart = dynamic(
  () => import("./DynamicChart").then((c) => c.DynamicChart),
  { ssr: false },
);

const Component: React.FC<Props> = ({
  id,
  chartKey,
  hideLegend,
  xAxisName,
  yAxisName,
  customColors,
  sourceUrl,
  defaultColors,
  lightLoader = true,
  type,
  fullHeight,
  heightToWidthRatio,
  labelLengthLimit,
  loading,
  data,
}) => {
  const { showToast } = useToastContext();
  const chartResponse = useApi(
    (api) =>
      sourceUrl ? api.commons.chartData(sourceUrl, chartKey) : Promise.reject(),
    [sourceUrl, chartKey],
  );

  const chartId = [id, chartKey].join("_");
  const chartData =
    data || chartResponse?.result?.data.response || ({} as ChartData);
  const chartType = type || chartData?.chartType;

  const colorPalette =
    (customColors?.length ? customColors : defaultColors) || [];
  const chart = useChartConfig({
    ...chartData,
    type: chartType,
    xAxisName,
    yAxisName,
    hideLegend,
    fullHeight,
    colorPalette,
    heightToWidthRatio,
    labelLengthLimit,
    dataEmptyMessage: "Data is not available",
  });

  useEffect(() => {
    if (!chartResponse?.error) return;
    showToast(`Error loading chart: ${chartResponse.error}`, "error");
  }, [chartResponse?.error]);

  if (chartResponse?.loading || loading) {
    return (
      <ChartLoader
        id={chartId}
        fullHeight={fullHeight}
        light={lightLoader}
        message="Chart loading..."
      />
    );
  }

  if (
    (!chartData?.data?.length && !chartData?.datasets?.length) ||
    !DynamicChart
  ) {
    return (
      <ChartNoDataMessage
        id={chartId}
        fullHeight={fullHeight}
        text="No data available"
      />
    );
  }

  return (
    <Box
      id={chartId}
      ref={chart.ref}
      width="100%"
      data-testid="chart"
      height={fullHeight ? "100%" : chart.height}
      sx={{
        "& svg": {
          backgroundColor: "transparent !important",
          outline: "none",
          "& *": { outline: "none" },
        },
      }}
    >
      <DynamicChart
        key={chart.height}
        id={id}
        type={type}
        chartConfig={chart.config}
        colorPalette={colorPalette}
      />
    </Box>
  );
};

export const ChartBlock: React.FC<Props> = memo(
  (props) => <Component {...props} />,
  (prev, next) =>
    prev.id === next.id &&
    prev.chartKey === next.chartKey &&
    prev.sourceUrl === next.sourceUrl,
);
