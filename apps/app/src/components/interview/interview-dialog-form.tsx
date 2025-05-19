"use client";

import { generateDocumentAction } from "@/actions/ai/interview/generate-document";
import {
  continueInterviewAction,
  startInterviewAction,
} from "@/actions/ai/interview/interview-action";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "@vooster/ui/badge";
import { Button } from "@vooster/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@vooster/ui/dialog";
import { Form, FormField, FormItem } from "@vooster/ui/form";
import { Input } from "@vooster/ui/input";
import { Skeleton } from "@vooster/ui/skeleton";
import { Textarea } from "@vooster/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@vooster/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { Pencil } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import * as z from "zod";

// Form schemas for each step
const seedSchema = z.object({
  step: z.literal("seed"),
  seedInput: z.string().min(1, "Please describe your idea"),
});

const qaSchema = z.object({
  step: z.literal("qa"),
  answer: z.string().min(1, "Please provide an answer"),
});

const formSchema = z.discriminatedUnion("step", [seedSchema, qaSchema]);

type FormData = z.infer<typeof formSchema>;

/**
 * The built in shadcn ui form, with zod validation
 * The form has some steps, first the user will describe their idea
 * The form idea will be validated and submited first, when submited, generateNextQaStep() from app/actions/qa.ts will be called
 * Then the response from the action will be used to generate the next question and example answer
 * The form will then be updated with the new question and example answer
 * The user will then be able to submit the answer to the question
 * The answer will be validated and submited, when submited, generateNextQaStep() from app/actions/qa.ts will be called again
 * This will continue until the done flag until the user clicks a button for finished.
 *
 * When finished, all this data will be used to generate a project plan.
 * Then generateProjectDoc() from app/actions/docs.ts will be called to generate the project document.
 * The moment the document is generated, the /app/[docId]/page.tsx will be shown while the document is being loaded.
 *
 * The UI will be smooth and animated subtley.
 *
 *
 * @returns
 */
