import type * as React from "react";

import { cn } from "@vooster/ui/cn";
import { type VariantProps, cva } from "class-variance-authority";

const textareaVariants = cva(
  "flex field-sizing-content min-h-16 w-full rounded-md bg-transparent text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  {
    variants: {
      variant: {
        default:
          "border-input border focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive px-3 py-2 placeholder:text-muted-foreground",
        hidden: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Textarea({
  className,
  variant,
  ...props
}: React.ComponentProps<"textarea"> & VariantProps<typeof textareaVariants>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(textareaVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Textarea, textareaVariants };
