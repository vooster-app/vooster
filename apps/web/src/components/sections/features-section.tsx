"use client";

import {
  ArrowRightIcon,
  ChevronRightIcon,
  ClipboardDocumentIcon,
  DocumentIcon,
} from "@heroicons/react/24/solid";
import { Button } from "@vooster/ui/button";
import { cn } from "@vooster/ui/cn";
import { Markdown } from "@vooster/ui/markdown";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

const sizes = ["50px", "30px", "10px", "40px"];

const ModalOverlayComponent = ({
  input,
  placeholder,
}: { input: string; placeholder?: string }) => {
  const [placeholderActive, setPlaceholderActive] = useState(true);
  const [inputActive, setInputActive] = useState(false);

  useEffect(() => {
    // Show placeholder for 1 second
    const timer = setTimeout(() => {
      setPlaceholderActive(false);
      // Show actual input after placeholder fades
      setTimeout(() => {
        setInputActive(true);
      }, 300);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        transition={{ duration: 0.3 }}
        exit={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        className="absolute inset-0 flex items-center justify-center p-8 z-20"
      >
        {/* Modal card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration: 0.3,
          }}
          className="relative z-10 w-full max-w-[550px] overflow-hidden shadow-[0px_7px_32px_rgba(0,0,0,0.35)] p-1.5 border bg-[#0C0C0C]/70 rounded-[10px] backdrop-blur-md mt-12"
        >
          {/* Mini‑breadcrumb inside modal */}
          <div className="flex items-center gap-1 text-xs font-medium mb-10">
            <div className="flex items-center gap-1 px-1 py-0.5 text-white/50 bg-neutral-800 rounded-md">
              <DocumentIcon className="h-3 w-3" />
              <span>Market</span>
            </div>

            <ChevronRightIcon className="h-3 w-3" />
            <span className="text-white/80 text-xs">New document</span>
          </div>
          <div className="flex items-start gap-4 text-[14px] bg-[#2C2C2C] rounded-[8px] p-2 mt-2">
            <AnimatePresence mode="wait">
              {placeholderActive && (
                <motion.p
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 leading-relaxed text-neutral-200 mb-3"
                >
                  {placeholder}
                </motion.p>
              )}
              {inputActive && (
                <motion.p
                  key="input"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 leading-relaxed text-neutral-200 mb-3"
                >
                  {input}
                </motion.p>
              )}
            </AnimatePresence>
            <Button
              size="icon"
              variant={"auto"}
              disabled={!inputActive}
              className="mt-2 shrink-0 rounded-[8px] bg-[var(--web-primary)] text-white hover:bg-[var(--web-primary)]/80 transition-all duration-100 ease-in-out p-1"
            >
              <ArrowRightIcon className="h-2 w-2" />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const DocumentCardComponent = ({
  children,
  title,
  Icon,
  text,
}: {
  children?: React.ReactNode;
  title?: string;
  Icon?: React.ReactNode;
  text?: string;
}) => {
  const SkeletonWidths = useMemo(
    () =>
      Array.from(
        { length: 86 },
        () => sizes[Math.floor(Math.random() * sizes.length)],
      ),
    [],
  );

  return (
    <div className="relative max-w-[600px] h-full w-full">
      <div className="absolute inset-0 z-10 flex items-start justify-center after:content-[''] after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(to_bottom,transparent_40%,rgb(10_10_10)_97%)]">
        <div className="border border-[hsla(0,0%,100%,.06)] p-1.5 flex items-center rounded-[12px] h-full">
          <div
            className="relative flex h-full w-full items-start justify-center overflow-hidden text-neutral-100 rounded-[10px] border"
            style={{
              background:
                "linear-gradient(134deg,hsla(0,0%,100%,.08),hsla(0,0%,100%,.02),hsla(0,0%,100%,0) 55%)",
            }}
          >
            {/* ─── Main document background ─────────────────────────────── */}
            <div className="relative w-full max-w-5xl rounded-xl h-full">
              {/* Document breadcrumb */}
              <div className="mb-6 flex items-center gap-1 text-sm text-neutral-400 border-b py-[6px] px-2">
                <DocumentIcon className="h-4 w-4" />
                <span className="text-neutral-300">Market</span>
                <ChevronRightIcon className="h-4 w-4" />
                <span className="text-neutral-300">Client research</span>
              </div>

              {title && (
                <div className="text-white/70 text-sm mb-4">{title}</div>
              )}
              {/* Fake document body (placeholder lines) */}
              <div className="flex flex-col gap-4 mx-auto w-full max-w-xl px-16 mt-6">
                <span className="p-3 bg-blue-500/20 rounded-xl w-fit">
                  <ClipboardDocumentIcon className="text-blue-500 size-6" />
                </span>
                <span className="text-md text-white/70">Client Research</span>
                <div className="space-y-3 flex flex-row flex-wrap h-full mt-4 gap-x-1 gap-y-3">
                  {SkeletonWidths.map((width, i) => (
                    <div
                      key={`document-line-${i}`}
                      className="h-1 rounded bg-white/50 w-fit"
                      style={{ width }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const GeneratedDocumentComponent = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  return (
    <div className="relative max-w-[600px] h-full w-full">
      <div className="absolute inset-0 z-10 flex items-start justify-center after:content-[''] after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(to_bottom,transparent_40%,rgb(10_10_10)_97%)]">
        <div className="border border-[hsla(0,0%,100%,.06)] p-1.5 flex items-center rounded-[12px] h-full">
          <div
            className="relative flex h-full w-full items-start justify-center overflow-hidden text-neutral-100 rounded-[10px] border"
            style={{
              background:
                "linear-gradient(134deg,hsla(0,0%,100%,.08),hsla(0,0%,100%,.02),hsla(0,0%,100%,0) 55%)",
            }}
          >
            {/* ─── Main document background ─────────────────────────────── */}
            <div className="relative w-full max-w-5xl rounded-xl h-full">
              {/* Document breadcrumb */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6 flex items-center gap-1 text-sm text-neutral-400 border-b py-[6px] px-2"
              >
                <DocumentIcon className="h-4 w-4" />
                <span className="text-neutral-300">Market</span>
                <ChevronRightIcon className="h-4 w-4" />
                <span className="text-neutral-300">
                  Launch Playbook – AI-Analytics Dashboard
                </span>
              </motion.div>

              {/* Document content */}
              <div className="flex flex-col gap-4 mx-auto w-full max-w-xl px-16 mt-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-3"
                >
                  <span className="p-3 bg-blue-500/20 rounded-xl w-fit">
                    <ClipboardDocumentIcon className="text-blue-500 size-6" />
                  </span>
                  <span className="text-md text-white/70">
                    Launch Playbook – AI-Analytics Dashboard
                  </span>
                </motion.div>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="flex flex-col gap-6 text-sm"
                >
                  {/* Target audience section */}
                  <motion.div
                    variants={itemVariants}
                    className="flex flex-col gap-2"
                  >
                    <span className="text-base font-medium text-white/90">
                      Target audience
                    </span>
                    <span className="text-white/70">
                      Indie SaaS founders & 1-person finance teams
                    </span>
                  </motion.div>

                  {/* Core promise section */}
                  <motion.div
                    variants={itemVariants}
                    className="flex flex-col gap-2"
                  >
                    <span className="text-base font-medium text-white/90">
                      Core promise
                    </span>
                    <span className="text-white/70">
                      "Revenue clarity in two clicks."
                    </span>
                  </motion.div>

                  {/* Launch goals section */}
                  <motion.div
                    variants={itemVariants}
                    className="flex flex-col gap-2"
                  >
                    <span className="text-base font-medium text-white/90">
                      Launch goals
                    </span>
                    <div className="flex flex-col gap-1 text-white/70">
                      <span>1. 200 wait-list sign-ups in the first 7 days</span>
                      <span>2. 40% email-to-demo conversion</span>
                    </div>
                  </motion.div>

                  {/* Positioning statement section */}
                  <motion.div
                    variants={itemVariants}
                    className="flex flex-col gap-2"
                  >
                    <span className="text-base font-medium text-white/90">
                      Positioning statement
                    </span>
                    <span className="text-white/70">
                      Our dashboard turns raw Stripe data into plain-language
                      insights so solo founders can spot churn threats and
                      revenue opportunities before they snowball.
                    </span>
                  </motion.div>

                  {/* Key messages section */}
                  <motion.div
                    variants={itemVariants}
                    className="flex flex-col gap-2"
                  >
                    <span className="text-base font-medium text-white/90">
                      Key messages
                    </span>
                    <div className="flex flex-col gap-1 text-white/70">
                      <span>• Instant MRR, churn %, LTV—no spreadsheets</span>
                      <span>
                        • Zero setup: connect Stripe, get insights in {"<"} 60
                        sec
                      </span>
                      <span>
                        • Built by bootstrappers, priced for bootstrappers
                      </span>
                    </div>
                  </motion.div>

                  {/* Channels & timeline section */}
                  <motion.div
                    variants={itemVariants}
                    className="flex flex-col gap-2"
                  >
                    <span className="text-base font-medium text-white/90">
                      Channels & timeline
                    </span>
                    <div className="flex flex-col gap-1 text-white/70">
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <span className="font-medium">Day</span>
                        <span className="font-medium">Tactic</span>
                        <span className="font-medium">Asset</span>
                        <span>0</span>
                        <span>Product Hunt teaser</span>
                        <span>Animated GIF of dashboard</span>
                        <span>1</span>
                        <span>Indie Hackers founder story</span>
                        <span>800-word post + AMA</span>
                        <span>1-3</span>
                        <span>Drip email #1 (Value)</span>
                        <span>"Your first 3 growth levers"</span>
                        <span>3-5</span>
                        <span>Drip email #2 (Social proof)</span>
                        <span>Beta-tester quotes</span>
                        <span>5-7</span>
                        <span>Drip email #3 (Urgency)</span>
                        <span>Early-bird discount ends</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Success metrics section */}
                  <motion.div
                    variants={itemVariants}
                    className="flex flex-col gap-2"
                  >
                    <span className="text-base font-medium text-white/90">
                      Success metrics
                    </span>
                    <div className="flex flex-col gap-1 text-white/70">
                      <span>
                        • {"≥"} 25 Product Hunt up-votes in first hour
                      </span>
                      <span>• Email open rate {"≥"} 45%</span>
                      <span>
                        • Demo-to-paid conversion {"≥"} 15% within 30 days
                      </span>
                    </div>
                  </motion.div>

                  {/* Next steps section */}
                  <motion.div
                    variants={itemVariants}
                    className="flex flex-col gap-2"
                  >
                    <span className="text-base font-medium text-white/90">
                      Next steps
                    </span>
                    <div className="flex flex-col gap-1 text-white/70">
                      <span>• Finalize teaser GIF — Adam (June 12)</span>
                      <span>• Draft Indie Hackers post — Sarah (June 13)</span>
                      <span>
                        • Configure ConvertKit sequence — Tom (June 14)
                      </span>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureList = [
  {
    id: 1,
    title: "1. Describe your idea briefly",
    FeatureComponent: (
      <DocumentCardComponent>
        <ModalOverlayComponent
          input="I want a launch playbook for my new AI-analytics dashboard."
          placeholder="What do you want to build?"
        />
      </DocumentCardComponent>
    ),
  },
  {
    id: 2,
    title: "2. Build context by anwsering questions",
    FeatureComponent: (
      <DocumentCardComponent title="Who is the primary audience and what single promise should the launch headline deliver?">
        <ModalOverlayComponent
          input="Audience: indie SaaS founders • Promise: 'Instant revenue clarity."
          placeholder="Audience: indie SaaS founders • Promise: 'Instant revenue clarity."
        />
      </DocumentCardComponent>
    ),
  },
  {
    id: 3,
    title: "3. Use example responses as a guide",
    FeatureComponent: (
      <DocumentCardComponent title="Who is the primary audience and what single promise should the launch headline deliver?">
        <ModalOverlayComponent
          input="Audience: indie SaaS founders • Promise: 'Instant revenue clarity."
          placeholder="Audience: indie SaaS founders • Promise: 'Instant revenue clarity."
        />
      </DocumentCardComponent>
    ),
  },
  {
    id: 4,
    title: "4. Generate a document",
    FeatureComponent: <GeneratedDocumentComponent />,
  },
];

function FeatureListItem({
  title,
  isActive,
  setActiveFeatureId,
  id,
}: {
  title: string;
  isActive: boolean;
  setActiveFeatureId: (id: number) => void;
  id: number;
}) {
  function handleClick() {
    if (isActive) {
      return;
    }
    setActiveFeatureId(id);
  }
  return (
    <div
      className="w-full cursor-pointer"
      onClick={handleClick}
      onKeyDown={handleClick}
    >
      <div className="flex flex-row gap-3 w-full items-center whitespace-nowrap">
        <span
          className={cn(
            "w-1 h-6 rounded-full transition-all ease-in-out duration-300",
            isActive ? "bg-violet-500" : "bg-neutral-900",
          )}
        />
        <h3
          className={cn(
            "text-[17px] w-full",
            isActive ? "opacity-100" : "opacity-50 hover:opacity-70",
          )}
        >
          {title}
        </h3>
      </div>
    </div>
  );
}

function FeatureActiveComponent({
  FeatureComponent,
}: { FeatureComponent: React.ReactNode }) {
  return <>{FeatureComponent}</>;
}

export function FeaturesSection() {
  const [activeFeatureId, setActiveFeatureId] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeatureId((current) =>
        current === FeatureList.length ? 1 : current + 1,
      );
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-4 items-start justify-center w-full mx-auto max-w-5xl my-24">
      <div>
        <h2 className="text-5xl font-medium">
          Build concise and accurate documents
        </h2>
        <p className="text-[18px] font-medium mt-6">
          Describe you project briefly and Vooster will ask you clear,
          bite-sized questions about your idea.
        </p>
        <p className="text-[18px] opacity-70 font-medium">
          Remembers every answer, and then turns those answers into a
          well-organized document. <br />
          All without you worrying about structure or missing details.
        </p>
      </div>
      <div className="relative flex flex-row gap-4 items-start justify-between w-full mt-12 mx-auto max-w-5xl h-[450px]">
        <div className="flex flex-col gap-3">
          {FeatureList.map((feature) => (
            <FeatureListItem
              key={feature.id}
              title={feature.title}
              isActive={activeFeatureId === feature.id}
              setActiveFeatureId={setActiveFeatureId}
              id={feature.id}
            />
          ))}
        </div>
        <FeatureActiveComponent
          FeatureComponent={FeatureList[activeFeatureId - 1]?.FeatureComponent}
        />
      </div>
    </div>
  );
}
