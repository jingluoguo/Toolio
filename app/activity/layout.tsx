import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Toolio | Activity Editor",
  description: "A flexible editor for activity poster content and page exports.",
};

export default function ActivityLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
