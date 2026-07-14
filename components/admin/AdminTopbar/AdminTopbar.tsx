import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/commons/utils/cn";

export interface AdminTopbarProps extends HTMLAttributes<HTMLElement> {
  searchSlot?: ReactNode;
  rightSlot?: ReactNode;
}

export const AdminTopbar = ({
  searchSlot,
  rightSlot,
  className,
  style,
  children,
  ...props
}: AdminTopbarProps) => {
  return (
    <div
      className={cn(
        "flex h-14 items-center justify-between gap-4 border-b border-[var(--admin-border-default)] bg-[var(--admin-background-default)] px-6",
        className,
      )}
      style={style}
      {...props}
    >
      <div className="min-w-0 flex-1">{searchSlot ?? children}</div>
      {rightSlot ? (
        <div className="flex shrink-0 items-center gap-3">{rightSlot}</div>
      ) : null}
    </div>
  );
};
