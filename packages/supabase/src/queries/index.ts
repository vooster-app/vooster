import { createClient } from "@vooster/supabase/server";

export async function getUserQuery() {
  const supabase = createClient();

  return supabase.auth.getUser();
}

export async function getChatsByUserQuery(userId: string) {
  const supabase = createClient();

  return supabase
    .from("chats")
    .select("*")
    .eq("user_id", userId)
    .throwOnError();
}

export async function getCollectionByUserQuery(userId: string) {
  const supabase = createClient();

  return supabase
    .from("user_collections")
    .select("*")
    .eq("user_id", userId)
    .throwOnError();
}

export async function getPagesByCollectionQuery(collectionId: string) {
  const supabase = createClient();

  return supabase
    .from("pages")
    .select("*")
    .eq("collection_id", collectionId)
    .throwOnError();
}

export async function getItemsByCollectionQuery(collectionId: string) {
  const supabase = createClient();

  return supabase
    .from("items")
    .select("*")
    .eq("collection_id", collectionId)
    .throwOnError();
}

export async function getAllItemsByCollectionQuery(collectionId: string) {
  const supabase = createClient();

  return supabase
    .rpc("get_items_by_collection", { pcollection_id: collectionId })
    .throwOnError();
}

export async function getMessagesByChatQuery(chatId: string) {
  const supabase = createClient();

  return supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .throwOnError();
}
