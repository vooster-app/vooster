import { cn } from "@vooster/ui/cn";
import type { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export function Section({ children, className, id }: SectionProps) {
  return (
    <section
      id={id}
      className={cn("w-full py-12 md:py-16 lg:py-20", className)}
    >
      <div className="container mx-auto px-4 md:px-6">{children}</div>
    </section>
  );
}
