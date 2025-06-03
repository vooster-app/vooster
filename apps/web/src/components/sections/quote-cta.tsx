import { buttonVariants } from "@vooster/ui/button";

import Link from "next/link";

export function QuoteCta() {
  return (
    <div className="my-24 max-w-5xl mx-auto w-full">
      <div className="flex flex-row gap-4 items-start justify-between w-full">
        <h2 className="text-[40px] font-medium w-full">
          Seed an idea. Grow it with intelligence.
        </h2>
        <div className="flex flex-row gap-2 items-center justify-end w-fit">
          <Link
            href="#"
            className={buttonVariants({
              size: "md",
              variant: "auto",
              className: "text-black bg-white text-sm px-6 py-2",
            })}
          >
            Join the waitlist
          </Link>
          <Link
            href="#"
            className={buttonVariants({
              size: "md",
              variant: "auto",
              className:
                "text-sm px-6 py-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent",
            })}
          >
            Talk to founders {" >"}
          </Link>
        </div>
      </div>
    </div>
  );
}
