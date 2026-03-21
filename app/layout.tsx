import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Immigram | AI-Powered Immigration Navigator",
    template: "%s | Immigram",
  },
  description:
    "Navigate your immigration journey with AI-powered visa eligibility assessment, document analysis, case tracking, and expert guidance across 10+ countries.",
  keywords: [
    "immigration",
    "visa",
    "AI immigration",
    "visa eligibility",
    "immigration platform",
    "visa assessment",
    "document analysis",
    "immigration consultant",
    "work visa",
    "study visa",
  ],
  authors: [{ name: "Immigram" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Immigram",
    title: "Immigram | AI-Powered Immigration Navigator",
    description:
      "Navigate your immigration journey with AI-powered visa assessment, document analysis, and expert guidance.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Immigram | AI-Powered Immigration Navigator",
    description:
      "Navigate your immigration journey with AI-powered visa assessment, document analysis, and expert guidance.",
  },
  robots: {
    index: true,
    follow: true,
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              background: "rgba(15, 23, 42, 0.9)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "#f0f4f8",
              backdropFilter: "blur(24px)",
            },
          }}
        />
      </body>
    </html>
  );
}
