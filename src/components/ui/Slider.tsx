"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SliderSize = "sm" | "md" | "lg";

export interface SliderProps {
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step increment */
  step?: number;
  /**
   * Current value — single number for standard slider, tuple for range slider.
   * When provided the component is controlled.
   */
  value?: number | [number, number];
  /** Initial value for uncontrolled mode */
  defaultValue?: number | [number, number];
  /** Fires on every drag move */
  onChange?: (value: number | [number, number]) => void;
  /** Fires when the user finishes dragging (mouseup / touchend) */
  onChangeEnd?: (value: number | [number, number]) => void;
  /** Enable range (dual-thumb) mode
   * @default false — auto-detected from value/defaultValue if tuple
   */
  range?: boolean;
  /** Visual size
   * @default "md"
   */
  size?: SliderSize;
  /** Accessible label */
  label?: string;
  /** Unit suffix shown in the built-in tooltip (e.g. "₫", "Hz") */
  unit?: string;
  /** Format the displayed value. Receives the raw number, returns a string. */
  formatValue?: (v: number) => string;
  /** Show the current value tooltip while dragging
   * @default true
   */
  showTooltip?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
}

// ─── Size tokens ──────────────────────────────────────────────────────────────

const TRACK_H: Record<SliderSize, string> = {
  sm: "h-1",
  md: "h-1.5",
  lg: "h-2",
};

const THUMB_SIZE: Record<SliderSize, string> = {
  sm: "size-3.5",
  md: "size-4.5",
  lg: "size-5.5",
};

