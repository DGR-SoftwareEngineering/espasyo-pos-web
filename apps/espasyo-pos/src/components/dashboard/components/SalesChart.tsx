import React from "react";
import { Typography } from "@mui/material";
import { Card } from "../../../../../../packages/core-lib/components/Card";

const SalesChart: React.FC = () => {
  const data = [1200, 1500, 1100, 1800, 2000, 1700];
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const width = 600;
  const height = 200;
  const padding = 50;

  const max = Math.max(...data) * 1.1;
  const chartHeight = height - padding * 2;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - (value / max) * chartHeight - padding;
    return { x, y };
  });

  const getSmoothPath = () => {
    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const midX = (p0.x + p1.x) / 2;
      d += ` C ${midX},${p0.y} ${midX},${p1.y} ${p1.x},${p1.y}`;
    }
    return d;
  };

  const smoothPath = getSmoothPath();

  const areaPath = `
    ${smoothPath}
    L ${points[points.length - 1].x},${height - padding}
    L ${points[0].x},${height - padding}
    Z
  `;

  return (
    <Card sx={{ p: 3, height: "100%" }}>
      <Typography variant="h6" fontWeight={600} mb={3}>
        Sales This Week
      </Typography>
      <div style={{ width: "100%", height: 320 }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ width: "100%", height: "100%" }}
        >
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1976d2" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#1976d2" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0.25, 0.5, 0.75].map((line, i) => (
            <line
              key={i}
              x1={padding}
              x2={width - padding}
              y1={height * line}
              y2={height * line}
              stroke="#e0e0e0"
              strokeDasharray="4,4"
            />
          ))}

          <path d={areaPath} fill="url(#gradient)" />
          <path
            d={smoothPath}
            fill="none"
            stroke="#1976d2"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="5" fill="#1976d2" />
          ))}
          {labels.map((label, i) => {
            const x =
              (i / (labels.length - 1)) * (width - padding * 2) + padding;
            return (
              <text
                key={i}
                x={x}
                y={height - 10}
                fontSize="12"
                textAnchor="middle"
                fill="#666"
              >
                {label}
              </text>
            );
          })}
        </svg>
      </div>
    </Card>
  );
};

export default SalesChart;
