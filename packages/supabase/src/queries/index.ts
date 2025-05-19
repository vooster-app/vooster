"server-only";

import type { Client } from "../types";

export async function getUserQuery(supabase: Client, userId: string) {
  return supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single()
    .throwOnError();
}

export async function getChatsByUserQuery(supabase: Client, userId: string) {
  return supabase
    .from("chats")
    .select("*")
    .eq("user_id", userId)
    .throwOnError();
}

export async function getCollectionByUserQuery(
  supabase: Client,
  userId: string,
) {
  return supabase
    .from("user_collections")
    .select("*")
    .eq("user_id", userId)
    .throwOnError();
}

export async function getPagesByCollectionQuery(
  supabase: Client,
  collectionId: string,
) {
  return supabase
    .from("pages")
    .select("*")
    .eq("collection_id", collectionId)
    .throwOnError();
}

export async function getPageByIdQuery(supabase: Client, pageId: string) {
  return supabase.from("pages").select("*").eq("id", pageId).single();
}

export async function getItemsByCollectionQuery(
  supabase: Client,
  collectionId: string,
) {
  return supabase
    .from("items")
    .select("*")
    .eq("collection_id", collectionId)
    .throwOnError();
}

export async function getAllItemsByCollectionQuery(
  supabase: Client,
  collectionId: string,
) {
  return supabase
    .rpc("get_items_by_collection", { pcollection_id: collectionId })
    .throwOnError();
}

export async function getMessagesByChatQuery(supabase: Client, chatId: string) {
  return supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .throwOnError();
}

export async function getInterviewsByUserQuery(
  supabase: Client,
  userId: string,
) {
  return supabase
    .from("interviews")
    .select("*")
    .eq("user_id", userId)
    .throwOnError();
}

export async function getCompletedInterviewsByInterviewIdQuery(
  supabase: Client,
  interviewId: string,
) {
  return supabase
    .from("interviews")
    .select(`
      *,
      interview_turns (
        id,
        question_text,
        example_answer_text,
        turn_no,
        answer_text
      )
    `)
    .eq("id", interviewId)
    .eq("status", "DONE")
    .single()
    .throwOnError();
}

export async function getInterviewByIdQuery(
  supabase: Client,
  interviewId: string,
) {
  return supabase
    .from("interviews")
    .select(`
      *,
      interview_turns (
        id,
        question_text,
        example_answer_text,
        turn_no,
        answer_text
      )
    `)
    .eq("id", interviewId)
    .single()
    .throwOnError();
}

export async function getInterviewTurnsByInterviewQuery(
  supabase: Client,
  interviewId: string,
) {
  return supabase
    .from("interview_turns")
    .select("*")
    .eq("interview_id", interviewId)
    .order("turn_no", { ascending: true })
    .throwOnError();
}

export async function getSidebarDataQuery(supabase: Client, userId: string) {
  return supabase
    .from("user_collections")
    .select(`
      id,
      name,
      items!inner (
        id,
        name,
        type,
        parent_item_id,
        pages (
          id,
          title
        )
      )
    `)
    .eq("user_id", userId)
    .order("name")
    .throwOnError();
}
