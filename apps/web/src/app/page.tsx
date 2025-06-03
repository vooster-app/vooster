import { FeaturesSection } from "@/components/sections/features-section";
import { QuoteCta } from "@/components/sections/quote-cta";
import { SecondFeaturesSection } from "@/components/sections/second-features-section";
import { Button, buttonVariants } from "@vooster/ui/button";
import Image from "next/image";
import Link from "next/link";

function Hero() {
  return (
    <div className="relative w-full min-h-screen h-full mx-auto flex flex-col gap-4 items-start justify-center">
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <Image
          src="/hero-waves.png"
          alt="Hero background waves"
          width={1920}
          height={1080}
          className="w-full h-full object-cover opacity-80"
          priority
          quality={90}
          sizes="100vw"
          style={{
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
      </div>
      <div className="relative z-10 flex flex-col gap-4 items-start justify-center w-full mx-auto px-4 max-w-5xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 backdrop-blur-sm px-4 py-0.5 pb-3">
          <span className="text-sm text-white/70">building in public</span>
          <div className="size-4 rounded-full bg-white/10 flex items-center justify-center">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className="text-white/70"
            >
              <path
                d="M2.5 6H9.5M9.5 6L6 2.5M9.5 6L6 9.5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-6xl w-full">
          Turn rough ideas into live, intelligent projects fast
        </h1>
        <p className="text-[21px] opacity-70 max-w-2xl">
          Vooster interviews your brain one question at a time, auto‑builds a
          clean knowledge base, and gives you an AI partner that already "gets"
          your business.
        </p>
        <div className="flex flex-row gap-2 pt-4 items-center justify-start w-full">
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

export default function Page() {
  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center relative overflow-hidden">
      <Hero />
      <FeaturesSection />
      <SecondFeaturesSection />
      <QuoteCta />
    </div>
  );
}
