"use client";

import { generateDocumentAction } from "@/actions/ai/interview/generate-document";
import { DocumentViewer } from "@/components/document/document-viewer";
import type { Database } from "@vooster/supabase/types";
import { Skeleton } from "@vooster/ui/skeleton";
import { readStreamableValue } from "ai/rsc";
import { Suspense } from "react";

type Page = Database["public"]["Tables"]["pages"]["Row"];

export async function DocumentStream({
  interviewId,
  page,
}: {
  interviewId: string;
  page?: Page;
}) {
  let content = "";
  let title = "";
  console.log("page", page);
  if (page) {
    // Use existing document
    content = page.content || "";
    title = page.title || "";
  } else {
    // Generate new document
    const { output } = await generateDocumentAction({
      interviewId,
    });

    for await (const delta of readStreamableValue(output)) {
      content += delta;
    }
  }

  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      }
    >
      <DocumentViewer
        document={{
          id: page?.id || crypto.randomUUID(),
          title,
          content,
          collection_id: page?.collection_id || null,
          created_at: page?.created_at || new Date().toISOString(),
          item_id: page?.item_id || null,
          updated_at: page?.updated_at || new Date().toISOString(),
        }}
      />
    </Suspense>
  );
}
