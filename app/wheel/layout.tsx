import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Toolio | The Wheel",
  description: "A refined decision wheel for your next move.",
};

export default function WheelLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
