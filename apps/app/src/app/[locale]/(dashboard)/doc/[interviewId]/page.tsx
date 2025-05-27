import { getUser } from "@vooster/supabase/cached-queries";
import {
  getInterviewByIdQuery,
  getPageByIdQuery,
} from "@vooster/supabase/queries";
import { createClient } from "@vooster/supabase/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DocumentStream } from "./components/DocumentStream";

export const metadata: Metadata = {
  title: "Document | Vooster",
};

interface DocumentPageProps {
  params: {
    interviewId: string;
  };
}

export const runtime = "edge";

export default async function DocumentPage({ params }: DocumentPageProps) {
  const user = await getUser();
  const supabase = createClient();

  if (!user?.data) {
    redirect("/login");
  }

  let page = undefined;
  console.log("params.interviewId", params.interviewId);
  const { data: existingPage } = await getPageByIdQuery(
    supabase,
    params.interviewId,
  );

  if (existingPage) {
    page = existingPage;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <DocumentStream interviewId={params.interviewId} page={page} />
    </main>
  );
}
