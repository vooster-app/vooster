import { logger } from "@vooster/logger";
import { createClient } from "@vooster/supabase/server";
import type { Json, TablesUpdate } from "../types";

export async function updateUser(userId: string, data: TablesUpdate<"users">) {
  const supabase = createClient();

  try {
    const result = await supabase.from("users").update(data).eq("id", userId);

    return result;
  } catch (error) {
    logger.error(error);

    throw error;
  }
}

type CreateChatData = {
  user_id: string;
  title: string;
};

export async function saveChat(data: CreateChatData) {
  const supabase = createClient();

  try {
    const result = await supabase.from("chats").insert(data);

    return result;
  } catch (error) {
    logger.error(error);

    throw error;
  }
}

export async function deleteChatByUser(userId: string) {
  const supabase = createClient();

  try {
    const result = await supabase.from("chats").delete().eq("user_id", userId);

    return result;
  } catch (error) {
    logger.error(error);

    throw error;
  }
}

type Message = {
  chat_id: string;
  content: Json;
  id: string;
  role: string;
  created_at: string;
};

export async function saveMessages(messages: Message[]) {
  const supabase = createClient();

  try {
    const result = await supabase.from("messages").insert(messages);

    return result;
  } catch (error) {
    logger.error(error);

    throw error;
  }
}

export async function getMessagesByChatId(chatId: string) {
  const supabase = createClient();

  try {
    const result = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId);

    return result;
  } catch (error) {
    logger.error(error);

    throw error;
  }
}

type SaveCollectionData = {
  user_id: string;
  name: string;
};

export async function saveCollection(data: SaveCollectionData) {
  const supabase = createClient();

  try {
    const result = await supabase.from("user_collections").insert(data);

    return result;
  } catch (error) {
    logger.error(error);

    throw error;
  }
}

export async function deleteCollectionByUser(userId: string) {
  const supabase = createClient();

  try {
    const result = await supabase
      .from("user_collections")
      .delete()
      .eq("user_id", userId);

    return result;
  } catch (error) {
    logger.error(error);

    throw error;
  }
}

type SavePageData = {
  content: string;
};

export async function savePage(data: SavePageData) {
  const supabase = createClient();

  try {
    const result = await supabase.from("pages").insert(data);

    return result;
  } catch (error) {
    logger.error(error);

    throw error;
  }
}

interface SaveFolderData {
  name: string;
  collection_id: string;
  parent_item_id?: string;
}

export async function saveFolder(data: SaveFolderData) {
  const supabase = createClient();

  try {
    const { data: result, error } = await supabase
      .from("items")
      .insert([
        {
          type: "folder",
          name: data.name,
          collection_id: data.collection_id,
          parent_item_id: data.parent_item_id || null,
        },
      ])
      .select();

    if (error) {
      logger.error("Error creating folder:", error);
      throw error;
    }

    return result;
  } catch (error) {
    logger.error("Unexpected error in saveFolder:", error);
    throw error;
  }
}

export async function updateFolderName(folderId: string, name: string) {
  const supabase = createClient();

  try {
    const result = await supabase
      .from("items")
      .update({ name })
      .eq("id", folderId);

    return result;
  } catch (error) {
    logger.error(error);

    throw error;
  }
}

export async function deleteFolderById(folderId: string) {
  const supabase = createClient();

  try {
    const result = await supabase.from("items").delete().eq("id", folderId);

    return result;
  } catch (error) {
    logger.error(error);

    throw error;
  }
}
