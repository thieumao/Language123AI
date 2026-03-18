import Link from "next/link";
import { getArticles } from "@/services/articleService";
import type { ArticleStatus } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export default async function AdminArticlesPage() {
  type ArticleSummary = Awaited<ReturnType<typeof getArticles>>[number];

  let articles: ArticleSummary[] = [];
  try {
    articles = await getArticles();
  } catch {
    articles = [];
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">Admin Articles</h1>
            <Badge className="bg-zinc-50 text-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-200">
              {articles.length} total
            </Badge>
          </div>
          <p className="text-base text-zinc-600 dark:text-zinc-300">
            Create drafts and publish lessons for learners.
          </p>
        </div>
        <Link href="/admin/editor">
          <Button variant="primary">New article</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-1">
            <CardTitle>All articles</CardTitle>
            <CardDescription>
              Drafts stay private. Published articles appear in Learn.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {articles.length === 0 ? (
            <div className="rounded-xl border border-dashed p-6 text-sm text-zinc-600 dark:text-zinc-300">
              No articles yet. Use the editor to generate your first lesson.
            </div>
          ) : (
            <ul className="space-y-3">
              {articles.map((a) => (
                <li
                  key={a.id}
                  className="rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm shadow-zinc-900/5 dark:border-zinc-800/80 dark:bg-zinc-950 dark:shadow-zinc-950/30"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="truncate text-base font-semibold tracking-tight">
                        {a.title}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge>
                          {a.status as ArticleStatus}
                        </Badge>
                        {a.level ? (
                          <Badge className="bg-zinc-50 text-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-200">
                            Level {a.level}
                          </Badge>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {a.status === "published" ? (
                        <Link href={`/learn/${a.id}`}>
                          <Button variant="secondary" size="sm">
                            View
                          </Button>
                        </Link>
                      ) : null}
                      <Link href={`/admin/editor?id=${encodeURIComponent(a.id)}`}>
                        <Button variant="primary" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

