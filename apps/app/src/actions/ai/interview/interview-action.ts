"use server";

import { authActionClient } from "@/actions/safe-action";
import { createOpenAI } from "@ai-sdk/openai";
import { getUser } from "@vooster/supabase/cached-queries";
import {
  createInterview,
  createInterviewTurn,
  updateInterviewStatus,
} from "@vooster/supabase/mutations";
import {
  getInterviewByIdQuery,
  getInterviewTurnsByInterviewQuery,
} from "@vooster/supabase/queries";
import { generateObject } from "ai";
import { z } from "zod";

console.log("Initializing interview-action.ts");

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const InterviewStepSchema = z.object({
  nextQuestion: z.string(),
  exampleAnswer: z.string(),
  done: z.boolean(),
});

const SeedInterviewStepSchema = z.object({
  question: z.string().describe("The question to ask the user"),
  answer: z.string().describe("The example answer to the question"),
});

/**
 * Action to start a new interview
 *
 * This action is used to start a new interview by creating a new interview record
 * and generating the first question and example answer.
 *
 * @param parsedInput - The input for the action
 * @param ctx - The context of the action
 * @returns The result of the action
 */
export const startInterviewAction = authActionClient
  .schema(
    z.object({
      seedInput: z.string(),
    }),
  )
  .metadata({
    name: "start-new-interview",
  })
  .action(async ({ parsedInput, ctx: { user, supabase } }) => {
    console.log("Starting new interview", { seedInput: parsedInput.seedInput });
    console.log("User", { user });
    try {
      // Create a new interview
      const interview = await createInterview(supabase, {
        seed_input: parsedInput.seedInput,
        user_id: user.id,
      });

      console.log("Interview created", { interviewId: interview.data?.id });

      if (!interview.data?.id) {
        throw new Error("Failed to create interview");
      }

      // Generate the first question and example answer
      console.log("Generating first question and example answer");
      const { object } = await generateObject({
        model: openai("gpt-4"),
        schema: SeedInterviewStepSchema,
        system: [
          `You are Vooster, an AI product strategist.
          Based on the user's input, generate a relevant question to help clarify their needs.
          Provide an example answer that demonstrates the level of detail expected.
          Set done to false as this is just the first question.`,
        ].join(" "),
        prompt: parsedInput.seedInput,
      });

      console.log("First question generated", {
        question: object.question,
        answer: object.answer,
      });

      // Create the first turn
      const turn = await createInterviewTurn(supabase, {
        interview_id: interview.data?.id,
        turn_no: 1,
        question_text: object.question,
        example_answer_text: object.answer,
      });

      console.log("First turn created", { turnId: turn.data?.id });

      return {
        success: true,
        data: {
          interviewId: interview.data?.id,
          turnId: turn.data?.id,
          question: object.question,
          answer: object.answer,
        },
      };
    } catch (error) {
      console.error("Error starting interview:", error);
      return { success: false, error: "Failed to start interview" };
    }
  });

const ContinueInterviewSchema = z.object({
  interviewId: z.string(),
  answer: z.string(),
});

/**
 * Action to continue an interview
 *
 * This action is used to continue an interview by generating the next question
 * based on the conversation history and the user's answer.
 *
 * @param parsedInput - The input for the action
 * @param ctx - The context of the action
 * @returns The result of the action
 */
export const continueInterviewAction = authActionClient
  .schema(ContinueInterviewSchema)
  .metadata({
    name: "continue-interview",
  })
  .action(async ({ parsedInput, ctx: { user, supabase } }) => {
    console.log("Continuing interview", {
      interviewId: parsedInput.interviewId,
    });
    try {
      // Get the current conversation state
      const conversation = await getInterviewTurnsByInterviewQuery(
        supabase,
        parsedInput.interviewId,
      );
      console.log("Retrieved conversation turns", {
        count: conversation.data,
      });
      if (!conversation.data || conversation.count === 0) {
        throw new Error("Interview not found");
      }

      const interview = await getInterviewByIdQuery(
        supabase,
        parsedInput.interviewId,
      );
      console.log("Retrieved interview", { interviewId: interview.data?.id });
      // Save the user's answer to the last turn
      const lastTurn = conversation.data?.[conversation.data.length - 1];

      if (!lastTurn) {
        throw new Error("Interview not found");
      }

      // Save the user's answer to the last turn
      await supabase
        .from("interview_turns")
        .update({
          answer_text: parsedInput.answer,
          answered_at: new Date().toISOString(),
          answer_version: (lastTurn.answer_version || 0) + 1,
        })
        .eq("id", lastTurn.id);

      // Generate the next question
      console.log("Generating next question");
      const { object } = await generateObject({
        model: openai("gpt-4"),
        schema: InterviewStepSchema,
        system: [
          "You are Vooster, an AI product strategist.",
          "Based on the conversation history, generate the next relevant question.",
          "Provide an example answer that demonstrates the level of detail expected.",
          "Set done to true if you believe we have gathered enough information.",
        ].join(" "),
        prompt: JSON.stringify({
          seedInput: interview.data?.seed_input,
          history: conversation.data?.map((turn) => ({
            question: turn.question_text,
            answer: turn.answer_text,
          })),
        }),
      });

      console.log("Next question generated", {
        question: object.nextQuestion,
        answer: object.exampleAnswer,
        done: object.done,
      });

      if (object.done) {
        // Mark the interview as done
        console.log("Interview completed, updating status");
        await updateInterviewStatus(
          supabase,
          parsedInput.interviewId,
          "DONE",
          new Date(),
        );
      } else {
        // Create the next turn
        console.log("Creating next turn");
        await createInterviewTurn(supabase, {
          interview_id: parsedInput.interviewId,
          turn_no: conversation.data?.length + 1,
          question_text: object.nextQuestion,
          example_answer_text: object.exampleAnswer,
        });
      }

      return {
        success: true,
        data: {
          question: object.nextQuestion,
          exampleAnswer: object.exampleAnswer,
          done: object.done,
        },
      };
    } catch (error) {
      console.error("Error continuing conversation:", error);
      return { success: false, error: "Failed to continue conversation" };
    }
  });
