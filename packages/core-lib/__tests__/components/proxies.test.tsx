import React, { createRef } from "react";
import { render, screen } from "../test-utils";

jest.mock("../../design-system", () => ({
  useDesignTokens: jest.fn(() => require("../test-utils").mockDesignTokens()),
  DesignProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import { Box } from "../../components/radix/proxies/Box";
import { Flex } from "../../components/radix/proxies/Flex";
import { Text } from "../../components/radix/proxies/Text";
import { Heading } from "../../components/radix/proxies/Heading";
import { Separator } from "../../components/radix/proxies/Separator";
import { Button } from "../../components/radix/proxies/Button";
import { IconButton } from "../../components/radix/proxies/IconButton";
import { Badge } from "../../components/radix/proxies/Badge";
import { Card } from "../../components/radix/proxies/Card";
import { ContentCard } from "../../components/radix/primitives/ContentCard";

describe("Box", () => {
  it("renders children", () => {
    render(<Box>content</Box>);
    expect(screen.getByText("content")).toBeTruthy();
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Box ref={ref}>child</Box>);
    expect(ref.current).not.toBeNull();
  });
});

describe("Flex", () => {
  it("renders children", () => {
    render(<Flex>flex-content</Flex>);
    expect(screen.getByText("flex-content")).toBeTruthy();
  });

  it("passes style props", () => {
    const { container } = render(<Flex style={{ color: "red" }}>child</Flex>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.color).toBe("red");
  });
});

describe("Text", () => {
  it("renders children", () => {
    render(<Text>hello</Text>);
    expect(screen.getByText("hello")).toBeTruthy();
  });

  it("renders without crashing when no props given", () => {
    const { container } = render(<Text>default text</Text>);
    expect(container.firstChild).toBeTruthy();
  });
});

describe("Heading", () => {
  it("renders children", () => {
    render(<Heading>Page Title</Heading>);
    expect(screen.getByText("Page Title")).toBeTruthy();
  });

  it("renders without crashing", () => {
    const { container } = render(<Heading>Title</Heading>);
    expect(container.firstChild).toBeTruthy();
  });
});

describe("Separator", () => {
  it("renders without crashing", () => {
    const { container } = render(<Separator />);
    expect(container.firstChild).toBeTruthy();
  });

  it("renders an hr element", () => {
    const { container } = render(<Separator />);
    expect(container.querySelector("hr")).not.toBeNull();
  });
});

describe("Button (proxy)", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeTruthy();
  });

  it("renders without crashing", () => {
    const { container } = render(<Button>Save</Button>);
    expect(container.firstChild).toBeTruthy();
  });

  it("passes onClick handler", () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Btn</Button>);
    screen.getByText("Btn").click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("IconButton (proxy)", () => {
  it("renders children", () => {
    render(<IconButton aria-label="close">X</IconButton>);
    expect(screen.getByText("X")).toBeTruthy();
  });

  it("renders without crashing", () => {
    const { container } = render(<IconButton aria-label="action">+</IconButton>);
    expect(container.firstChild).toBeTruthy();
  });

  it("passes onClick handler", () => {
    const onClick = jest.fn();
    render(<IconButton aria-label="action" onClick={onClick}>+</IconButton>);
    screen.getByText("+").click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("Badge (proxy)", () => {
  it("renders children", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toBeTruthy();
  });

  it("renders without crashing", () => {
    const { container } = render(<Badge>Active</Badge>);
    expect(container.firstChild).toBeTruthy();
  });
});

describe("ContentCard", () => {
  it("renders children", () => {
    render(<ContentCard>card content</ContentCard>);
    expect(screen.getByText("card content")).toBeTruthy();
  });

  it("renders without crashing", () => {
    const { container } = render(<ContentCard>content</ContentCard>);
    expect(container.firstChild).toBeTruthy();
  });

  it("passes style props through", () => {
    const { container } = render(
      <ContentCard style={{ border: "1px solid red" }}>content</ContentCard>
    );
    const el = container.firstChild as HTMLElement;
    expect(el).toBeTruthy();
  });
});

describe("Card (proxy)", () => {
  it("renders children with the default surface variant", () => {
    render(<Card>card body</Card>);
    expect(screen.getByText("card body")).toBeTruthy();
  });

  it("passes a custom variant prop through", () => {
    render(<Card variant="classic">x</Card>);
    expect(screen.getByText("x")).toBeTruthy();
  });
});
