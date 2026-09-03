const React = require("react");

function makeIcon(name) {
  return function(props) {
    return React.createElement("span", { "data-testid": "icon-" + name, ...props });
  };
}

module.exports = {
  ChevronRightIcon: makeIcon("chevron-right"),
  ChevronDownIcon: makeIcon("chevron-down"),
  ChevronLeftIcon: makeIcon("chevron-left"),
  Cross1Icon: makeIcon("cross"),
  ExitIcon: makeIcon("exit"),
  LockClosedIcon: makeIcon("lock"),
  GearIcon: makeIcon("gear"),
  SunIcon: makeIcon("sun"),
  MoonIcon: makeIcon("moon"),
  HomeIcon: makeIcon("home"),
  MagnifyingGlassIcon: makeIcon("search"),
  BellIcon: makeIcon("bell"),
  PersonIcon: makeIcon("person"),
  HamburgerMenuIcon: makeIcon("menu"),
  CheckIcon: makeIcon("check"),
  Cross2Icon: makeIcon("cross2"),
  DotsVerticalIcon: makeIcon("dots-vertical"),
  PlusIcon: makeIcon("plus"),
  TrashIcon: makeIcon("trash"),
  Pencil1Icon: makeIcon("pencil"),
};
