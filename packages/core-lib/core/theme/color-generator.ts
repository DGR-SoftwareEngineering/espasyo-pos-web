export class ColorGenerator {
  private white = "#FFF";
  private black = "#000";

  constructor(private readonly color: string) {
    this.color = color;
  }

  get primary() {
    return this.color;
  }

  lightenColor(darknessPercentage: number, transparencyPercentage = 0) {
    return this.blendColors(
      this.white,
      darknessPercentage * 0.01,
      transparencyPercentage * 0.01
    );
  }

  darkenColor(darknessPercentage: number, transparencyPercentage = 0) {
    return this.blendColors(
      this.black,
      darknessPercentage * 0.01,
      transparencyPercentage * 0.01
    );
  }

  private blendColors(
    secondColor: string,
    secondColorAlpha: number,
    opacity: number
  ) {
    const rgbColor1 =
      this.hex2rgb(
        this.color.includes("rgb") ? this.rgb2hex(this.color) : this.color
      )
        .match(/\d+/g)
        ?.map(Number) ?? [];

    const rgbColor2 =
      this.hex2rgb(
        secondColor.includes("rgb") ? this.rgb2hex(secondColor) : secondColor
      )
        .match(/\d+/g)
        ?.map(Number) ?? [];

    if (rgbColor1.length < 3 || rgbColor2.length < 3) {
      throw new Error(
        `Invalid color(s) during blend: base=${this.color}, second=${secondColor}`
      );
    }

    const r1 = rgbColor1[0]!;
    const g1 = rgbColor1[1]!;
    const b1 = rgbColor1[2]!;
    const r2 = rgbColor2[0]!;
    const g2 = rgbColor2[1]!;
    const b2 = rgbColor2[2]!;

    const rgbBlendedColor = [
      (1 - secondColorAlpha) * r1 + secondColorAlpha * r2,
      (1 - secondColorAlpha) * g1 + secondColorAlpha * g2,
      (1 - secondColorAlpha) * b1 + secondColorAlpha * b2,
    ];

    const hex = "#" + rgbBlendedColor.map(this.intToHex).join("");

    const alphaHex =
      opacity > 0
        ? Math.round(opacity * 255)
            .toString(16)
            .padStart(2, "0")
        : "";

    return `${hex}${alphaHex}`;
  }

  private intToHex(value: number) {
    const hex = Math.round(value).toString(16).padStart(2, "0");
    return hex.length == 1 ? "0" + hex : hex;
  }

  private hex2rgb(color: string) {
    let c = color.trim();

    if (!c.startsWith("#") && !c.startsWith("rgb")) {
      c = `#${c}`;
    }

    if (c.startsWith("#") && c.length === 4) {
      c = `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}`;
    }

    const pairs = c.match(/[A-Fa-f0-9]{2}/g);
    if (!pairs || pairs.length < 3) {
      if (c.startsWith("rgb")) return c;
      throw new Error(`Invalid hex color: ${color}`);
    }

    const [r, g, b] = pairs.map((p) => parseInt(p, 16));
    return `rgb(${r}, ${g}, ${b})`;
  }

  private rgb2hex(color: string) {
    const nums = color.match(/\d+/g)?.map((x) => Number(x));
    if (!nums || nums.length < 3) {
      throw new Error(`Invalid rgb color: ${color}`);
    }
    const [r, g, b] = nums;
    return (
      "#" +
      [r, g, b]
        .map((x: any) => Math.round(x).toString(16).padStart(2, "0"))
        .join("")
    );
  }
}
