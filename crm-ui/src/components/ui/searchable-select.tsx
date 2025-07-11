import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface SearchableSelectOption {
  value: string;
  label: string;
  subtitle?: string;
  disabled?: boolean;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search options...",
  emptyMessage = "No options found.",
  disabled = false,
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [filteredOptions, setFilteredOptions] =
    React.useState<SearchableSelectOption[]>(options);
  const [triggerWidth, setTriggerWidth] = React.useState<number>(0);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  // Get trigger width for popover sizing
  React.useEffect(() => {
    if (triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
  }, [open]);

  // Filter options based on search
  React.useEffect(() => {
    if (!search.trim()) {
      setFilteredOptions(options);
      return;
    }

    const searchLower = search.toLowerCase();
    const filtered = options.filter(
      (option) =>
        option.label.toLowerCase().includes(searchLower) ||
        option.subtitle?.toLowerCase().includes(searchLower)
    );
    setFilteredOptions(filtered);
  }, [search, options]);

  // Update filtered options when options change
  React.useEffect(() => {
    if (!search.trim()) {
      setFilteredOptions(options);
    }
  }, [options, search]);

  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (optionValue: string) => {
    if (optionValue === value) {
      onValueChange?.("");
    } else {
      onValueChange?.(optionValue);
    }
    setOpen(false);
    setSearch("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      setSearch("");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {selectedOption ? (
            <div className="flex flex-col items-start text-left">
              <span className="font-medium">{selectedOption.label}</span>
              {selectedOption.subtitle && (
                <span className="text-sm text-gray-500 truncate max-w-full">
                  {selectedOption.subtitle}
                </span>
              )}
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0"
        align="start"
        style={{ width: triggerWidth }}
      >
        <div className="p-2">
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="mb-2"
            autoFocus
          />
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              <div className="space-y-1">
                {filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      "flex items-center space-x-2 rounded-md px-2 py-2 text-sm hover:bg-gray-100 cursor-pointer",
                      value === option.value && "bg-gray-100",
                      option.disabled && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() =>
                      !option.disabled && handleSelect(option.value)
                    }
                  >
                    <Check
                      className={cn(
                        "h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col flex-1">
                      <span className="font-medium">{option.label}</span>
                      {option.subtitle && (
                        <span className="text-xs text-gray-500">
                          {option.subtitle}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-sm text-gray-500">
                {emptyMessage}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
