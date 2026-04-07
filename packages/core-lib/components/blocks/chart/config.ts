import { Theme, useTheme } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChartData } from "../../../api/types";
import { findLongestArrayInArray } from "../../../business/array";
import { average, sum } from "../../../business";
import { chartType } from "./constants";

interface Props extends Partial<ChartData> {
  type?: string;
  xAxisName?: string | null;
  yAxisName?: string | null;
  hideLegend?: boolean;
  fullHeight?: boolean;
  colorPalette?: string[];
  dataEmptyMessage?: string;
  heightToWidthRatio?: number;
  labelLengthLimit?: number;
}

type ChartConfiguration = {
  type?: string;
  chart?: Record<string, string | number | null | undefined>;
  dataSource?: {
    data?: ChartData["data"];
    dataset?: { color: string; seriesName: string; data: ChartData["data"] }[];
    categories?: { category: { label: string }[] }[];
  };
};

const MIN_CHART_HEIGHT = 150;
const MIN_LEGEND_HEIGHT = 30;
const MIN_AXIS_LABELS_HEIGHT = 50;
const TOP_PADDING = 16;
const SIDE_PADDING = 0;
const LEGEND_ITEM_MIN_WIDTH = 80;
const LEGEND_ICON_WIDTH = 16;
const LEGEND_ITEM_PADDING = 16;
const MAX_LEGEND_ROWS = 3;
const AVG_CHAR_WIDTH = 8;
const PROBLEMATIC_WIDTH_MIN = 619;
const PROBLEMATIC_WIDTH_MAX = 675;
const DEFAULT_MAX_LABEL_LENGTH = 21;

