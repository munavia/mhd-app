import { Church } from "lucide-react";
import { cn } from "@/lib/utils";

const sizeClass = {
  sm: "size-6",
  md: "size-10",
  lg: "size-14",
} as const;

type ChurchLoaderProps = {
  /** Visible text (e.g. `t("loading")` from `Common`). */
  label?: string;
  className?: string;
  iconClassName?: string;
  size?: keyof typeof sizeClass;
  /** When false, only the icon shows; `label` is still exposed to screen readers if set. */
  showLabel?: boolean;
};

export function ChurchLoader({
  label,
  className,
  iconClassName,
  size = "md",
  showLabel = true,
}: ChurchLoaderProps) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-3", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Church
        className={cn(sizeClass[size], "text-primary animate-spin", iconClassName)}
        aria-hidden
        strokeWidth={1.5}
      />
      {showLabel && label ? (
        <p className="text-sm text-muted-foreground">{label}</p>
      ) : null}
      {!showLabel && label ? <span className="sr-only">{label}</span> : null}
    </div>
  );
}
