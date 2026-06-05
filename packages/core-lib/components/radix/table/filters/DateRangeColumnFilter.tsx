import React, { useState } from "react";
import {
  Box,
  Popover,
  TextField as RadixTextField,
} from "@radix-ui/themes";
import { CalendarIcon } from "@radix-ui/react-icons";
import Calendar, { CalendarProps } from "react-calendar";
import { FilterProps } from "react-table";
import { formatDate, isValidDate } from "../../../../business/dates";

type DateRange = [Date | null, Date | null];

interface DateRangeFilterProps extends Omit<FilterProps<{}>, "column"> {
  onChange: (filter: { id: string; value: DateRange | null }) => void;
  column: { id: string };
  filterValue?: DateRange;
}

const formatValue = (value: DateRange) =>
  value[0] || value[1]
    ? `${value[0] ? formatDate(value[0]) : ""} - ${
        value[1] ? formatDate(value[1]) : ""
      }`
    : "";

export const DateRangeColumnFilter: React.FC<DateRangeFilterProps> = ({
  onChange,
  column: { id },
  filterValue = [null, null],
}) => {
  const [value, setValue] = useState<DateRange>(filterValue);
  const [open, setOpen] = useState(false);

  const handleChange: CalendarProps["onChange"] = (newValue: any) => {
    const tuple = (Array.isArray(newValue) ? newValue : [newValue, null]) as
      | [Date]
      | DateRange;
    const start = isValidDate(tuple[0] as Date) ? (tuple[0] as Date) : null;
    const end =
      tuple[1] && isValidDate(tuple[1] as Date) ? (tuple[1] as Date) : null;

    setValue([start, end]);
    if (start && end) {
      onChange({ id, value: [start, end] });
      setOpen(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      if (value[0] && value[1]) {
        onChange({ id, value });
      } else if (!value[0] && !value[1]) {
        onChange({ id, value: null });
      }
    } else {
      setValue([null, null]);
    }
    setOpen(next);
  };

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger>
        <RadixTextField.Root
          aria-describedby={`${id}-filter`}
          value={formatValue(value)}
          placeholder="Select a date range"
          readOnly
          size="2"
          style={{ width: "100%", cursor: "pointer" }}
        >
          <RadixTextField.Slot side="right">
            <CalendarIcon />
          </RadixTextField.Slot>
        </RadixTextField.Root>
      </Popover.Trigger>
      <Popover.Content id={`${id}-filter`} align="start" sideOffset={4}>
        <Box style={{ width: 650, padding: 8 }} data-testid="calendar-popover">
          <Calendar
            selectRange
            calendarType="US"
            maxDetail="month"
            minDetail="month"
            onChange={handleChange}
            value={value}
            showDoubleView
            defaultView="month"
            returnValue="range"
            showNeighboringMonth={false}
          />
        </Box>
      </Popover.Content>
    </Popover.Root>
  );
};
