import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { createStreamableValue } from "ai/rsc";
import { z } from "zod";

type Props = {
  task: string;
  messages: string;
};

export const generateQuestions = async ({ task, messages }: Props) => {
  const stream = createStreamableValue("");

  const { object } = await generateObject({
    model: openai("gpt-4o"),
    schema: z.object({
      question: z.string(),
      exampleResponse: z.string(),
    }),
    prompt: "Generate a lasagna recipe.",
  });
};
