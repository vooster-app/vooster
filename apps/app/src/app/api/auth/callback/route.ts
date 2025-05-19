import { setupAnalytics } from "@vooster/analytics/server";
import { getSession } from "@vooster/supabase/cached-queries";
import { createClient } from "@vooster/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    const { data } = await getSession();

    const analytics = await setupAnalytics({
      userId: data?.session?.user?.id,
      fullName: data?.session?.user?.user_metadata?.full_name,
    });

    await analytics.track({
      event: "SignIn",
      channel: "AuthCallback",
    });

    if (error) {
      console.error("Auth callback error:", error);
      return NextResponse.redirect(`${origin}?error=${error.message}`);
    }

    const forwardedHost = request.headers.get("x-forwarded-host");
    const isLocalEnv = process.env.NODE_ENV === "development";

    if (isLocalEnv) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}${next}`);
    }
    return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}?error=auth-code-error`);
}
