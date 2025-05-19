"use client";

import { EmailSignupForm } from "@/components/email-signup-form";
import { GoogleSignin } from "@/components/google-signin";
import { Button } from "@vooster/ui/button";
import { cn } from "@vooster/ui/cn";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import type React from "react";
import { useState } from "react";

enum actions {
  email = 0,
  google = 1,
  emailSubmited = 2,
}

export type SignUpT = {
  value: keyof typeof actions | null;
};

const MotionWrapper = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className={cn("grid gap-4 w-full", className)}
  >
    {children}
  </motion.div>
);

export function SignUpAction({
  action = "login",
}: {
  action: "login" | "signup";
}) {
  const [signUpState, setSignUpState] = useState<SignUpT>({ value: null });

  const DynamicContent = () => {
    if (!signUpState.value) {
      return (
        <MotionWrapper>
          <span className="text-2xl font-semibold text-neutral-200 mb-6 text-center">
            {action === "login" ? "Login to Vooster" : "Create your workspace"}
          </span>
          <GoogleSignin />
          <Button
            onClick={() => setSignUpState({ value: "email" })}
            variant={"secondary"}
            size={"xl"}
          >
            Continue with email
          </Button>
          {action === "signup" && (
            <div className="flex flex-col w-full mt-6">
              <div className="w-full text-center text-sm">
                <span className="text-primary/70">
                  By signing up you agree to our{" "}
                </span>
                <Link className="hover:underline" href="/terms">
                  Terms of Service
                </Link>
                <span className="text-primary/70"> and </span>
                <Link className="hover:underline" href="/dpa">
                  Data Processing Agreement
                </Link>
              </div>
              <span className="w-full my-3 text-center">&#95;</span>
              <div className="w-full text-center text-sm">
                <span className="text-primary/70">
                  Already have an account?{" "}
                </span>
                <Link className="hover:underline" href="/login">
                  Login &rarr;
                </Link>
              </div>
            </div>
          )}
        </MotionWrapper>
      );
    }

    if (signUpState.value === "google") {
      return (
        <MotionWrapper>
          <GoogleSignin />
          <Button variant={"secondary"} size={"xl"}>
            Continue with email
          </Button>
        </MotionWrapper>
      );
    }

    if (signUpState.value === "email") {
      return (
        <MotionWrapper>
          <span className="text-2xl font-semibold text-neutral-200 mb-6 text-center">
            What&apos;s your email address?
          </span>
          <EmailSignupForm setSignUpState={setSignUpState} />
          <Button
            onClick={() => setSignUpState({ value: null })}
            variant={"link"}
            size={"xl"}
          >
            Back to {action === "login" ? "login" : "signup"}
          </Button>
        </MotionWrapper>
      );
    }

    if (signUpState.value === "emailSubmited") {
      return (
        <MotionWrapper>
          <span className="text-2xl font-semibold text-neutral-200 mb-6 text-center">
            Check your email
          </span>
          <div className="flex flex-col w-full">
            <div className="w-full text-center flex flex-col">
              <span className="text-primary/70">
                We&apos;ve sent you a temporay login link.
              </span>
              <span className="text-primary/70">
                Please check your inbox.
                {/* <span className="text-primary">{form.getValues("email")}</span> */}
              </span>
            </div>
          </div>
          <Button
            onClick={() => setSignUpState({ value: null })}
            variant={"link"}
            size={"xl"}
          >
            Back to {action === "login" ? "login" : "signup"}
          </Button>
        </MotionWrapper>
      );
    }

    return null;
  };

  return (
    <div className="grid gap-4 w-full">
      <AnimatePresence mode="wait">
        <DynamicContent key={signUpState.value} />
      </AnimatePresence>
    </div>
  );
}
