import { cn } from "@/commons/utils/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-md bg-foreground px-4 py-2 text-sm text-background",
        className,
      )}
      {...props}
    />
  );
}
