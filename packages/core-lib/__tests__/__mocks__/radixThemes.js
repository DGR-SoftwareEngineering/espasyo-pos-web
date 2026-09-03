const React = require("react");

function el(tag, extraProps) {
  const Comp = React.forwardRef(function(props, ref) {
    const safe = {};
    Object.keys(props).forEach(function(k) {
      if (k === "children") return;
      // allow standard HTML attrs and data-* attrs
      if (
        ["onClick","onKeyDown","onMouseEnter","onMouseLeave","onMouseDown","onMouseUp","onFocus","onBlur","disabled","style","className","id","role","href","type","aria-label","aria-current","aria-disabled","aria-expanded","title","tabIndex"].includes(k) ||
        k.startsWith("data-")
      ) {
        safe[k] = props[k];
      }
    });
    return React.createElement(tag, Object.assign({}, safe, { ref }, extraProps), props.children);
  });
  return Comp;
}

function passthrough({ children }) {
  return React.createElement(React.Fragment, null, children);
}

module.exports = {
  Theme: passthrough,
  Box: el("div"),
  Flex: el("div"),
  Text: el("span"),
  Heading: el("h2"),
  Button: el("button"),
  IconButton: el("button"),
  Badge: el("span"),
  Card: el("div"),
  Separator: function() { return React.createElement("hr"); },
  Avatar: function(props) {
    return React.createElement("div", { "data-testid": "avatar", "aria-label": props["aria-label"] }, props.fallback || null);
  },
  ScrollArea: function({ children }) {
    return React.createElement("div", { "data-testid": "scroll-area" }, children);
  },
  Spinner: function() {
    return React.createElement("div", { "data-testid": "spinner" });
  },
  Tooltip: function({ children }) {
    return React.createElement(React.Fragment, null, children);
  },
  Link: el("a"),
  Dialog: {
    Root: function({ open, children }) {
      if (open === false) return null;
      return React.createElement(React.Fragment, null, children);
    },
    Content: function({ children, "aria-describedby": describedBy, style }) {
      return React.createElement("div", { "data-testid": "dialog-content", style }, children);
    },
    Title: function({ children }) {
      return React.createElement("div", { "data-testid": "dialog-title" }, children);
    },
    Description: function({ children }) {
      return React.createElement("div", null, children);
    },
    Close: function({ children }) {
      return React.createElement(React.Fragment, null, children);
    },
  },
  Popover: {
    Root: passthrough,
    Trigger: passthrough,
    Content: function({ children }) {
      return React.createElement("div", { "data-testid": "popover-content" }, children);
    },
  },
  DropdownMenu: {
    Root: passthrough,
    Trigger: passthrough,
    Content: function({ children }) {
      return React.createElement("div", { "data-testid": "dropdown-content" }, children);
    },
    Item: function({ children, onClick, onSelect, disabled, ...rest }) {
      return React.createElement("button", { onClick: onClick || onSelect, disabled, ...rest }, children);
    },
    Separator: function() { return React.createElement("hr"); },
    Label: function({ children }) { return React.createElement("div", null, children); },
    Sub: passthrough,
    SubTrigger: function({ children }) { return React.createElement("div", null, children); },
    SubContent: function({ children }) { return React.createElement("div", null, children); },
  },
};
