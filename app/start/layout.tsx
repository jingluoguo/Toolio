import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Toolio | First Step",
  description: "Turn a fuzzy intention into a small next step.",
};

export default function StartLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
