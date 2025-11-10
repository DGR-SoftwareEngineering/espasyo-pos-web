import ChevronLeftIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightIcon from "@mui/icons-material/ChevronRightRounded";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {
  IconButton,
  Table as MUITable,
  Stack,
  SxProps,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Theme,
  Typography,
} from "@mui/material";
import { TableCellProps, tableCellClasses } from "@mui/material/TableCell";
import { Fragment, ReactElement, useRef } from "react";
import { AnimatedBoxSkeleton } from "./animations";
import { PaginationData } from "../api/types";
