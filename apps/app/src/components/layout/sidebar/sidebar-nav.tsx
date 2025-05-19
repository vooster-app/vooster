"use client";

import type { User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@vooster/supabase/client";
import { getSidebarDataQuery } from "@vooster/supabase/queries";
import { cn } from "@vooster/ui/cn";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@vooster/ui/sidebar";
import { Skeleton } from "@vooster/ui/skeleton";
import { ChevronRight, FileIcon, FolderIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface SidebarNavProps {
  className?: string;
  session: { user: User | null } | null;
}

export function SidebarNav({ className, session }: SidebarNavProps) {
  const pathname = usePathname();
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(
    new Set(),
  );

  const { data: sidebarData, isLoading } = useQuery({
    queryKey: ["sidebar-data"],
    queryFn: async () => {
      const supabase = createClient();
      const result = await getSidebarDataQuery(
        supabase,
        session?.user?.id ?? "",
      );
      return result.data;
    },
    enabled: !!session?.user?.id,
  });

  if (isLoading) {
    return <SidebarNavSkeleton />;
  }

  if (!sidebarData?.length) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        No collections found. Create your first collection to get started.
      </div>
    );
  }

  return (
    <SidebarMenu className={cn("space-y-1", className)}>
      {sidebarData.map((collection) => {
        const isExpanded = expandedCollections.has(collection.id);
        const items = collection.items.filter((item) => !item.parent_item_id);

        return (
          <SidebarMenuItem key={collection.id}>
            <SidebarMenuButton
              onClick={() => {
                setExpandedCollections((prev) => {
                  const next = new Set(prev);
                  if (next.has(collection.id)) {
                    next.delete(collection.id);
                  } else {
                    next.add(collection.id);
                  }
                  return next;
                });
              }}
              tooltip={collection.name}
            >
              <FolderIcon className="h-4 w-4" />
              <span>{collection.name}</span>
              <ChevronRight
                className={cn("ml-auto h-4 w-4 transition-transform", {
                  "rotate-90": isExpanded,
                })}
              />
            </SidebarMenuButton>

            {isExpanded && (
              <SidebarMenuSub>
                {items.map((item) => (
                  <SidebarMenuSubItem key={item.id}>
                    <SidebarMenuSubButton
                      href={`/collections/${collection.id}/items/${item.id}`}
                      isActive={
                        pathname ===
                        `/collections/${collection.id}/items/${item.id}`
                      }
                    >
                      {item.type === "folder" ? (
                        <FolderIcon className="h-4 w-4" />
                      ) : (
                        <FileIcon className="h-4 w-4" />
                      )}
                      <span>{item.name}</span>
                    </SidebarMenuSubButton>

                    {item.pages?.map((page) => (
                      <SidebarMenuSubButton
                        key={page.id}
                        href={`/collections/${collection.id}/items/${item.id}/pages/${page.id}`}
                        isActive={
                          pathname ===
                          `/collections/${collection.id}/items/${item.id}/pages/${page.id}`
                        }
                        size="sm"
                      >
                        <FileIcon className="h-4 w-4" />
                        <span>{page.title ?? "Untitled"}</span>
                      </SidebarMenuSubButton>
                    ))}
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

function SidebarNavSkeleton() {
  const skeletonIds = Array.from({ length: 3 }, (_, i) => `skeleton-${i}`);
  const itemIds = Array.from({ length: 2 }, (_, i) => `item-${i}`);

  return (
    <div className="space-y-4 p-4">
      {skeletonIds.map((id) => (
        <div key={id} className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <div className="ml-4 space-y-2">
            {itemIds.map((itemId) => (
              <Skeleton key={`${id}-${itemId}`} className="h-6 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
