import type * as React from "react";

import { DialogForm } from "@/components/interview/interview-dialog-form";
import { SignOut } from "@/components/sign-out";
import { getSession } from "@vooster/supabase/cached-queries";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@vooster/ui/sidebar";
import { OrgSwitcher } from "./org-switcher";
import { SidebarNav } from "./sidebar-nav";

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const result = await getSession();

  // TODO: Return different data if the user is not logged in
  if (!result.data.session) {
    return null;
  }

  console.log("result.data.session", result.data.session);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <OrgSwitcher />
        <DialogForm />
      </SidebarHeader>
      <SidebarContent>
        <SidebarNav session={result.data.session} />
      </SidebarContent>
      <SidebarFooter className="flex flex-col gap-2">
        <SignOut className="w-full" />
      </SidebarFooter>
    </Sidebar>
  );
}
