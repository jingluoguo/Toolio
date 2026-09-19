import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Toolio | Focus Timer",
  description: "A quiet timer for a focused stretch of time.",
};

export default function FocusLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
