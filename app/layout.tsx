import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Badge } from "@/components/ui/Badge";

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
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-dvh antialiased`}
      >
        <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-white via-zinc-50 to-zinc-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-black" />
        <header className="sticky top-0 z-20 border-b border-zinc-200/70 bg-white/75 backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-950/50">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/learn" className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl border border-zinc-200 bg-white text-sm font-semibold shadow-sm shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-zinc-950/30">
                L
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold tracking-tight">Language123</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  English learning
                </div>
              </div>
            </Link>

            <nav className="flex items-center gap-1">
              <Link
                href="/learn"
                className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                Learn
              </Link>
              <Link
                href="/admin/articles"
                className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                Admin
              </Link>
              <div className="pl-2">
                <Badge className="border-zinc-200/70 bg-white/80 text-zinc-700 dark:border-zinc-800/70 dark:bg-zinc-950/60 dark:text-zinc-200">
                  MVP
                </Badge>
              </div>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>

        <footer className="border-t border-zinc-200/70 py-10 text-center text-sm text-zinc-500 dark:border-zinc-800/70 dark:text-zinc-400">
          <div className="mx-auto max-w-4xl px-4">
            Built with Next.js + Prisma. AI is mocked for MVP.
          </div>
        </footer>
      </body>
    </html>
  );
}
