import Link from "next/link";
import { getArticles } from "@/services/articleService";
import type { ArticleStatus } from "@/lib/types";

export default async function LearnIndexPage() {
  let articles: Awaited<ReturnType<typeof getArticles>> = [];
  try {
    articles = await getArticles("published" as ArticleStatus);
  } catch {
    articles = [];
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Learn</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Read and practice AI-generated English lessons.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-4 dark:bg-zinc-950">
        {articles.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            No published articles yet. Ask an admin to publish one.
          </p>
        ) : (
          <ul className="space-y-3">
            {articles.map((a) => (
              <li
                key={a.id}
                className="flex items-start justify-between gap-3 rounded-lg border p-3"
              >
                <div className="min-w-0">
                  <Link
                    href={`/learn/${a.id}`}
                    className="block truncate font-medium hover:underline"
                  >
                    {a.title}
                  </Link>
                  {a.level ? (
                    <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
                      Level: {a.level}
                    </div>
                  ) : null}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  View →
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

