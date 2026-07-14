import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/commons/utils/cn";

export interface AdminLayoutProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  sidebar?: ReactNode;
  topbar?: ReactNode;
}

export const AdminLayout = ({
  children,
  sidebar,
  topbar,
  className,
  style,
  ...props
}: AdminLayoutProps) => {
  return (
    <div
      className={cn("flex min-h-screen bg-[var(--admin-background-paper)]", className)}
      style={style}
      {...props}
    >
      {sidebar}
      <div className="flex min-w-0 flex-1 flex-col">
        {topbar}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};
