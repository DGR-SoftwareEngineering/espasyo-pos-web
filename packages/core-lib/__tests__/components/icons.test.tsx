import React from "react";
import { render, screen } from "@testing-library/react";
import { CheckedIcon } from "../../components/icons/CheckedIcon";
import { UncheckedIcon } from "../../components/icons/UncheckedIcon";

describe("CheckedIcon", () => {
  it("renders without crashing", () => {
    const { container } = render(<CheckedIcon />);
    expect(container.firstChild).toBeTruthy();
  });

  it("renders an SVG element", () => {
    const { container } = render(<CheckedIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders with correct dimensions", () => {
    const { container } = render(<CheckedIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "32");
    expect(svg).toHaveAttribute("height", "32");
  });

  it("uses default color when no color prop is passed", () => {
    const { container } = render(<CheckedIcon />);
    const rect = container.querySelector("rect");
    expect(rect).toHaveAttribute("fill", "#5E10B1");
  });

  it("uses custom color when color prop is passed", () => {
    const { container } = render(<CheckedIcon color="#FF0000" />);
    const rect = container.querySelector("rect");
    expect(rect).toHaveAttribute("fill", "#FF0000");
  });
});

describe("UncheckedIcon", () => {
  it("renders without crashing", () => {
    const { container } = render(<UncheckedIcon />);
    expect(container.firstChild).toBeTruthy();
  });

  it("renders an SVG element", () => {
    const { container } = render(<UncheckedIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders with correct dimensions", () => {
    const { container } = render(<UncheckedIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "32");
    expect(svg).toHaveAttribute("height", "32");
  });

  it("applies custom color to stroke", () => {
    const { container } = render(<UncheckedIcon color="#00FF00" />);
    const rect = container.querySelector("rect");
    expect(rect).toHaveAttribute("stroke", "#00FF00");
  });

  it("uses default stroke color when no color prop is passed", () => {
    const { container } = render(<UncheckedIcon />);
    const rect = container.querySelector("rect");
    expect(rect).toHaveAttribute("stroke", "#666666");
  });
});
