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
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-slate-600">
        {labelText}
      </label>
      <select
        id={id}
        className="input"
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
    </div>
  );
}
