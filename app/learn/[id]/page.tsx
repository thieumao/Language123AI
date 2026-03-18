import LearnQuestionBlock from "./LearnQuestion";
import { getArticleById } from "@/services/articleService";
import type { ArticleContent } from "@/lib/types";

export default async function LearnDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let article:
    | Awaited<ReturnType<typeof getArticleById>>
    | null = null;
  try {
    article = await getArticleById(params.id);
  } catch {
    article = null;
  }

  if (!article) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold">Lesson not found</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          The article id may be invalid or not published.
        </p>
      </div>
    );
  }

  if (article.status !== "published") {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold">Lesson not found</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          This article is not published yet.
        </p>
      </div>
    );
  }

  const content = article.content as ArticleContent;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{article.title}</h1>
        {article.level ? (
          <div className="text-sm text-zinc-600 dark:text-zinc-300">
            Level: {article.level}
          </div>
        ) : null}
      </div>

      <section className="space-y-2 rounded-xl border bg-white p-4 dark:bg-zinc-950">
        <h2 className="text-lg font-semibold">Reading</h2>
        <p className="text-sm leading-7 text-zinc-700 dark:text-zinc-200">
          {content.reading}
        </p>
      </section>

      <section className="space-y-3 rounded-xl border bg-white p-4 dark:bg-zinc-950">
        <h2 className="text-lg font-semibold">Vocabulary</h2>
        <div className="space-y-2">
          {content.vocabulary.map((v, idx) => (
            <div key={idx} className="rounded-lg border p-3">
              <div className="flex flex-wrap items-baseline gap-2">
                <div className="font-semibold">{v.word}</div>
                {v.ipa ? (
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {v.ipa}
                  </div>
                ) : null}
              </div>
              <div className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
                {v.meaning}
              </div>
              {v.example ? (
                <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                  Example: {v.example}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border bg-white p-4 dark:bg-zinc-950">
        <LearnQuestionBlock question={content.question} />
      </section>

      <section className="space-y-3 rounded-xl border bg-white p-4 dark:bg-zinc-950">
        <h2 className="text-lg font-semibold">Discussion</h2>
        <ul className="space-y-2">
          {content.discussion.map((d, idx) => (
            <li key={idx} className="text-sm text-zinc-700 dark:text-zinc-200">
              {d}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3 rounded-xl border bg-white p-4 dark:bg-zinc-950">
        <h2 className="text-lg font-semibold">Further Discussion</h2>
        <ul className="space-y-2">
          {content.furtherDiscussion.map((d, idx) => (
            <li key={idx} className="text-sm text-zinc-700 dark:text-zinc-200">
              {d}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

