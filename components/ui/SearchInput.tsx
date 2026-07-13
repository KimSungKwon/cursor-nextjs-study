import type { InputHTMLAttributes, ReactNode } from "react";
import { adminColors, commerceColors } from "@/commons/constants/color";
import {
  adminTypography,
  commerceTypography,
} from "@/commons/constants/typography";
import { cn } from "@/commons/utils/cn";
import { Button } from "@/components/ui/Button";

export type SearchInputVariant = "commerce" | "admin";

export interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  variant?: SearchInputVariant;
  onSearch?: () => void;
  searchLabel?: string;
  leftIcon?: ReactNode;
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M20 20L16.5 16.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SearchInput({
  className,
  variant = "commerce",
  onSearch,
  searchLabel = "Search",
  leftIcon,
  placeholder,
  disabled,
  onKeyDown,
  style,
  ...props
}: SearchInputProps) {
  if (variant === "admin") {
    return (
      <div
        className={cn(
          "flex h-10 w-full items-center gap-2 rounded border border-transparent px-4",
          "focus-within:outline-2 focus-within:outline-offset-2",
          disabled && "opacity-50",
          className,
        )}
        style={{
          backgroundColor: commerceColors.background.default,
          outlineColor: adminColors.primary.main,
        }}
      >
        <input
          type="search"
          disabled={disabled}
          placeholder={placeholder ?? "Search by order id"}
          className="h-full w-full bg-transparent outline-none placeholder:text-[color:var(--input-placeholder)]"
          style={{
            fontFamily: adminTypography.fontFamily.body,
            fontSize: adminTypography.button.lg.fontSize,
            lineHeight: "21px",
            color: adminColors.text.primary,
            ["--input-placeholder" as string]: adminColors.text.muted,
            ...style,
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.key === "Enter") onSearch?.();
          }}
          {...props}
        />
        <span
          className="shrink-0"
          style={{ color: adminColors.text.muted }}
          aria-hidden
        >
          {leftIcon ?? <SearchIcon className="size-[18px]" />}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex h-[72px] w-full items-center gap-4 rounded-xl border px-6 shadow-sm",
        disabled && "opacity-50",
        className,
      )}
      style={{
        backgroundColor: commerceColors.background.default,
        borderColor: commerceColors.border.light,
      }}
    >
      <span
        className="shrink-0"
        style={{ color: commerceColors.text.secondary }}
        aria-hidden
      >
        {leftIcon ?? <SearchIcon />}
      </span>
      <input
        type="search"
        disabled={disabled}
        placeholder={placeholder ?? "Search for products..."}
        className="h-full w-full bg-transparent outline-none placeholder:text-[color:var(--input-placeholder)]"
        style={{
          fontFamily: commerceTypography.fontFamily.body,
          fontSize: commerceTypography.body.md.regular.fontSize,
          color: commerceColors.text.secondary,
          ["--input-placeholder" as string]: commerceColors.text.tertiary,
          ...style,
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.key === "Enter") onSearch?.();
        }}
        {...props}
      />
      <Button
        type="button"
        size="sm"
        disabled={disabled}
        onClick={onSearch}
        className="h-10 shrink-0 rounded-lg px-6"
      >
        {searchLabel}
      </Button>
    </div>
  );
}
