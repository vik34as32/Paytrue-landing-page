"use client";

import { useMemo, useState } from "react";
import { Controller } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SelectField({
  name,
  label,
  placeholder = "Select an option",
  options = [],
  methods,
  searchable = false,
  disabled = false,
}) {
  const {
    control,
    formState: { errors },
  } = methods;

  const [search, setSearch] = useState("");

  const filteredOptions = useMemo(() => {
    if (!searchable || !search.trim()) return options;
    const query = search.trim().toLowerCase();
    return options.filter((option) =>
      option.label.toLowerCase().includes(query)
    );
  }, [options, search, searchable]);

  return (
    <div className="space-y-2" data-field={name}>
      <Label>{label}</Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            value={field.value || ""}
            onValueChange={field.onChange}
            disabled={disabled}
            onOpenChange={(open) => {
              if (!open) setSearch("");
            }}
          >
            <SelectTrigger
              disabled={disabled}
              className={disabled ? "cursor-not-allowed opacity-70" : undefined}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {searchable && (
                <div
                  className="border-b border-slate-100 p-2"
                  onPointerDown={(event) => event.stopPropagation()}
                >
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search..."
                    className="h-9"
                  />
                </div>
              )}
              {filteredOptions.length === 0 ? (
                <p className="px-3 py-2 text-sm text-slate-500">No results found</p>
              ) : (
                filteredOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        )}
      />
      {errors[name] && (
        <p className="text-xs text-red-500">{errors[name].message}</p>
      )}
    </div>
  );
}
