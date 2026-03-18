import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Language123",
  description: "AI-powered English learning (MVP)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur dark:bg-black/40">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/learn" className="text-sm font-semibold">
              Language123
            </Link>
            <nav className="flex items-center gap-3">
              <Link
                href="/learn"
                className="text-sm text-zinc-700 hover:underline dark:text-zinc-200"
              >
                Learn
              </Link>
              <Link
                href="/admin/articles"
                className="text-sm text-zinc-700 hover:underline dark:text-zinc-200"
              >
                Admin
              </Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
