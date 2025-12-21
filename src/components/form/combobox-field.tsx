"use client";

import { Check, ChevronsUpDown, Plus } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useFieldContext } from ".";
import { FieldErrors } from "./field-errors";

type ComboboxOption = {
  value: string;
  label: string;
};

type ComboboxFieldProps = {
  label: string;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  allowCreate?: boolean;
  onCreateNew?: (searchValue: string) => void;
  onSelect?: (value: string, label: string) => void;
  isLoading?: boolean;
};

export const ComboboxField = ({
  label,
  options,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  allowCreate = false,
  onCreateNew,
  onSelect,
  isLoading = false,
}: ComboboxFieldProps) => {
  const field = useFieldContext<string>();
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const selectedOption = options.find(
    (opt) => opt.value === field.state.value || opt.label === field.state.value,
  );

  const handleSelect = (value: string) => {
    const selected = options.find((opt) => opt.value === value);
    if (selected && onSelect) {
      onSelect(value, selected.label);
    } else {
      field.handleChange(value);
    }
    setOpen(false);
    setSearchValue("");
  };

  const handleCreateNew = () => {
    if (onCreateNew && searchValue) {
      onCreateNew(searchValue);
      setOpen(false);
      setSearchValue("");
    }
  };

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchValue.toLowerCase()),
  );

  const showCreateOption =
    allowCreate &&
    searchValue &&
    !filteredOptions.some(
      (opt) => opt.label.toLowerCase() === searchValue.toLowerCase(),
    );

  return (
    <div className="space-y-2">
      <Label htmlFor={field.name}>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={field.name}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            onBlur={field.handleBlur}
          >
            {selectedOption ? selectedOption.label : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={searchPlaceholder}
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              {isLoading ? (
                <div className="py-6 text-center text-sm">Loading...</div>
              ) : (
                <>
                  {filteredOptions.length === 0 && !showCreateOption && (
                    <CommandEmpty>{emptyText}</CommandEmpty>
                  )}
                  {filteredOptions.length > 0 && (
                    <CommandGroup>
                      {filteredOptions.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          onSelect={() => handleSelect(option.value)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              field.state.value === option.value
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                  {showCreateOption && (
                    <CommandGroup>
                      <CommandItem onSelect={handleCreateNew}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create &quot;{searchValue}&quot;
                      </CommandItem>
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <FieldErrors meta={field.state.meta} />
    </div>
  );
};
