import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "NEURAXIS — Explore the Architecture of Intelligence",
    template: "%s · NEURAXIS",
  },
  description:
    "An interactive environment for exploring neural architectures, transformer intelligence, semantic representations, autonomous agents, and machine learning systems.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-bg text-ink">{children}</body>
    </html>
  );
}
