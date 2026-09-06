import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Toolio | The Wheel",
  description: "A refined decision wheel for your next move.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