export const useChartConfig = ({
  type,
  xAxisName,
  yAxisName,
  hideLegend,
  fullHeight,
  chart,
  data,
  datasets,
  dataEmptyMessage,
  heightToWidthRatio,
  labelLengthLimit,
  colorPalette = [],
}: Props) => {
  const theme = useTheme();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const windowResizeListenerRef = useRef<() => void | null>(null);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [height, setHeight] = useState<number>(MIN_CHART_HEIGHT);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [containerHeight, setContainerHeight] = useState<number>(0);
  const [dynamicLabelLength, setDynamicLabelLength] = useState<number>(
    DEFAULT_MAX_LABEL_LENGTH,
  );

  const avgValue = calcAvgValue(type, { data, datasets });
  const sumValue = calcSumValue(type, { data, datasets });
  const dataRows =
    data
      ?.map((d) => ({ ...d }))
      .filter((d) => Math.round((Number(d.value) / sumValue) * 100) !== 0) ||
    [];
  const dataSets =
    datasets?.map((d) => ({
      name: d.name,
      data: d.data.map((d) => ({ ...d, label: d.label })),
    })) || [];

  const calculateRequiredExtraSpace = useCallback(
    (legendRows: number) =>
      [
        TOP_PADDING,
        !hideLegend && legendRows > 0
          ? Math.max(legendRows * 30, MIN_LEGEND_HEIGHT * 1.5)
          : 0,
        xAxisName || yAxisName ? MIN_AXIS_LABELS_HEIGHT : 0,
      ].reduce((acc, val) => acc + val, 0),
    [hideLegend, xAxisName, yAxisName],
  );

  const calculateOptimalDimensions = useCallback(() => {
    if (!containerRef) return;

    const width = containerRef.clientWidth;
    if (width <= 0) return;

    const availableContainerHeight = containerRef.clientHeight || 0;
    setContainerWidth(width);
    setContainerHeight(availableContainerHeight);

    const legendItemCount = getLegendItemCount(type, dataRows, dataSets);
    if (legendItemCount > 0 && !hideLegend) {
      const avgLabelLength = getAverageLabelLength(type, dataRows, dataSets);
      const estimatedItemWidth = calculateLegendItemWidth(avgLabelLength);
      const availableWidth = Math.max(width - 2 * SIDE_PADDING, 100);
      const optimalColumns = calculateOptimalColumns(
        legendItemCount,
        availableWidth,
        estimatedItemWidth,
        width >= PROBLEMATIC_WIDTH_MIN && width <= PROBLEMATIC_WIDTH_MAX,
      );

      const maxLabelLength = Math.floor(
        (availableWidth / optimalColumns -
          LEGEND_ICON_WIDTH -
          LEGEND_ITEM_PADDING) /
          AVG_CHAR_WIDTH,
      );

      if (maxLabelLength !== dynamicLabelLength) {
        setDynamicLabelLength(maxLabelLength);
      }
    }

    const calculatedHeight = (() => {
      if (fullHeight) {
        return Math.max(availableContainerHeight, MIN_CHART_HEIGHT);
      }

      const baseRatio = heightToWidthRatio || 0.5;
      const initialHeight = isProblematicWidth(width)
        ? Math.min(
            width * baseRatio,
            availableContainerHeight > 0
              ? availableContainerHeight
              : width * baseRatio,
          )
        : Math.max(width * baseRatio, MIN_CHART_HEIGHT);

      const legendRows = calculateLegendRowsNeeded(
        width,
        type,
        hideLegend,
        dataRows,
        dataSets,
      );
      const requiredExtraSpace = calculateRequiredExtraSpace(legendRows);

      return availableContainerHeight > 0 &&
        initialHeight + requiredExtraSpace > availableContainerHeight
        ? Math.max(
            availableContainerHeight - requiredExtraSpace,
            MIN_CHART_HEIGHT,
          )
        : initialHeight;
    })();

    if (calculatedHeight !== height) {
      setHeight(Math.max(calculatedHeight, MIN_CHART_HEIGHT));
    }
  }, [
    containerRef,
    fullHeight,
    heightToWidthRatio,
    calculateRequiredExtraSpace,
    type,
    hideLegend,
    dataRows,
    dataSets,
    labelLengthLimit,
    height,
    dynamicLabelLength,
  ]);

  const debouncedResize = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      calculateOptimalDimensions();
    }, 100);
  }, [calculateOptimalDimensions]);

  useEffect(() => {
    if (!containerRef) return;

    if (!resizeObserverRef.current) {
      resizeObserverRef.current = new ResizeObserver(() => {
        debouncedResize();
      });
    }

    resizeObserverRef.current.observe(containerRef);
    calculateOptimalDimensions();

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [containerRef, calculateOptimalDimensions, debouncedResize]);

  useEffect(() => {
    const handleWindowResize = () => {
      debouncedResize();
    };

    windowResizeListenerRef.current = handleWindowResize;

    window.addEventListener("resize", handleWindowResize);

    calculateOptimalDimensions();

    return () => {
      if (windowResizeListenerRef.current) {
        window.removeEventListener("resize", windowResizeListenerRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [calculateOptimalDimensions, debouncedResize]);

  useEffect(() => {
    const timer = setTimeout(() => {
      calculateOptimalDimensions();
    }, 200);

    return () => clearTimeout(timer);
  }, [calculateOptimalDimensions]);

  const configFromType = useChartTypeConfig({
    containerWidth:
      containerWidth || (typeof window !== "undefined" ? window.innerWidth : 0),
    type,
    sumValue,
    containerHeight,
    hideLegend,
    labelLengthLimit: labelLengthLimit || dynamicLabelLength,
    dataRows,
    dataSets,
    colorPalette,
    theme,
  });

  return {
    ref: setContainerRef,
    height,
    config: {
      height,
      width: "100%",
      dataFormat: "json",
      dataEmptyMessage,
      ...configFromType,
      dataSource: {
        ...configFromType.dataSource,
        chart: {
          ...getBaseChartConfig(theme, chart, xAxisName, yAxisName),
          ...configFromType.chart,
        },
        trendlines: getTrendlines(avgValue, theme),
      },
    },
  };
};

const getTrendlines = (avgValue: number, theme: Theme) =>
  !avgValue
    ? undefined
    : [
        {
          line: [
            {
              startvalue: avgValue,
              color: theme.palette.primary.main,
              dashed: "1",
              dashLen: "6",
              dashGap: "6",
              displayValue: " ",
            },
          ],
        },
      ];

const getBaseChartConfig = (
  theme: Theme,
  chart?: Partial<ChartData["chart"]>,
  xAxisName?: string | null,
  yAxisName?: string | null,
): Record<string, string | number | null | undefined> => ({
  // Axis names
  xAxisName,
  yAxisName,
  xAxisNameFont: theme.typography.fontFamily,
  xAxisNameFontSize: theme.typography.badge?.fontSize,
  xAxisNameFontBold: "1",
  yAxisNameFont: theme.typography.fontFamily,
  yAxisNameFontSize: theme.typography.badge?.fontSize,
  yAxisNameFontBold: "1",
  xAxisNameFontColor: theme.palette.text.primary,
  yAxisNameFontColor: theme.palette.text.primary,
  yAxisValueFont: theme.typography.fontFamily,
  yAxisValueFontSize: theme.typography.badge?.fontSize,
  yAxisValueFontBold: "1",
  yAxisValueFontColor: theme.palette.text.secondary,
  // Labels and Values
  labelFont: theme.typography.fontFamily,
  labelFontSize: theme.typography.badge?.fontSize,
  labelFontBold: "1",
  labelFontColor: theme.palette.text.secondary,
  enableSmartLabels: "1",
  labelDistance: "0",
  labelBorderRadius: "2",
  labelBorderPadding: "4",
  minAngleForLabel: "360",
  minAngleForValue: "360",
  numberPrefix: chart?.numberPrefix,
  numberSuffix: chart?.numberSuffix,
  // Tooltip
  plottooltext: "$value",
  showToolTipShadow: "1",
  // Chart style
  bgAlpha: 0,
  logoAlpha: 0,
  chartLeftMargin: SIDE_PADDING.toString(),
  chartRightMargin: SIDE_PADDING.toString(),
  chartTopMargin: TOP_PADDING.toString(),
  chartBottomMargin: "0",
  chartLeftPadding: "0",
  chartRightPadding: "0",
  chartTopPadding: "0",
  chartBottomPadding: "10",
  // Misc
  baseFont: theme.typography.fontFamily,
  baseFontSize: theme.typography.badge?.fontSize,
  baseFontColor: theme.palette.text.secondary,
  showTrendlinesOnTop: "1",
  theme: "fusion",
});

const calcAvgValue = (type?: string, chart?: Partial<ChartData>): number => {
  switch (type?.toLowerCase()) {
    case chartType.AREA.name:
      return average(
        chart?.datasets?.flatMap((a) => a.data.map((b) => Number(b.value))) ||
          [],
      );
    case chartType.COLUMN.name:
      return average(chart?.data?.map((a) => Number(a.value)) || []);
    case chartType.DOUGHNUT.name:
      return average(chart?.data?.map((a) => Number(a.value)) || []);
    default:
      return 0;
  }
};

const calcSumValue = (type?: string, chart?: Partial<ChartData>): number => {
  switch (type?.toLowerCase()) {
    case chartType.DOUGHNUT.name:
      return sum(chart?.data?.map((a) => Number(a.value)) || []);
    default:
      return 0;
  }
};

const getLegendItemCount = (
  type?: string,
  dataRows: ChartData["data"] = [],
  dataSets: { name: string; data: ChartData["data"] }[] = [],
): number => {
  const normalizedType = type?.toLowerCase();

  if (normalizedType === "area" && dataSets && dataSets.length) {
    return dataSets.length;
  } else if (
    (normalizedType === "doughnut" || normalizedType === "column") &&
    dataRows &&
    dataRows.length
  ) {
    return dataRows.length;
  }
  return 0;
};

const getAverageLabelLength = (
  type?: string,
  dataRows: ChartData["data"] = [],
  dataSets: { name: string; data: ChartData["data"] }[] = [],
): number => {
  const normalizedType = type?.toLowerCase();

  if (normalizedType === "area" && dataSets && dataSets.length) {
    return (
      dataSets.reduce((sum, dataset) => sum + (dataset.name?.length || 0), 0) /
      dataSets.length
    );
  } else if (
    (normalizedType === "doughnut" || normalizedType === "column") &&
    dataRows &&
    dataRows.length
  ) {
    return (
      dataRows.reduce((sum, item) => sum + (item?.label?.length || 0), 0) /
      dataRows.length
    );
  }
  return 5;
};

const calculateLegendItemWidth = (labelLength: number): number =>
  Math.max(
    LEGEND_ITEM_MIN_WIDTH,
    LEGEND_ICON_WIDTH + labelLength * AVG_CHAR_WIDTH + LEGEND_ITEM_PADDING,
  );

const calculateOptimalColumns = (
  legendItemCount: number,
  availableWidth: number,
  estimatedItemWidth: number,
  isProblematicWidth: boolean,
) => {
  if (legendItemCount <= 2) {
    return legendItemCount;
  }

  const baseColumns = Math.min(
    legendItemCount,
    Math.max(1, Math.floor(availableWidth / estimatedItemWidth)),
  );
  const itemsPerColumn = Math.ceil(legendItemCount / baseColumns);

  const columnsForMaxRows =
    itemsPerColumn > MAX_LEGEND_ROWS
      ? Math.ceil(legendItemCount / MAX_LEGEND_ROWS)
      : baseColumns;

  const finalColumns = isProblematicWidth
    ? Math.max(columnsForMaxRows, Math.ceil(legendItemCount / 2))
    : columnsForMaxRows;

  return Math.max(finalColumns, 2);
};

export type ChartConfig = ReturnType<typeof useChartConfig>;

const isProblematicWidth = (width: number): boolean =>
  width >= PROBLEMATIC_WIDTH_MIN && width <= PROBLEMATIC_WIDTH_MAX;

const calculateLegendRowsNeeded = (
  containerWidth: number,
  type?: string,
  hideLegend?: boolean,
  dataRows: ChartData["data"] = [],
  dataSets: { name: string; data: ChartData["data"] }[] = [],
): number => {
  if (hideLegend) return 0;

  const legendItemCount = getLegendItemCount(type, dataRows, dataSets);
  if (legendItemCount === 0) return 1;

  const avgLabelLength = getAverageLabelLength(type, dataRows, dataSets);
  const estimatedItemWidth = calculateLegendItemWidth(avgLabelLength);
  const availableWidth = Math.max(containerWidth - 2 * SIDE_PADDING, 100);
  const itemsPerRow = Math.max(
    1,
    Math.floor(availableWidth / estimatedItemWidth),
  );

  return Math.ceil(legendItemCount / itemsPerRow);
};

const useChartTypeConfig = ({
  containerWidth,
  type,
  sumValue,
  containerHeight = 0,
  hideLegend,
  labelLengthLimit,
  dataRows = [],
  dataSets = [],
  colorPalette = [],
  theme,
}: {
  containerWidth: number;
  type?: string;
  sumValue?: number;
  containerHeight?: number;
  hideLegend?: boolean;
  labelLengthLimit?: number;
  dataRows: ChartData["data"];
  dataSets: { name: string; data: ChartData["data"] }[];
  colorPalette: string[];
  theme: Theme;
}): ChartConfiguration => {
  const isSmall = containerHeight < 250 || containerWidth < 400;
  const isProblematicWidth =
    containerWidth >= PROBLEMATIC_WIDTH_MIN &&
    containerWidth <= PROBLEMATIC_WIDTH_MAX;

  const legendConfig = getLegendConfiguration({
    hideLegend,
    type,
    dataRows,
    dataSets,
    containerWidth,
    labelLengthLimit,
    isProblematicWidth,
    theme,
  });

  const normalizedType = type?.toLowerCase();

  switch (normalizedType) {
    case "area":
      return {
        type: "stackedarea2d",
        chart: {
          ...legendConfig,
          setAdaptiveYMin: "1",
          drawCrossLineOnTop: "1",
          canvasPadding: "10",
          showValues: isSmall ? "0" : "1",
          showAxisLines: isSmall ? "0" : "1",
          showAlternateHGridColor: isSmall ? "0" : "1",
        },
        dataSource: {
          dataset: dataSets.map((item, idx) => ({
            color: colorPalette[idx] || "#000000",
            seriesName: item.name,
            data: item.data,
          })),
          categories: [
            {
              category: findLongestArrayInArray(
                dataSets.map((a) => a.data || []) as any[][],
              ).map((item) => ({
                label: item.label,
              })),
            },
          ],
        },
      };
    case "column":
      return {
        type: "column2d",
        chart: {
          ...legendConfig,
          canvasPadding: "10",
          showValues: isSmall ? "0" : "1",
          plotSpacePercent: isProblematicWidth ? "30" : "50",
          xAxisNamePadding: isSmall ? "5" : "10",
          yAxisNamePadding: isSmall ? "5" : "10",
        },
        dataSource: {
          data: dataRows?.map((item, idx) => ({
            ...item,
            color: colorPalette[idx],
          })),
        },
      };
    case "doughnut":
      const { pieRadius, doughnutRadius } = calculateOptimalRadius(
        containerWidth,
        containerHeight,
        hideLegend,
        isProblematicWidth,
      );
      return {
        type: "doughnut2d",
        chart: {
          ...legendConfig,
          enableSlicing: 0,
          enableRotation: 0,
          pieRadius,
          doughnutRadius,
          showValues: 0,
          showBorder: 0,
          valuePosition: "inside",
          startingAngle: 90,
          animateClockwise: "1",
          legendItemFontBold: 0,
          plotBorderThickness: 4,
          plotBorderColor: "#FFFFFF",
          showPlotBorder: 1,
          minAngleForValue: 5,
          decimals: 0,
          labelFontSize: 8,
          showLabels: 0,
          showToolTip: 1,
          ShowToolTipShadow: 0,
          toolTipBorderColor: "#CCCCCC",
          plottooltext: "<b>$percentValue</b> $displayValue ",
        },
        dataSource: {
          data: dataRows?.map((item, idx) => ({
            ...item,
            label: formatItemLabel(
              dataRows,
              idx,
              containerWidth,
              sumValue,
              labelLengthLimit,
            ),
            displayValue: item ? item.label : "",
            color: colorPalette[idx],
            labelBgColor: colorPalette[idx],
            labelFontColor: !process.env.JEST_WORKER_ID
              ? theme.palette.getContrastText(colorPalette[idx] || "#000000")
              : "#000",
          })),
        },
      };
    default:
      return {};
  }
};

const getLegendConfiguration = ({
  hideLegend,
  type,
  dataRows,
  dataSets,
  containerWidth,
  labelLengthLimit,
  isProblematicWidth,
  theme,
}: {
  hideLegend?: boolean;
  type?: string;
  dataRows: ChartData["data"];
  dataSets: { name: string; data: ChartData["data"] }[];
  containerWidth: number;
  labelLengthLimit?: number;
  isProblematicWidth: boolean;
  theme: Theme;
}) => {
  if (hideLegend) return { showLegend: "0" };

  const legendItemCount = getLegendItemCount(type, dataRows, dataSets);
  if (legendItemCount === 0) return { showLegend: "1", legendNumColumns: "1" };

  const avgLabelLength = getAverageLabelLength(type, dataRows, dataSets);
  const estimatedItemWidth = calculateLegendItemWidth(avgLabelLength);
  const availableWidth = Math.max(containerWidth, 100);
  const optimalColumns = calculateOptimalColumns(
    legendItemCount,
    availableWidth,
    estimatedItemWidth,
    isProblematicWidth,
  );
  const maxLabelLength = Math.floor(
    (availableWidth / optimalColumns -
      LEGEND_ICON_WIDTH -
      LEGEND_ITEM_PADDING) /
      AVG_CHAR_WIDTH,
  );

  return {
    alignLegendWithCanvas: "0",
    interactiveLegend: "0",
    legendAllowDrag: "0",
    legendBorderAlpha: "0",
    legendCaption: "",
    legendIconScale: "1.75",
    legendIconSides: "4",
    legendItemFont: theme.typography.fontFamily,
    legendItemFontBold: 1,
    legendItemFontColor: theme.palette.text.secondary,
    legendItemFontSize: 12,
    legendItemHiddenColor: theme.palette.text.disabled,
    legendItemHoverFontColor: theme.palette.text.primary,
    legendItemMaxLength: Math.max(
      10,
      Math.min(maxLabelLength, labelLengthLimit || DEFAULT_MAX_LABEL_LENGTH),
    ).toString(),
    legendItemSpacing: "4",
    legendMarkerAlpha: "100",
    legendNumColumns: optimalColumns.toString(),
    legendPadding: 10,
    legendPosition: "bottom",
    legendScrollBgAlpha: "0",
    legendScrollEnabled: "0",
    legendWidth: "100%",
    showLegend: "1",

    ...(legendItemCount === 1 && {
      legendPosition: "bottom-left",
      legendItemMaxLength: containerWidth,
    }),
  };
};

const calculateOptimalRadius = (
  containerWidth: number,
  containerHeight: number,
  hideLegend?: boolean,
  isProblematicWidth?: boolean,
) => {
  const effectiveHeight = hideLegend
    ? containerHeight
    : Math.max(containerHeight - MIN_LEGEND_HEIGHT, 0);
  const minDimensions = Math.min(
    containerWidth - 2 * SIDE_PADDING,
    effectiveHeight - TOP_PADDING,
  );
  const radiusMultiplier = isProblematicWidth ? 0.35 : 0.4;
  const pieRadius = Math.max(Math.floor(minDimensions * radiusMultiplier), 30);
  const doughnutRadius = Math.floor(pieRadius * 0.3);

  return { pieRadius, doughnutRadius };
};

const formatItemLabel = (
  items: ChartData["data"],
  index: number,
  containerWidth: number,
  sumValue?: number,
  labelLengthLimit?: number,
): string => {
  const item = items?.[index];
  if (items?.length === 1 && item?.label) {
    return item.label;
  }
  if (item?.label) {
    return sliceLabel(
      item.label,
      containerWidth,
      item.value,
      sumValue,
      labelLengthLimit,
    );
  }
  return "";
};

const sliceLabel = (
  label: string,
  containerWidth: number,
  value?: string,
  sumValue?: number,
  labelLengthLimit?: number,
): string => {
  const percentLegendLength =
    Math.round((Number(value) / Number(sumValue)) * 100).toString().length + 2;

  const getMaxLength = (width: number, limit?: number): number => {
    if (limit) {
      return limit;
    }
    if (width <= 400) {
      return 14;
    }
    if (width <= 600) {
      return 18;
    }
    return DEFAULT_MAX_LABEL_LENGTH;
  };

  const maxLength = getMaxLength(containerWidth, labelLengthLimit);
  const effectiveLimit = maxLength - percentLegendLength;

  return label.length <= effectiveLimit
    ? label
    : `${label.slice(0, effectiveLimit)}...`;
};
