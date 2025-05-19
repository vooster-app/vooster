import Header from "@/components/layout/header/header";
import MainLayout from "@/components/layout/main-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  // This is where your authenticated app lives, add a sidebar, header etc.
  return <MainLayout header={<Header />}>{children}</MainLayout>;
}
