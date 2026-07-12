import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ConceptKit — AI Creative Director",
  description:
    "Turn one prompt into a complete creative system: palette, typography, brand voice, and a cinematic hero image. Built for the IBM AI Builders Challenge.",
  openGraph: {
    title: "ConceptKit — AI Creative Director",
    description: "One prompt. A complete creative direction.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
