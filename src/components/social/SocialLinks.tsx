import { MINISTRY_SOCIAL } from "@/lib/ministryContact";
import { cn } from "@/lib/utils";
import { SocialBrandIcon } from "./SocialBrandIcon";

type Variant = "footer" | "inline";

export function SocialLinks({
  variant = "inline",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  const isFooter = variant === "footer";

  return (
    <ul
      className={cn(
        "flex flex-wrap items-center gap-2",
        isFooter ? "gap-1" : "gap-2",
        className
      )}
    >
      {MINISTRY_SOCIAL.map((item) => (
        <li key={item.id}>
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={item.label}
            className={cn(
              "inline-flex items-center justify-center rounded-lg border border-border/60 bg-background text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary",
              isFooter ? "size-10" : "size-11"
            )}
          >
            <SocialBrandIcon
              id={item.id}
              className={isFooter ? "size-[22px]" : "size-5"}
            />
          </a>
        </li>
      ))}
    </ul>
  );
}
