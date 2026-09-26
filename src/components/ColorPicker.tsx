import { useEffect, useState } from "react";
import { INHERIT, PRESET_COLORS, normalizeHex, themeForeground } from "../lib/color";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  idPrefix: string;
  label?: string;
}

export function ColorPicker({ value, onChange, idPrefix, label = "Color" }: ColorPickerProps) {
  const [hexText, setHexText] = useState(value === INHERIT ? "" : value);

  useEffect(() => {
    setHexText(value === INHERIT ? "" : value);
  }, [value]);

  const pickerValue = value === INHERIT ? themeForeground() : value;

  return (
    <div className="color-picker" role="group" aria-label={label}>
      <span className="color-picker-label">{label}</span>
      <div className="swatches">
        <button
          type="button"
          className={`swatch swatch-inherit${value === INHERIT ? " is-active" : ""}`}
          onClick={() => onChange(INHERIT)}
          aria-label="Use the theme color"
          title="Theme color"
        >
          <span aria-hidden="true">A</span>
        </button>

        {PRESET_COLORS.map((preset) => (
          <button
            key={preset}
            type="button"
            className={`swatch${value.toLowerCase() === preset ? " is-active" : ""}`}
            style={{ background: preset }}
            onClick={() => onChange(preset)}
            aria-label={`Color ${preset}`}
            aria-pressed={value.toLowerCase() === preset}
            title={preset}
          />
        ))}

        <label className="swatch swatch-custom" title="Custom color">
          <input
            type="color"
            value={pickerValue}
            onChange={(event) => onChange(event.target.value.toLowerCase())}
            aria-label="Pick a custom color"
          />
          <PlusIcon />
        </label>
      </div>

      <input
        id={`${idPrefix}-hex`}
        className="hex-input"
        type="text"
        value={hexText}
        placeholder="#2f54c9"
        spellCheck={false}
        autoComplete="off"
        autoCapitalize="off"
        aria-label="Hex color"
        onChange={(event) => {
          const next = event.target.value;
          setHexText(next);
          const hex = normalizeHex(next);
          if (hex) onChange(hex);
        }}
        onBlur={() => setHexText(value === INHERIT ? "" : value)}
      />
    </div>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="13"
      height="13"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
