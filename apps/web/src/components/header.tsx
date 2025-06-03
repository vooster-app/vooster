"use client";

import { Button } from "@vooster/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@vooster/ui/dialog";
import Image from "next/image";
import Link from "next/link";

const Links = [
  {
    label: "Features",
    href: "/features",
  },
  {
    label: "How it works",
    href: "/how-it-works",
  },
  {
    label: "Roadmap",
    href: "/roadmap",
  },
];

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <li className="list-none">
      <Link
        href={href}
        className="text-sm px-3 flex items-center justify-center bg-none text-[#8a8f98] rounded-md h-8 hover:text-[#8a8f98]/70 transition-colors duration-100"
      >
        {label}
      </Link>
    </li>
  );
}

export function Header() {
  return (
    <div>
      <header className="fixed top-0 backdrop-blur-sm inset-0 z-100 bg-[var(--linear-header-bg)] mx-auto h-16 border-b border-[var(--linear-border)]">
        <nav className="flex items-center h-full">
          <div className="relative w-full max-w-5xl mx-auto">
            <ul
              className="list-none flex items-center justify-between gap-2"
              dir="ltr"
              data-orientation="horizontal"
              aria-label="Site navigation"
            >
              <li className="flex items-start">
                <Link
                  href="/"
                  className="flex-1 flex items-center justify-center px-2 h-8"
                >
                  <Image
                    src="/wordmark-light.png"
                    alt="vooster logo"
                    width={100}
                    quality={100}
                    height={100}
                  />
                </Link>
              </li>
              <div className="flex items-center gap-2">
                {Links.map((link) => (
                  <NavLink
                    key={link.href}
                    href={link.href}
                    label={link.label}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <li className="list-none">
                  <Link
                    href="/#"
                    className="text-sm px-3 flex items-center justify-center bg-none text-[#8a8f98] rounded-md h-8 hover:text-[#8a8f98]/70 transition-colors duration-100"
                  >
                    Talk to founders
                  </Link>
                </li>
              </div>
            </ul>
          </div>
        </nav>
      </header>
    </div>
  );
}