const THUMB_OFFSET: Record<SliderSize, number> = {
  sm: 7,
  md: 9,
  lg: 11,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clamp(v: number, lo: number, hi: number) {
  return Math.min(Math.max(v, lo), hi);
}

function snap(v: number, step: number, min: number) {
  return Math.round((v - min) / step) * step + min;
}

function pct(v: number, min: number, max: number) {
  return max === min ? 0 : ((v - min) / (max - min)) * 100;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Slider — a draggable single-value or dual-thumb range slider.
 *
 * ```tsx
 * // Single value
 * <Slider min={0} max={100} value={brightness} onChange={setBrightness} />
 *
 * // Range (dual thumb)
 * <Slider
 *   min={0} max={30_000_000} step={500_000}
 *   value={priceRange} onChange={setPriceRange}
 *   unit="₫" formatValue={(v) => v.toLocaleString("vi-VN") + "₫"}
 * />
 * ```
 */
export const Slider = forwardRef<HTMLDivElement, SliderProps>(function Slider(
  {
    min = 0,
    max = 100,
    step = 1,
    value: valueProp,
    defaultValue,
    onChange,
    onChangeEnd,
    range: rangeProp,
    size = "md",
    label,
    unit,
    formatValue,
    showTooltip = true,
    disabled = false,
    id: idProp,
    className = "",
  },
  ref
) {
  const generatedId = useId();
  const id = idProp ?? generatedId;

  // Determine range mode
  const isRange =
    rangeProp ??
    Array.isArray(valueProp) ??
    Array.isArray(defaultValue) ??
    false;

  // ── Internal state (uncontrolled) ──
  const defaultInit: [number, number] = Array.isArray(defaultValue)
    ? defaultValue
    : defaultValue !== undefined
      ? [defaultValue, defaultValue]
      : isRange
        ? [min, max]
        : [min, min];

  const [internal, setInternal] = useState<[number, number]>(defaultInit);

  const isControlled = valueProp !== undefined;
  const current: [number, number] = isControlled
    ? Array.isArray(valueProp)
      ? valueProp
      : [valueProp, valueProp]
    : internal;

  // ── Refs ──
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingThumb = useRef<"lo" | "hi" | null>(null);
  const [activeThumb, setActiveThumb] = useState<"lo" | "hi" | null>(null);

  // ── Value helpers ──
  const emit = useCallback(
    (lo: number, hi: number) => {
      if (!onChange) return;
      if (isRange) onChange([lo, hi]);
      else onChange(hi);
    },
    [onChange, isRange]
  );

  const emitEnd = useCallback(
    (lo: number, hi: number) => {
      if (!onChangeEnd) return;
      if (isRange) onChangeEnd([lo, hi]);
      else onChangeEnd(hi);
    },
    [onChangeEnd, isRange]
  );

  const setValue = useCallback(
    (lo: number, hi: number) => {
      if (!isControlled) setInternal([lo, hi]);
      emit(lo, hi);
    },
    [isControlled, emit]
  );

  // ── Pointer → value ──
  const pointerToValue = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return min;
      const rect = track.getBoundingClientRect();
      const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
      const raw = min + ratio * (max - min);
      return clamp(snap(raw, step, min), min, max);
    },
    [min, max, step]
  );

  // ── Drag handlers ──
  const handleMove = useCallback(
    (clientX: number) => {
      if (!draggingThumb.current) return;
      const val = pointerToValue(clientX);
      const thumb = draggingThumb.current;
      if (isRange) {
        if (thumb === "lo") {
          setValue(Math.min(val, current[1]), current[1]);
        } else {
          setValue(current[0], Math.max(val, current[0]));
        }
      } else {
        setValue(min, val);
      }
    },
    [pointerToValue, isRange, current, setValue, min]
  );

  const handleEnd = useCallback(() => {
    if (draggingThumb.current) {
      emitEnd(current[0], current[1]);
    }
    draggingThumb.current = null;
    setActiveThumb(null);
  }, [current, emitEnd]);

  // Global mouse/touch listeners during drag
  useEffect(() => {
    if (activeThumb === null) return;

    const onMouseMove = (e: globalThis.MouseEvent) => handleMove(e.clientX);
    const onTouchMove = (e: globalThis.TouchEvent) => {
      if (e.touches[0]) handleMove(e.touches[0].clientX);
    };
    const onUp = () => handleEnd();

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [activeThumb, handleMove, handleEnd]);

  // ── Start drag ──
  const startDrag = (thumb: "lo" | "hi", clientX: number) => {
    if (disabled) return;
    draggingThumb.current = thumb;
    setActiveThumb(thumb);
    handleMove(clientX);
  };

  const handleTrackMouseDown = (e: ReactMouseEvent) => {
    if (disabled) return;
    const val = pointerToValue(e.clientX);
    // Pick closer thumb
    if (isRange) {
      const distLo = Math.abs(val - current[0]);
      const distHi = Math.abs(val - current[1]);
      const thumb = distLo <= distHi ? "lo" : "hi";
      startDrag(thumb, e.clientX);
    } else {
      startDrag("hi", e.clientX);
    }
  };

  const handleTrackTouchStart = (e: ReactTouchEvent) => {
    if (disabled || !e.touches[0]) return;
    const val = pointerToValue(e.touches[0].clientX);
    if (isRange) {
      const distLo = Math.abs(val - current[0]);
      const distHi = Math.abs(val - current[1]);
      const thumb = distLo <= distHi ? "lo" : "hi";
      startDrag(thumb, e.touches[0].clientX);
    } else {
      startDrag("hi", e.touches[0].clientX);
    }
  };

  // ── Keyboard ──
  const handleKeyDown = (thumb: "lo" | "hi") => (e: React.KeyboardEvent) => {
    if (disabled) return;
    let delta = 0;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") delta = step;
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") delta = -step;
    else if (e.key === "Home") delta = min - (thumb === "lo" ? current[0] : current[1]);
    else if (e.key === "End") delta = max - (thumb === "lo" ? current[0] : current[1]);
    else return;

    e.preventDefault();
    if (isRange) {
      if (thumb === "lo") {
        const next = clamp(current[0] + delta, min, current[1]);
        setValue(next, current[1]);
      } else {
        const next = clamp(current[1] + delta, current[0], max);
        setValue(current[0], next);
      }
    } else {
      const next = clamp(current[1] + delta, min, max);
      setValue(min, next);
    }
  };

  // ── Format ──
  const fmt = (v: number) => {
    if (formatValue) return formatValue(v);
    if (unit) return `${v}${unit}`;
    return String(v);
  };

  // ── Percentages ──
  const loPct = pct(current[0], min, max);
  const hiPct = pct(current[1], min, max);

  // ── Thumb renderer ──
  const renderThumb = (which: "lo" | "hi") => {
    const val = which === "lo" ? current[0] : current[1];
    const pos = which === "lo" ? loPct : hiPct;
    const isActive = activeThumb === which;
    const thumbId = `${id}-thumb-${which}`;

    return (
      <div
        key={which}
        role="slider"
        id={thumbId}
        tabIndex={disabled ? -1 : 0}
        aria-label={
          label
            ? isRange
              ? `${label} ${which === "lo" ? "minimum" : "maximum"}`
              : label
            : undefined
        }
        aria-valuemin={which === "lo" ? min : isRange ? current[0] : min}
        aria-valuemax={which === "hi" ? max : isRange ? current[1] : max}
        aria-valuenow={val}
        aria-valuetext={fmt(val)}
        aria-disabled={disabled}
        onKeyDown={handleKeyDown(which)}
        onMouseDown={(e) => startDrag(which, e.clientX)}
        onTouchStart={(e) => {
          if (e.touches[0]) startDrag(which, e.touches[0].clientX);
        }}
        className={[
          "absolute top-1/2 -translate-y-1/2 rounded-full border-2 bg-white shadow-sm transition-shadow",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2",
          THUMB_SIZE[size],
          disabled
            ? "border-secondary-300 cursor-not-allowed"
            : isActive
              ? "border-primary-600 shadow-md cursor-grabbing z-20"
              : "border-primary-500 hover:border-primary-600 cursor-grab z-10",
        ].join(" ")}
        style={{
          left: `calc(${pos}% - ${THUMB_OFFSET[size]}px)`,
        }}
      >
        {/* Tooltip */}
        {showTooltip && isActive && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap rounded-md bg-secondary-800 px-2 py-1 text-xs font-medium text-white shadow-lg pointer-events-none">
            {fmt(val)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={ref}
      className={[
        "relative select-none",
        disabled ? "opacity-50 pointer-events-none" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Clickable track area — taller for easier clicking */}
      <div
        ref={trackRef}
        className="relative flex items-center py-2 cursor-pointer"
        onMouseDown={handleTrackMouseDown}
        onTouchStart={handleTrackTouchStart}
      >
        {/* Track background */}
        <div
          className={[
            "relative w-full rounded-full bg-secondary-200",
            TRACK_H[size],
          ].join(" ")}
        >
          {/* Filled portion */}
          <div
            className={[
              "absolute h-full rounded-full",
              disabled ? "bg-secondary-400" : "bg-primary-500",
            ].join(" ")}
            style={
              isRange
                ? { left: `${loPct}%`, right: `${100 - hiPct}%` }
                : { left: "0%", right: `${100 - hiPct}%` }
            }
          />
        </div>

        {/* Thumbs */}
        {isRange && renderThumb("lo")}
        {renderThumb("hi")}
      </div>
    </div>
  );
});

/*
 * ─── Prop Table ───────────────────────────────────────────────────────────────
 *
 * Name          Type                         Default    Description
 * ──────────────────────────────────────────────────────────────────────────────
 * min           number                       0          Minimum value
 * max           number                       100        Maximum value
 * step          number                       1          Step increment
 * value         number | [number, number]    —          Controlled value
 * defaultValue  number | [number, number]    —          Uncontrolled initial value
 * onChange      (v) => void                  —          Fires on every drag tick
 * onChangeEnd   (v) => void                  —          Fires on drag end
 * range         boolean                      auto       Force dual-thumb mode
 * size          "sm" | "md" | "lg"           "md"       Visual size
 * label         string                       —          Accessible label
 * unit          string                       —          Unit suffix for tooltip
 * formatValue   (v: number) => string        —          Custom value formatter
 * showTooltip   boolean                      true       Show value tooltip on drag
 * disabled      boolean                      false      Disables interaction
 * id            string                       auto       HTML id
 * className     string                       ""         Extra classes on root
 */
