import { cn } from "@vooster/ui/cn";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-foreground/10 animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
