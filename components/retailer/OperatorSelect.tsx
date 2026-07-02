"use client";

import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  normalizeOperatorInput,
  normalizeOperatorsList,
  type OperatorInput,
  type OperatorServiceType,
} from "@/src/lib/operatorLogos";
import { OperatorOptionLabel } from "@/components/retailer/OperatorLogo";

interface OperatorSelectProps {
  operators: OperatorInput[];
  value?: string;
  onChange: (value: string) => void;
  serviceType: OperatorServiceType;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  id?: string;
}

export default function OperatorSelect({
  operators,
  value = "",
  onChange,
  serviceType,
  placeholder = "Select operator",
  label = "Operator",
  error,
  disabled = false,
  id = "operator-select",
}: OperatorSelectProps) {
  const normalizedOperators = useMemo(
    () => normalizeOperatorsList(operators),
    [operators]
  );

  const selectedOperator = useMemo(
    () =>
      normalizedOperators.find(
        (operator) =>
          operator.id === value ||
          operator.operatorCode === value ||
          normalizeOperatorInput(operator.name).id === value
      ) ?? null,
    [normalizedOperators, value]
  );

  return (
    <div className="space-y-2">
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id={id} className="h-11">
          {selectedOperator ? (
            <OperatorOptionLabel
              operator={selectedOperator}
              serviceType={serviceType}
              logoSize={22}
              className="flex-1 text-left"
            />
          ) : (
            <SelectValue placeholder={placeholder} />
          )}
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {normalizedOperators.map((operator) => (
            <SelectItem
              key={operator.id}
              value={operator.id}
              textValue={operator.name}
              className="py-2.5 pl-9"
            >
              <OperatorOptionLabel
                operator={operator}
                serviceType={serviceType}
                logoSize={24}
              />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
