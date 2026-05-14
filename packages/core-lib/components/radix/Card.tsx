import React, { ReactNode } from "react";
import { Card as RadixCard, Box, Text, Flex } from "@radix-ui/themes";
import Image from "next/image";
import { ChartBlock } from "../blocks/chart/ChartBlock";
import { cn } from "./_utils";

export interface CardChartProps {
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
}

export interface CardProps {
  className?: string;
  style?: React.CSSProperties;
  /** Radix `variant` — surface (default), classic (more contrast), or ghost. */
  variant?: React.ComponentProps<typeof RadixCard>["variant"];
  /** Radix `size` 1–5 — controls padding. */
  size?: React.ComponentProps<typeof RadixCard>["size"];
  /** Scale on hover, like the MUI `hoverEffect` prop. */
  hoverEffect?: boolean;
  /** Optional image rendered at the top of the card. */
  imageSrc?: string;
  /** Optional caption rendered under the image (or above children). */
  text?: string;
  /** Optional icon to render alongside `text`. */
  icon?: React.ReactElement;
  /** Optional footer slot — rendered as a `<Flex>` below children. */
  actionsNode?: ReactNode;
  /** Forwarded to onClick — when set, the card gets cursor:pointer styling. */
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  /** Renders an embedded ChartBlock inside the card (parity with MUI Card). */
  showChart?: boolean;
  chartProps?: CardChartProps;
  children?: ReactNode;
}

export const Card: React.FC<CardProps> = ({
  className,
  style,
  variant = "surface",
  size = "2",
  hoverEffect = false,
  imageSrc,
  text,
  icon,
  actionsNode,
  onClick,
  showChart = false,
  chartProps,
  children,
}) => {
  const interactive = !!onClick || hoverEffect;

  return (
    <RadixCard
      variant={variant}
      size={size}
      className={cn(className)}
      onClick={onClick}
      style={{
        cursor: onClick ? "pointer" : undefined,
        transition: hoverEffect ? "transform 0.2s, box-shadow 0.2s" : undefined,
        ...style,
      }}
      data-hoverable={hoverEffect ? "true" : undefined}
    >
      {imageSrc ? (
        <Box mb="3" style={{ position: "relative", width: "100%", height: 150 }}>
          <Image
            src={imageSrc}
            alt={text || "Card image"}
            fill
            sizes="(max-width: 600px) 100vw, 33vw"
            quality={75}
            style={{ objectFit: "cover", borderRadius: "var(--radius-3)" }}
          />
        </Box>
      ) : null}

      {(text || icon) && (
        <Flex align="center" gap="2" mb="2" justify="center">
          {icon}
          {text && (
            <Text size="2" weight="medium" align="center">
              {text}
            </Text>
          )}
        </Flex>
      )}

      {showChart && chartProps && (
        <Box mt="3" style={{ width: "100%" }}>
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
        </Box>
      )}

      {children}

      {actionsNode && (
        <Flex mt="3" gap="2" justify="end">
          {actionsNode}
        </Flex>
      )}

      {interactive && (
        <style>{`
          [data-hoverable="true"]:hover {
            transform: scale(1.02);
            box-shadow: 0 10px 20px var(--gray-a5);
          }
        `}</style>
      )}
    </RadixCard>
  );
};
