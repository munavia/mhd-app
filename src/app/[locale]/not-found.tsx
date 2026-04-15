import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold tracking-tight mb-2">404</h1>
        <h2 className="text-xl font-medium text-muted-foreground mb-6">
          Page Not Found
        </h2>
        <p className="text-muted-foreground mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/" className={cn(buttonVariants({ size: "lg" }))}>
          Return Home
        </Link>
      </div>
    </div>
  );
}
