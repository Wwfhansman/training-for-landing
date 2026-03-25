import type { Metadata } from "next";
import "./globals.css";
import TopNav from "@/components/layout/TopNav";
import SideNav from "@/components/layout/SideNav";

export const metadata: Metadata = {
  title: "吴文凡太有戏 - AI 漫剧工作台",
  description: "面向个人创创作的 AI 漫剧视频全流程工作台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <TopNav />
        <div className="main-layout">
          <SideNav />
          <main className="content-area">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
