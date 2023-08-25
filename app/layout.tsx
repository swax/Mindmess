import { getInitColorSchemeScript } from "@mui/material";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mindmess",
  description: "Your mind is a mess",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
