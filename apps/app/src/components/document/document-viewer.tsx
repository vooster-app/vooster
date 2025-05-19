"use client";

import type { Database } from "@vooster/supabase/types";
import { Card } from "@vooster/ui/card";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { Markdown } from "../markdown/markdown-editor";

interface DocumentViewerProps {
  document: Database["public"]["Tables"]["pages"]["Row"];
}

function ErrorFallback() {
  return (
    <div className="p-4 text-red-500">
      Error rendering document content. Please try refreshing the page.
    </div>
  );
}

export function DocumentViewer({ document }: DocumentViewerProps) {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-6 mx-auto max-w-3xl">
        {document.title || "Untitled Document"}
      </h1>
      <ErrorBoundary errorComponent={ErrorFallback}>
        <div className="prose dark:prose-invert max-w-3xl mx-auto">
          <Markdown>{document.content || ""}</Markdown>
        </div>
      </ErrorBoundary>
    </div>
  );
}
