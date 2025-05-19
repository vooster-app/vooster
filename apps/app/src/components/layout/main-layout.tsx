import { AppSidebar } from "@/components/layout/sidebar/app-sidebar";
import { cn } from "@vooster/ui/cn";
import { SidebarProvider } from "@vooster/ui/sidebar";
import QueryClientContextProvider from "./query-client-provider";

interface MainLayoutProps {
  children: React.ReactNode;
  header: React.ReactNode;
  headersNumber?: 1 | 2;
}

export default function MainLayout({
  children,
  header,
  headersNumber = 2,
}: MainLayoutProps) {
  const height = {
    1: "h-[calc(100svh-40px)] lg:h-[calc(100svh-56px)]",
    2: "h-[calc(100svh-80px)] lg:h-[calc(100svh-96px)]",
  };
  return (
    <QueryClientContextProvider>
      <SidebarProvider>
        <AppSidebar />
        <div className="h-svh overflow-hidden lg:p-2 w-full">
          <div className="lg:border lg:rounded-md overflow-hidden flex flex-col items-center justify-start h-full w-full">
            {header}
            <div
              className={cn(
                "overflow-auto w-full",
                height[headersNumber as keyof typeof height],
              )}
            >
              {children}
            </div>
          </div>
        </div>
      </SidebarProvider>
    </QueryClientContextProvider>
  );
}
