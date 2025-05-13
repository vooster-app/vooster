import type { Client, Json, TablesUpdate } from "../types";

export async function updateUser(
  supabase: Client,
  userId: string,
  data: TablesUpdate<"users">,
) {
  return supabase.from("users").update(data).eq("id", userId);
}

type CreateChatData = {
  user_id: string;
  title: string;
};

export async function saveChat(supabase: Client, data: CreateChatData) {
  return supabase.from("chats").insert(data).select().single();
}

export async function deleteChatByUser(supabase: Client, userId: string) {
  return supabase.from("chats").delete().eq("user_id", userId);
}

type Message = {
  chat_id: string;
  content: Json;
  id: string;
  role: string;
  created_at: string;
};

export async function saveMessages(supabase: Client, messages: Message[]) {
  return supabase.from("messages").insert(messages);
}

export async function getMessagesByChatId(supabase: Client, chatId: string) {
  return supabase.from("messages").select("*").eq("chat_id", chatId);
}

type SaveCollectionData = {
  user_id: string;
  name: string;
};

export async function createUserCollection(
  supabase: Client,
  data: SaveCollectionData,
) {
  return supabase.from("user_collections").insert(data).select().single();
}

export async function deleteCollectionByUser(supabase: Client, userId: string) {
  return supabase.from("user_collections").delete().eq("user_id", userId);
}

type SavePageData = {
  content: string;
};

export async function savePage(supabase: Client, data: SavePageData) {
  return supabase.from("pages").insert(data);
}

interface SaveFolderData {
  name: string;
  collection_id: string;
  parent_item_id?: string;
}

export async function saveFolder(supabase: Client, data: SaveFolderData) {
  return supabase
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
}

export async function updateFolderName(
  supabase: Client,
  folderId: string,
  name: string,
) {
  return supabase.from("items").update({ name }).eq("id", folderId);
}

export async function deleteFolderById(supabase: Client, folderId: string) {
  return supabase.from("items").delete().eq("id", folderId);
}

interface CreateInterviewData {
  user_id: string;
  item_id?: string;
  seed_input: string;
  model_used?: string;
  metadata?: Json;
}

export async function createInterview(
  supabase: Client,
  data: CreateInterviewData,
) {
  return supabase
    .from("interviews")
    .insert({
      ...data,
      status: "IN_PROGRESS",
    })
    .select()
    .single();
}

export async function updateInterviewStatus(
  supabase: Client,
  interviewId: string,
  status: "IN_PROGRESS" | "DONE" | "ABORTED",
  finishedAt?: Date,
) {
  return supabase
    .from("interviews")
    .update({
      status,
      finished_at: finishedAt?.toISOString(),
    })
    .eq("id", interviewId);
}

export async function updateInterviewMetadata(
  supabase: Client,
  interviewId: string,
  metadata: Json,
) {
  return supabase
    .from("interviews")
    .update({ metadata })
    .eq("id", interviewId);
}

interface CreateInterviewTurnData {
  interview_id: string;
  turn_no: number;
  question_text: string;
  example_answer_text?: string;
}

export async function createInterviewTurn(
  supabase: Client,
  data: CreateInterviewTurnData,
) {
  return supabase
    .from("interview_turns")
    .insert(data)
    .select()
    .single();
}

interface CreateInterviewAnswerData {
  turn_id: string;
  answer_text: string;
}

export async function createInterviewAnswer(
  supabase: Client,
  data: CreateInterviewAnswerData,
) {
  return supabase
    .from("interview_answers")
    .insert({
      ...data,
      version: 1,
    })
    .select()
    .single();
}

export async function updateInterviewAnswer(
  supabase: Client,
  turnId: string,
  answerText: string,
) {
  // First, get the current answers to find max version
  const { data: answers } = await supabase
    .from("interview_answers")
    .select("version")
    .eq("turn_id", turnId);

  const maxVersion = answers?.length ? Math.max(...answers.map(a => a.version)) : 0;

  // Then create new answer with incremented version
  return supabase
    .from("interview_answers")
    .insert({
      turn_id: turnId,
      answer_text: answerText,
      version: maxVersion + 1,
    })
    .select()
    .single();
}
