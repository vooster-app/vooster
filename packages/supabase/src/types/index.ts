import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Enums } from "./db";

export type Client = SupabaseClient<Database>;

type InterviewStatus = Database["public"]["Enums"]["interview_status"];

export const InterviewStatus = {
  IN_PROGRESS: "IN_PROGRESS",
  DONE: "DONE",
  ABORTED: "ABORTED",
} as const satisfies Record<InterviewStatus, InterviewStatus>;

export * from "./db";
