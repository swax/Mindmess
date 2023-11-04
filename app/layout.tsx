import type { Metadata } from "next";
import ThemeRegistry from "./ThemeRegistry";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mindmess",
  description: "Collaborate on your notes with ChatGPT",
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
      </body>
    </html>
  );
}
