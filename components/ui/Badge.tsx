import { cn } from "@/lib/cn";

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        "border-zinc-200 bg-white text-zinc-700",
        "dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200",
        className,
      )}
      {...props}
    />
  );
}

