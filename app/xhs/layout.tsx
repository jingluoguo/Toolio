import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "汉方药妆 | 一键分享到小红书",
  description: "扫码进入，随机获得一篇小红书文案，一键复制并跳转发布。",
};

export default function XhsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
