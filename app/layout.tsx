import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/providers/ConvexClientProvider";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "LabourIn",
  description:
    "LabourIn connects customers with verified, available service providers.",
  icons: {
    icon: "/convex.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        fontSans.variable,
        fontSerif.variable,
        fontMono.variable,
        "font-sans"
      )}
    >
      <body className="antialiased">
        <ConvexClientProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </ConvexClientProvider>
        <Toaster />
      </body>
    </html>
  );
}

