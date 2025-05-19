"use client";

import type { SignUpT } from "@/app/[locale]/(public)/signup/signup-buttons";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@vooster/supabase/client";
import { Button } from "@vooster/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@vooster/ui/form";
import { Input } from "@vooster/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  email: z
    .string()
    .email({ message: "Please enter a valid email address for login." }),
});

export function EmailSignupForm({
  setSignUpState,
}: {
  setSignUpState: React.Dispatch<React.SetStateAction<SignUpT>>;
}) {
  const supabase = createClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSignup = (values: z.infer<typeof formSchema>) => {
    supabase.auth.signInWithOtp({
      email: values.email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    setSignUpState({ value: "emailSubmited" });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSignup)}
        className="grid gap-4 w-full"
      >
        <FormField
          control={form.control}
          name={"email"}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  className="h-14"
                  placeholder={"Email"}
                  autoFocus
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          variant={"default"}
          className="w-full"
          size={"xl"}
        >
          Continue with email
        </Button>
      </form>
    </Form>
  );
}
