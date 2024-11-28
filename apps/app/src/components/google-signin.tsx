"use client";

import { createClient } from "@vooster/supabase/client";
import { Button } from "@vooster/ui/button";

export function GoogleSignin() {
  const supabase = createClient();

  const handleSignin = () => {
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  };

  return (
    <Button onClick={handleSignin} size={"xl"} className="font-mono">
      Continue with Google
    </Button>
  );
}