const CreateProjectForm = () => {
  const [step, setStep] = useState<"seed" | "qa">("seed");
  const [uiState, setUiState] = useState<
    "seed" | "loadingFirstQa" | "qa" | "loadingNextQa" | "finishing" | "error"
  >("seed");
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [exampleAnswer, setExampleAnswer] = useState<string>("");
  const router = useRouter();

  // Initialize actions with useAction hook
  const startInterview = useAction(startInterviewAction);
  const continueInterview = useAction(continueInterviewAction);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      step: "seed",
      seedInput: "",
    },
  });

  const adjustTextareaHeight = (element: HTMLTextAreaElement) => {
    element.style.height = "auto";
    // Calculate available space considering the example answer
    const availableHeight = window.innerHeight * 0.75;
    const exampleAnswerHeight = 40; // Approximate height for example answer
    const maxHeight = Math.min(
      element.scrollHeight,
      availableHeight - exampleAnswerHeight,
    );
    element.style.height = `${maxHeight}px`;
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    adjustTextareaHeight(e.target);
  };

  const onSubmit = async (data: FormData) => {
    console.log("onSubmit", { step: data.step });
    if (data.step === "seed") {
      try {
        console.log("Starting interview");
        setUiState("loadingFirstQa");
        startInterview.executeAsync({
          seedInput: data.seedInput,
        });
        console.log("Interview started");

        if (startInterview.result.data?.data) {
          const response = startInterview.result.data.data;
          console.log("Interview started", response);
          setInterviewId(response.interviewId);
          setCurrentQuestion(response.question);
          setExampleAnswer(response.answer);

          // If the action fails, we will not update the step
          if (startInterview.result.data?.success) {
            setUiState("qa");
            setStep("qa");
            form.setValue("step", "qa");
            form.setValue("answer", "");
          }
        }
      } catch (error) {
        toast.error("Error loading first question", {
          description: "Please try again",
        });
        console.error("Error:", error);
      }
    } else if (data.step === "qa" && interviewId) {
      try {
        if (!data.answer || data.answer.length < 1) {
          toast.info("Please provide an answer", {
            description: "Please try again",
          });
          return;
        }
        setUiState("loadingNextQa");
        continueInterview.execute({
          interviewId,
          answer: data.answer,
        });

        if (continueInterview.result.data?.data) {
          const response = continueInterview.result.data.data;
          setCurrentQuestion(response.question);
          setExampleAnswer(response.exampleAnswer);
          setUiState("qa");
          form.setValue("answer", "");
        }
      } catch (error) {
        toast.error("Error loading next question", {
          description: "Please try again",
        });
        console.error("Error:", error);
      }
    }
  };

  const handleGenerateDocument = async () => {
    router.push(`/doc/${interviewId}`);
  };

  const FormButton = () => {
    if (step === "seed")
      return (
        <Button type="submit" size="xs" disabled={startInterview.isExecuting}>
          {startInterview.isExecuting ? "Starting..." : "Next"}
        </Button>
      );
    if (step === "qa")
      return (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            size="xs"
            disabled={continueInterview.isExecuting}
            onClick={handleGenerateDocument}
          >
            Generate Document
          </Button>
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Button
                  type="submit"
                  size="xs"
                  disabled={continueInterview.isExecuting}
                >
                  {continueInterview.isExecuting ? "Generating..." : "Continue"}
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="flex flex-row flex-wrap gap-1"
              >
                <Badge variant="secondary" size="xxs">
                  Ctrl
                </Badge>
                <Badge variant="secondary" size="xxs">
                  Enter
                </Badge>
                <p>to continue generating</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
  };

  const LoadingSkeleton = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4 px-4"
    >
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-24 w-full" />
    </motion.div>
  );

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          Project Idea
          <Badge variant="secondary" size="xxs">
            Enter
          </Badge>
        </DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <AnimatePresence mode="wait">
            {uiState === "seed" && (
              <FormField
                control={form.control}
                name="seedInput"
                render={({ field }) => (
                  <FormItem className="px-4">
                    <motion.div
                      key="seed"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Textarea
                          {...field}
                          placeholder="Describe your idea..."
                          className="w-full min-h-[72px] max-h-[calc(75dvh)] overflow-y-auto resize-none"
                          variant="hidden"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && e.ctrlKey) {
                              e.preventDefault();
                              form.handleSubmit(onSubmit)();
                            }
                          }}
                          onInput={handleTextareaInput}
                        />
                        {form.formState.errors.step?.type === "seed" && (
                          <p className="text-sm text-red-500">
                            {
                              (
                                form.formState.errors as {
                                  seedInput?: { message?: string };
                                }
                              ).seedInput?.message
                            }
                          </p>
                        )}
                      </div>
                    </motion.div>
                  </FormItem>
                )}
              />
            )}

            {uiState === "loadingFirstQa" && <LoadingSkeleton />}

            {uiState === "qa" && (
              <FormField
                control={form.control}
                name="answer"
                render={({ field }) => (
                  <FormItem className="px-4">
                    <motion.div
                      key="qa"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-4"
                    >
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <label className="text-sm font-semibold border-l-2 pl-2 h-fit">
                            {currentQuestion}
                          </label>
                        </div>
                        <Textarea
                          {...field}
                          placeholder={exampleAnswer}
                          className="w-full min-h-[72px] max-h-[calc(75dvh-40px)] overflow-y-auto resize-none"
                          variant="hidden"
                          onKeyDown={(e) => {
                            if (e.key === "Tab" && !e.currentTarget.value) {
                              e.preventDefault();
                              form.setValue("answer", exampleAnswer);
                            }
                            if (e.key === "Enter" && e.ctrlKey) {
                              e.preventDefault();
                              form.handleSubmit(onSubmit)();
                            }
                          }}
                          onInput={handleTextareaInput}
                        />
                        {form.formState.errors.step?.type === "qa" && (
                          <p className="text-sm text-red-500">
                            {
                              (
                                form.formState.errors as {
                                  answer?: { message?: string };
                                }
                              ).answer?.message
                            }
                          </p>
                        )}
                      </div>
                    </motion.div>
                  </FormItem>
                )}
              />
            )}

            {uiState === "loadingNextQa" && <LoadingSkeleton />}
          </AnimatePresence>
          <DialogFooter className="justify-end">
            <FormButton />
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default CreateProjectForm;

export function DialogForm() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="size-8 shrink-0" variant="secondary" size="icon">
          <Pencil />
        </Button>
      </DialogTrigger>

      <CreateProjectForm />
    </Dialog>
  );
}
/*
useAction arguments

    safeActionFn: the safe action that will be called via execute or executeAsync functions.
    utils?: object with optional base utils and callbacks.

useAction return object

    execute: an action caller with no return. Input is the same as the safe action you passed to the hook.
    executeAsync: an action caller that returns a promise with the return value of the safe action. Input is the same as the safe action you passed to the hook.
    input: the input passed to the execute or executeAsync function.
    result: result of the action after its execution.
    reset: programmatically reset execution state (input, status and result).
    status: string that represents the current action status.
    isIdle: true if the action status is idle.
    isTransitioning: true if the transition status from the useTransition hook used under the hood is true.
    isExecuting: true if the action status is executing.
    isPending: true if the action status is executing or isTransitioning.
    hasSucceeded: true if the action status is hasSucceeded.
    hasErrored: true if the action status is hasErrored.

For checking the action status, the recommended way is to use the isPending shorthand property. Using isExecuting or checking if status is "executing" could cause race conditions when using navigation functions, such as redirect.
*/
