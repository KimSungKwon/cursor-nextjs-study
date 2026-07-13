"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { adminColors, commerceColors } from "@/commons/constants/color";
import { adminTypography } from "@/commons/constants/typography";
import { cn } from "@/commons/utils/cn";

export interface DropdownOption {
  value: string;
  label: string;
}

export interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onChange?: (value: string) => void;
  "aria-label"?: string;
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Dropdown({
  options,
  value,
  placeholder = "Filter by date range",
  disabled = false,
  className,
  onChange,
  "aria-label": ariaLabel,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={ariaLabel ?? placeholder}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md px-4 text-left",
          "focus-visible:outline-2 focus-visible:outline-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
        style={{
          backgroundColor: commerceColors.background.default,
          fontFamily: adminTypography.fontFamily.body,
          fontSize: adminTypography.button.lg.fontSize,
          fontWeight: adminTypography.fontWeight.medium,
          letterSpacing: "0.43px",
          color: selected ? adminColors.text.primary : adminColors.text.muted,
          outlineColor: adminColors.primary.main,
        }}
      >
        <span className="truncate">{selected?.label ?? placeholder}</span>
        <span style={{ color: adminColors.text.muted }} className="shrink-0">
          <ChevronDown />
        </span>
      </button>

      {open ? (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border py-1 shadow-md"
          style={{
            backgroundColor: commerceColors.background.default,
            borderColor: adminColors.border.default,
          }}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <li key={option.value} role="option" aria-selected={isSelected}>
                <DropdownOptionButton
                  selected={isSelected}
                  onClick={() => {
                    onChange?.(option.value);
                    setOpen(false);
                  }}
                >
                  {option.label}
                </DropdownOptionButton>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

interface DropdownOptionButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected: boolean;
  children: ReactNode;
}

function DropdownOptionButton({
  selected,
  className,
  children,
  style,
  ...props
}: DropdownOptionButtonProps) {
  return (
    <button
      type="button"
      className={cn("flex w-full px-4 py-2 text-left", className)}
      style={{
        fontFamily: adminTypography.fontFamily.body,
        fontSize: adminTypography.button.lg.fontSize,
        color: adminColors.text.primary,
        backgroundColor: selected ? adminColors.background.light : undefined,
        fontWeight: selected
          ? adminTypography.fontWeight.medium
          : adminTypography.fontWeight.regular,
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
