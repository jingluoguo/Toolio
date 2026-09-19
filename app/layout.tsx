import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Toolio | Tools",
  description: "A small collection of thoughtful everyday tools.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
