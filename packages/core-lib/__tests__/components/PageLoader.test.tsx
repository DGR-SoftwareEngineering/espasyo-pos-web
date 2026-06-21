import React from "react";
import { render, screen } from "@testing-library/react";
import { PageLoader } from "../../components/PageLoader";

jest.mock("../../components/radix/BrandedLoader", () => ({
  BrandedLoader: ({
    message,
    fullScreen,
    withBackdrop,
  }: {
    message?: string;
    fullScreen?: boolean;
    withBackdrop?: boolean;
  }) => (
    <div
      data-testid="branded-loader"
      data-full-screen={String(fullScreen)}
      data-with-backdrop={String(withBackdrop)}
    >
      {message ?? "loading"}
    </div>
  ),
}));

describe("PageLoader", () => {
  it("renders without crashing", () => {
    render(<PageLoader />);
    expect(screen.getByTestId("branded-loader")).toBeInTheDocument();
  });

  it("renders BrandedLoader with fullScreen and withBackdrop props", () => {
    render(<PageLoader />);
    const loader = screen.getByTestId("branded-loader");
    expect(loader).toHaveAttribute("data-full-screen", "true");
    expect(loader).toHaveAttribute("data-with-backdrop", "true");
  });

  it("passes custom message to BrandedLoader", () => {
    render(<PageLoader message="Please wait..." />);
    expect(screen.getByTestId("branded-loader")).toHaveTextContent(
      "Please wait..."
    );
  });

  it("renders default message when no message prop is given", () => {
    render(<PageLoader />);
    expect(screen.getByTestId("branded-loader")).toHaveTextContent("loading");
  });
});
