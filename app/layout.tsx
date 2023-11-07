import { Analytics } from "@vercel/analytics/react";
import type { Metadata, Viewport } from "next";
import ThemeRegistry from "./ThemeRegistry";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mindmess",
  description: "Collaborate on your notes with ChatGPT",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry options={{ key: "mui" }}>{children}</ThemeRegistry>
        <Analytics />
      </body>
    </html>
  );
}
