import "./globals.css";
import "@vooster/ui/globals.css";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Provider as AnalyticsProvider } from "@vooster/analytics/client";
import { cn } from "@vooster/ui/cn";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";

const metadataBase = new URL("https://www.vooster.app");

export const metadata: Metadata = {
  metadataBase: metadataBase,
  title: "Create vooster",
  description:
    "A pawefull LLM prompting tool. Create knowledge bases for contextualized prompting.",
  alternates: {
    canonical: metadataBase,
    languages: {
      "en-US": metadataBase,
    },
  },
  robots: "index, follow",
  openGraph: {
    title: "Vooster | Empower your strategies with knowledge",
    description:
      "A pawefull LLM prompting tool. Create knowledge bases for contextualized prompting.",
    url: metadataBase,
    siteName:
      "A pawefull LLM prompting tool. Create knowledge bases for contextualized prompting.",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://www.vooster.app/opengraph-image.png",
        width: 800,
        height: 600,
      },
      {
        url: "https://www.vooster.app/opengraph-image.png",
        width: 1800,
        height: 1600,
      },
    ],
  },
  twitter: {
    title: "Vooster | Empower your strategies with knowledge",
    description:
      "A pawefull LLM prompting tool. Create knowledge bases for contextualized prompting.",
    images: [
      {
        url: "https://www.vooster.app/twitter-image.png",
        width: 800,
        height: 600,
      },
      {
        url: "https://www.vooster.app/twitter-image.png",
        width: 1800,
        height: 1600,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          `${GeistSans.variable} ${GeistMono.variable}`,
          "antialiased dark font-sans",
        )}
      >
        <Header />
        {children}
        <AnalyticsProvider />
      </body>
    </html>
  );
}
