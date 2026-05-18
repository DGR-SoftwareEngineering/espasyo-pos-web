import { ThemeProps } from "@radix-ui/themes";

export type RadixAccent = NonNullable<ThemeProps["accentColor"]>;

const PALETTE: Array<{ name: RadixAccent; rgb: [number, number, number] }> = [
  { name: "gray", rgb: [139, 141, 152] },
  { name: "gold", rgb: [176, 142, 59] },
  { name: "bronze", rgb: [161, 128, 114] },
  { name: "brown", rgb: [173, 127, 88] },
  { name: "yellow", rgb: [255, 230, 41] },
  { name: "amber", rgb: [255, 197, 61] },
  { name: "orange", rgb: [247, 104, 8] },
  { name: "tomato", rgb: [229, 77, 46] },
  { name: "red", rgb: [229, 72, 77] },
  { name: "ruby", rgb: [229, 70, 102] },
  { name: "crimson", rgb: [233, 61, 130] },
  { name: "pink", rgb: [214, 64, 159] },
  { name: "plum", rgb: [171, 74, 186] },
  { name: "purple", rgb: [142, 78, 198] },
  { name: "violet", rgb: [110, 86, 207] },
  { name: "iris", rgb: [91, 91, 214] },
  { name: "indigo", rgb: [62, 99, 221] },
  { name: "blue", rgb: [0, 144, 255] },
  { name: "cyan", rgb: [0, 162, 199] },
  { name: "teal", rgb: [18, 165, 148] },
  { name: "jade", rgb: [41, 163, 131] },
  { name: "green", rgb: [48, 164, 108] },
  { name: "grass", rgb: [70, 167, 88] },
  { name: "lime", rgb: [189, 238, 99] },
  { name: "mint", rgb: [134, 234, 212] },
  { name: "sky", rgb: [124, 226, 254] },
];

const hexToRgb = (hex: string): [number, number, number] | null => {
  const cleaned = hex.trim().replace(/^#/, "");
  if (cleaned.length !== 3 && cleaned.length !== 6) return null;
  const full =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
};

const distanceSquared = (
  a: [number, number, number],
  b: [number, number, number],
): number => {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return dr * dr + dg * dg + db * db;
};

export const hexToRadixAccent = (
  hex: string | null | undefined,
  fallback: RadixAccent = "indigo",
): RadixAccent => {
  if (!hex) return fallback;
  const rgb = hexToRgb(hex);
  if (!rgb) return fallback;
  let bestName: RadixAccent = fallback;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const entry of PALETTE) {
    const d = distanceSquared(rgb, entry.rgb);
    if (d < bestDist) {
      bestDist = d;
      bestName = entry.name;
    }
  }
  return bestName;
};
