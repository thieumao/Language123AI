import Link from "next/link";
import { getArticles } from "@/services/articleService";
import type { ArticleStatus } from "@/lib/types";

export default async function AdminArticlesPage() {
  type ArticleSummary = Awaited<ReturnType<typeof getArticles>>[number];

  let articles: ArticleSummary[] = [];
  try {
    articles = await getArticles();
  } catch {
    articles = [];
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Admin Articles</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Create drafts and publish English learning lessons.
          </p>
        </div>
        <Link
          href="/admin/editor"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          New Article
        </Link>
      </div>

      <div className="rounded-xl border bg-white p-4 dark:bg-zinc-950">
        {articles.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            No articles yet. Use the editor to generate your first lesson.
          </p>
        ) : (
          <ul className="divide-y">
            {articles.map((a) => (
              <li
                key={a.id}
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium">{a.title}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                    <span>
                      Status:{" "}
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {a.status as ArticleStatus}
                      </span>
                    </span>
                    {a.level ? <span>Level: {a.level}</span> : null}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {a.status === "published" ? (
                    <Link
                      href={`/learn/${a.id}`}
                      className="text-sm text-zinc-700 hover:underline dark:text-zinc-200"
                    >
                      View
                    </Link>
                  ) : null}
                  <Link
                    href={`/admin/editor?id=${encodeURIComponent(a.id)}`}
                    className="text-sm text-zinc-700 hover:underline dark:text-zinc-200"
                  >
                    Edit →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

