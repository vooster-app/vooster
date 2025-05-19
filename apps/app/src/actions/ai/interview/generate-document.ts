"use server";

import { createOpenAI } from "@ai-sdk/openai";
import {
  savePage,
  updateInterviewStatus,
  updatePage,
} from "@vooster/supabase/mutations";
import { getInterviewByIdQuery } from "@vooster/supabase/queries";
import { createClient } from "@vooster/supabase/server";
import { InterviewStatus } from "@vooster/supabase/types";
import { streamText } from "ai";
import { createStreamableValue } from "ai/rsc";
import { z } from "zod";
import { generateTitleFromInterview } from "../chat/generate-title";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DocumentSchema = z.object({
  title: z.string().describe("The descriptive title of the document"),
  content: z.string().describe("The markdown contentto be generated"),
});

const InputSchema = z.object({
  interviewId: z.string().uuid(),
});

// Action to generate a markdown document from a completed conversation
export async function generateDocumentAction(
  input: z.infer<typeof InputSchema>,
) {
  const parsedInput = InputSchema.parse(input);
  const supabase = createClient();

  // Get the interview first to get the item_id
  const interview = await getInterviewByIdQuery(
    supabase,
    parsedInput.interviewId,
  );

  if (!interview.data) {
    throw new Error("Interview not found");
  }

  // Get the collection_id from the item or create a new collection
  let collectionId: string | null = null;
  if (interview.data.item_id) {
    const { data: item } = await supabase
      .from("items")
      .select("collection_id")
      .eq("id", interview.data.item_id)
      .single();

    if (item) {
      collectionId = item.collection_id;
    }
  }

  // If no collection_id was found, create a new collection
  if (!collectionId) {
    const { data: collection } = await supabase
      .from("user_collections")
      .insert({
        name: "Generated Documents",
        user_id: interview.data.user_id,
      })
      .select()
      .single();

    if (collection) {
      collectionId = collection.id;
    } else {
      throw new Error("Failed to create collection");
    }
  }

  // Create the page with the collection_id
  const page = await savePage(supabase, {
    id: parsedInput.interviewId,
    title: "",
    content: "",
    collection_id: collectionId,
  });

  console.log("page", page);

  updateInterviewStatus(
    supabase,
    parsedInput.interviewId,
    InterviewStatus.DONE,
  );

  const title = await generateTitleFromInterview(
    interview.data.interview_turns.map((turn) => ({
      question: turn.question_text,
      answer: turn.answer_text ?? "",
    })),
  );

  console.log("title", title);

  const updatedPage = await updatePage(supabase, parsedInput.interviewId, {
    title: title,
    content: "",
  });

  console.log("updatedPage", updatedPage);

  const stream = createStreamableValue("");

  (async () => {
    try {
      const result = streamText({
        model: openai("gpt-4-turbo-preview"),
        system: [
          `You are Vooster, an AI product strategist.
          You are given a user's initial idea or project he wants to build.
          You are also given a conversation between a user and an AI.
          Your task is to generate a full comprehensive document content explaining the user's initial idea or project.
          Make sure to explain the user's initial idea or project in detail.
          The returned document should be in markdown format.
          
          The user initial idea or project he wants to build is:
          ${interview.data?.seed_input}
          The questions and answers are:
          ${interview.data?.interview_turns.map((turn) => `- ${turn.question_text}\n${turn.answer_text}`).join("\n")}
          `,
        ].join(" "),
        prompt: JSON.stringify(
          {
            seedInput: interview.data?.seed_input,
            turns: interview.data?.interview_turns.map((turn) => ({
              question: turn.question_text,
              answer: turn.answer_text,
            })),
          },
          null,
          2,
        ),
      });
      console.log("stream is running");

      for await (const delta of result.textStream) {
        stream.update(delta);
      }

      const finalContent = await result.text;
      stream.done();

      // Update the page with the final content
      const updatedPage = await updatePage(supabase, parsedInput.interviewId, {
        title: title,
        content: finalContent,
      });

      console.log("updatedPage", updatedPage);

      console.log("final content", finalContent);
    } catch (error) {
      console.error("Error generating document:", error);
      stream.error(error);
      throw error;
    }
  })();

  return { output: stream.value };
}
