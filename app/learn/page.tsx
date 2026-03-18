import Link from "next/link";
import { getArticles } from "@/services/articleService";
import type { ArticleStatus } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function LearnIndexPage() {
  let articles: Awaited<ReturnType<typeof getArticles>> = [];
  try {
    articles = await getArticles("published" as ArticleStatus);
  } catch {
    articles = [];
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Learn</h1>
          <Badge>Published</Badge>
        </div>
        <p className="text-base text-zinc-600 dark:text-zinc-300">
          Read short lessons, practice vocabulary, and answer questions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-1">
            <CardTitle>Lessons</CardTitle>
            <CardDescription>
              Click an article to start learning.
            </CardDescription>
          </div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            {articles.length} total
          </div>
        </CardHeader>
        <CardContent>
          {articles.length === 0 ? (
            <div className="rounded-xl border border-dashed p-6 text-sm text-zinc-600 dark:text-zinc-300">
              No published articles yet. Ask an admin to publish one.
            </div>
          ) : (
            <ul className="space-y-3">
              {articles.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/learn/${a.id}`}
                    className="group block rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm shadow-zinc-900/5 transition hover:-translate-y-0.5 hover:bg-zinc-50/60 hover:shadow-md hover:shadow-zinc-900/10 dark:border-zinc-800/80 dark:bg-zinc-950 dark:shadow-zinc-950/30 dark:hover:bg-zinc-900/30"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="truncate text-base font-semibold tracking-tight">
                          {a.title}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {a.level ? (
                            <Badge className="bg-zinc-50 text-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-200">
                              Level {a.level}
                            </Badge>
                          ) : null}
                          <span className="text-sm text-zinc-500 dark:text-zinc-400">
                            Open →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

