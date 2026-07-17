import { forwardRef } from "react";
import { Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";

const DatePickerInput = forwardRef(
  (
    { value, onClick, onChange, onBlur, placeholder, disabled = false },
    ref
  ) => (
    <div className="relative w-full">
      <Input
        ref={ref}
        value={value ?? ""}
        onClick={disabled ? undefined : onClick}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        inputMode="numeric"
        autoComplete="bday"
        disabled={disabled}
        readOnly={disabled}
        className="pr-10 paytrue-filter-date"
      />

      <button
        type="button"
        tabIndex={-1}
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Open calendar"
      >
        <Calendar size={18} />
      </button>
    </div>
  )
);

DatePickerInput.displayName = "DatePickerInput";
export default DatePickerInput;
