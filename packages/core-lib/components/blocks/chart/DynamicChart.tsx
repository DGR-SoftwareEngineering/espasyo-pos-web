import { memo, useEffect, useState } from "react";
import { ChartConfig } from "./config";
import ext1 from "./extension/fusioncharts.ext.accessibility";
import ext2 from "./extension/fusioncharts.ext.accessibility-resources-strings-en";

interface Props {
  id: string;
  colorPalette?: string[];
  chartConfig: ChartConfig["config"];
  type?: string;
}

let ReactFC: any;
let isInitialized = false;

const initializeFusionCharts = () => {
  if (process.env.JEST_WORKER_ID) return;
  if (isInitialized || typeof window === "undefined") return;

  const FusionCharts = require("fusioncharts");
  const Charts = require("fusioncharts/fusioncharts.charts");
  const FusionTheme = require("fusioncharts/themes/fusioncharts.theme.fusion.js");
  ReactFC = require("react-fusioncharts").default;

  ReactFC.fcRoot(FusionCharts, Charts, FusionTheme, ext1, ext2);
  isInitialized = true;
};

const Component: React.FC<Props> = ({ chartConfig }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!process.env.JEST_WORKER_ID) {
      initializeFusionCharts();
      setIsReady(true);
    }
  }, []);

  if (process.env.JEST_WORKER_ID) {
    return null;
  }

  if (!isReady || !isInitialized) {
    return <div data-testid="chart-loading">Loading chart...</div>;
  }

  return <ReactFC {...chartConfig} />;
};

export const DynamicChart: React.FC<Props> = memo(Component);
