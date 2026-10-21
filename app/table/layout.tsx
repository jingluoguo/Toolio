import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Toolio | Table Generator",
  description: "Build a clean shareable table and export it as a poster-style PNG.",
};

export default function TableLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
