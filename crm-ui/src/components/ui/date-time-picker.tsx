import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { startOfToday, isBefore } from "date-fns";

interface DateTimePickerProps {
  value?: string;                    // ISO string
  onChange: (value: string) => void; // emits ISO string
  disabled?: boolean;
}

export function DateTimePicker({ value, onChange, disabled }: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Local UI state
  const [date, setDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  );
  const [time, setTime] = React.useState(
    value ? new Date(value).toTimeString().slice(0, 8) : ""
  );

  // Sync down from parent (also handle clearing)
  React.useEffect(() => {
    if (!value) {
      setDate(undefined);
      return;
    }
    const incoming = new Date(value);
    setDate(incoming);
    setTime(incoming.toTimeString().slice(0, 8));
  }, [value]);

  // Helper to emit combined datetime
  const emit = React.useCallback(
    (baseDate: Date, t: string) => {
      if (!baseDate || isNaN(baseDate.getTime())) return;
      const [h, m, s] = t.split(":");
      if ([h, m, s].some((v) => isNaN(+v))) return;
      const combined = new Date(baseDate);
      combined.setHours(+h, +m, +s, 0);
      if (isNaN(combined.getTime())) return;
      const nextIso = combined.toISOString();
      if (value !== nextIso) onChange(nextIso);
    },
    [onChange, value]
  );

  // If time changes, recompute with current date
  React.useEffect(() => {
    if (date) emit(date, time);
  }, [time, date, emit]);

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-3">
        <Label htmlFor="date-picker" className="px-1">
          Date
        </Label>
        <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
            <Button
            type="button"                     // important inside forms
            variant="outline"
            id="date-picker"
            className="w-32 justify-between font-normal"
            disabled={disabled}
            >
            {date ? date.toLocaleDateString() : "Select date"}
            <ChevronDownIcon className="h-4 w-4" />
            </Button>
        </PopoverTrigger>

        <PopoverContent
            align="start"
            sideOffset={6}
            className="z-[100] w-auto overflow-hidden p-0"  // higher than dialog overlay
        >
            <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            // use a day-granularity disable if needed:
            // disabled={(d) => isBefore(d, startOfToday())}
            onSelect={(d) => {
                if (!d) return;
                setDate(d);
                setOpen(false);
            }}
            initialFocus
            />
        </PopoverContent>
        </Popover>

      </div>

      <div className="flex flex-col gap-3">
        <Label htmlFor="time-picker" className="px-1">
          Time
        </Label>
        <Input
          type="time"
          id="time-picker"
          step="1"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          disabled={disabled}
          className="bg-background appearance-none
                     [&::-webkit-calendar-picker-indicator]:hidden
                     [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
      </div>
    </div>
  );
}
