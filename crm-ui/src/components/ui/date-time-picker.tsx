"use client";
 
import * as React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
 
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverPortal
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
 
interface DateTimePickerProps {
  value?: string | Date;
  onChange?: (value: string | undefined) => void;
  disabled?: boolean;
  requireTime?: boolean;
  onValidationError?: (error: string | null) => void;
}

export function DateTimePicker({ 
  value, 
  onChange, 
  disabled = false, 
  requireTime = false,
  onValidationError 
}: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(() => {
    if (value) {
      return new Date(value);
    }
    return undefined;
  });
  const [isOpen, setIsOpen] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const [hasUserSetTime, setHasUserSetTime] = React.useState(false);
 
  // Update internal state when value prop changes
  React.useEffect(() => {
    if (value) {
      const newDate = new Date(value);
      setDate(newDate);
      // If date has time set, mark as user has set time
      setHasUserSetTime(newDate.getHours() !== 0 || newDate.getMinutes() !== 0);
    } else {
      setDate(undefined);
      setHasUserSetTime(false);
    }
    setValidationError(null);
  }, [value]);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  
  const validateDateTime = (dateToValidate: Date | undefined) => {
    if (requireTime && dateToValidate) {
      // Check if time has been explicitly set (not default midnight)
      const hasTime = hasUserSetTime || (dateToValidate.getHours() !== 0 || dateToValidate.getMinutes() !== 0);
      if (!hasTime) {
        const error = "Please set a time for the selected date";
        setValidationError(error);
        onValidationError?.(error);
        return false;
      }
    }
    setValidationError(null);
    onValidationError?.(null);
    return true;
  };
  
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      // If time hasn't been set yet, set a default time
      if (!hasUserSetTime) {
        // Set default time to 9:00 AM
        newDate.setHours(9, 0, 0, 0);
        setHasUserSetTime(true); // Mark as time has been set with default
      } else {
        // Preserve existing time if user had set it
        if (date) {
          newDate.setHours(date.getHours(), date.getMinutes());
        }
      }
      setDate(newDate);
      
      if (validateDateTime(newDate)) {
        onChange?.(newDate.toISOString());
      }
    }
  };
 
  const handleTimeChange = (
    type: "hour" | "minute" | "ampm",
    value: string
  ) => {
    // If no date is selected, default to today
    const baseDate = date ?? new Date();
    const newDate = new Date(baseDate);
    
    // Preserve existing time components when changing one component
    if (date) {
      newDate.setHours(date.getHours(), date.getMinutes());
    }

    if (type === "hour") {
      const currentAmPm = newDate.getHours() >= 12 ? 12 : 0;
      newDate.setHours((parseInt(value) % 12) + currentAmPm);
    } else if (type === "minute") {
      newDate.setMinutes(parseInt(value));
    } else if (type === "ampm") {
      const currentHours = newDate.getHours();
      newDate.setHours(
        value === "PM"
          ? (currentHours < 12 ? currentHours + 12 : currentHours)
          : (currentHours >= 12 ? currentHours - 12 : currentHours)
      );
    }
    
    setHasUserSetTime(true);
    setDate(newDate);
    
    if (validateDateTime(newDate)) {
      onChange?.(newDate.toISOString());
    }
  };
 
  const handleClear = () => {
    setDate(undefined);
    setHasUserSetTime(false);
    setValidationError(null);
    onValidationError?.(null);
    onChange?.(undefined);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <Popover open={isOpen} onOpenChange={setIsOpen} modal={true}>
      <PopoverTrigger asChild>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "flex-1 justify-start text-left font-normal",
              !date && "text-muted-foreground",
              validationError && "border-red-500 focus:border-red-500"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "MM/dd/yyyy hh:mm aa") : "MM/DD/YYYY hh:mm aa"}
          </Button>
          {date && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={disabled}
              onClick={handleClear}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </PopoverTrigger>

      <PopoverPortal>
        <PopoverContent
          align="start"
          sideOffset={6}
          className="z-[100] w-auto overflow-hidden p-0"
        >
          <div className="sm:flex">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
          />
          <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {hours.reverse().map((hour) => (
                  <Button
                    key={hour}
                    size="icon"
                    variant={
                      date && date.getHours() % 12 === hour % 12
                        ? "default"
                        : "ghost"
                    }
                    className="sm:w-full shrink-0 aspect-square"
                    onClick={() => handleTimeChange("hour", hour.toString())}
                  >
                    {hour}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                  <Button
                    key={minute}
                    size="icon"
                    variant={
                      date && date.getMinutes() === minute
                        ? "default"
                        : "ghost"
                    }
                    className="sm:w-full shrink-0 aspect-square"
                    onClick={() =>
                      handleTimeChange("minute", minute.toString())
                    }
                  >
                    {minute}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <ScrollArea className="">
              <div className="flex sm:flex-col p-2">
                {["AM", "PM"].map((ampm) => (
                  <Button
                    key={ampm}
                    size="icon"
                    variant={
                      date &&
                      ((ampm === "AM" && date.getHours() < 12) ||
                        (ampm === "PM" && date.getHours() >= 12))
                        ? "default"
                        : "ghost"
                    }
                    className="sm:w-full shrink-0 aspect-square"
                    onClick={() => handleTimeChange("ampm", ampm)}
                  >
                    {ampm}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
          {/* time selector UI */}
        </PopoverContent>
      </PopoverPortal>
      </Popover>
      {validationError && (
        <p className="text-sm text-red-600">{validationError}</p>
      )}
    </div>
  );
}