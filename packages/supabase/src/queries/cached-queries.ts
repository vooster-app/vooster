import "server-only";

import { unstable_cache } from "next/cache";
import { cache } from "react";
import { createClient } from "../clients/server";
import { getUserQuery } from "../queries";

// Cache per request
export const getSession = cache(async () => {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return { data: { session: null } };
  }

  return { data: { session: { user } } };
});

// Cache per request and revalidate every 30 minutes
export const getUser = cache(async () => {
  const {
    data: { session },
  } = await getSession();

  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const supabase = createClient();

  return unstable_cache(
    async () => {
      return getUserQuery(supabase, userId);
    },
    ["user", userId],
    {
      tags: [`user_${userId}`],
      // 30 minutes, jwt expires in 1 hour
      revalidate: 1800,
    },
  )();
});
