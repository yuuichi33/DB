import type { Metadata } from "next";
import { JetBrains_Mono, Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CampusLoop 校园换物",
    template: "%s | CampusLoop",
  },
  description: "面向校园场景的闲置物品流转平台，让每件好物继续被需要。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${manrope.variable} ${spaceGrotesk.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <a href="#main-content" className="skip-link">
          跳到主要内容
        </a>

        <div className="page-shell">
          <SiteNav />
          <main id="main-content" className="mx-auto w-full max-w-6xl px-4 py-8 md:py-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
