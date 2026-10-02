import { ChevronDown } from "lucide-react";

import { label } from "@/utilities/format";

interface Props {
  id: string;
  labelText: string;
  value: string;
  options: readonly string[];
  emptyLabel?: string; // when set, adds a "" option (e.g. "All" or "Let AI decide")
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function Select({ id, labelText, value, options, emptyLabel, onChange, disabled }: Props) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {labelText}
      </label>
      <div className="relative">
        <select
          id={id}
          className="input h-11 appearance-none pr-9"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        >
          {emptyLabel !== undefined && <option value="">{emptyLabel}</option>}
          {options.map((o) => (
            <option key={o} value={o}>
              {label(o)}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
      </div>
    </div>
  );
}
