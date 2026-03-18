"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  ArticleContent,
  ArticleStatus,
  MultipleChoiceAnswer,
  Question,
  SectionKey,
  VocabularyItem,
} from "@/lib/types";

function emptyQuestion(): Question {
  return { prompt: "", answers: [] };
}

export default function AdminEditorPage() {
  const [sourceText, setSourceText] = useState("");

  const [articleId, setArticleId] = useState<string | null>(null);
  const [initialId, setInitialId] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  const [status, setStatus] = useState<ArticleStatus>("draft");

  const [title, setTitle] = useState("");
  const [reading, setReading] = useState("");
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [question, setQuestion] = useState<Question>(emptyQuestion());
  const [discussion, setDiscussion] = useState<string[]>([]);
  const [furtherDiscussion, setFurtherDiscussion] = useState<string[]>([]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [sectionLoading, setSectionLoading] = useState<SectionKey | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const draftContent: ArticleContent = useMemo(
    () => ({
      reading,
      vocabulary,
      question,
      discussion,
      furtherDiscussion,
    }),
    [reading, vocabulary, question, discussion, furtherDiscussion],
  );

  const canGenerate = sourceText.trim().length > 0 && !isGenerating;

  const sectionValue = (section: SectionKey): unknown => {
    switch (section) {
      case "title":
        return title;
      case "reading":
        return reading;
      case "vocabulary":
        return vocabulary;
      case "question":
        return question;
      case "discussion":
        return discussion;
      case "furtherDiscussion":
        return furtherDiscussion;
    }
  };

  const applySectionValue = (section: SectionKey, value: unknown) => {
    switch (section) {
      case "title":
        setTitle(typeof value === "string" ? value : title);
        return;
      case "reading":
        setReading(typeof value === "string" ? value : reading);
        return;
      case "vocabulary":
        setVocabulary(Array.isArray(value) ? (value as VocabularyItem[]) : vocabulary);
        return;
      case "question":
        setQuestion(value && typeof value === "object" ? (value as Question) : question);
        return;
      case "discussion":
        setDiscussion(Array.isArray(value) ? (value as string[]) : discussion);
        return;
      case "furtherDiscussion":
        setFurtherDiscussion(Array.isArray(value) ? (value as string[]) : furtherDiscussion);
        return;
    }
  };

  const callImprove = async (section: SectionKey, operation: "improve" | "regenerate") => {
    if (!sourceText.trim()) return;
    setSectionLoading(section);
    setMessage(null);
    try {
      const res = await fetch("/api/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceText,
          section,
          operation,
          current: sectionValue(section),
        }),
      });

      if (!res.ok) throw new Error("Failed to improve section");
      const data = (await res.json()) as { value: unknown };
      applySectionValue(section, data.value);
    } catch {
      setMessage("AI request failed. Please try again.");
    } finally {
      setSectionLoading(null);
    }
  };

  const onGenerate = async () => {
    if (!canGenerate) return;
    setIsGenerating(true);
    setMessage(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceText }),
      });

      if (!res.ok) throw new Error("Failed to generate");
      const data = (await res.json()) as {
        draft: { title: string; content: ArticleContent; level: string };
        level: string;
      };

      setArticleId(null);
      setTitle(data.draft.title);
      setReading(data.draft.content.reading);
      setVocabulary(data.draft.content.vocabulary);
      setQuestion(data.draft.content.question);
      setDiscussion(data.draft.content.discussion);
      setFurtherDiscussion(data.draft.content.furtherDiscussion);
      setLevel(data.level);
      setStatus("draft");
    } catch {
      setMessage("AI generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    // Avoid Next.js `useSearchParams()` Suspense requirements by parsing
    // the querystring client-side only (MVP-friendly).
    const id = new URLSearchParams(window.location.search).get("id");
    setInitialId(id);
  }, []);

  useEffect(() => {
    if (!initialId) return;

    (async () => {
      setMessage(null);
      try {
        const res = await fetch(`/api/articles/${encodeURIComponent(initialId)}`);
        if (!res.ok) throw new Error("Failed to load article");
        const data = (await res.json()) as {
          article: {
            id: string;
            title?: string;
            content: ArticleContent;
            level?: string | null;
            status?: ArticleStatus;
          };
        };
        setArticleId(data.article.id);
        setTitle(data.article.title ?? "");
        const content = data.article.content;
        setReading(content.reading ?? "");
        setVocabulary(content.vocabulary ?? []);
        setQuestion(content.question ?? emptyQuestion());
        setDiscussion(content.discussion ?? []);
        setFurtherDiscussion(content.furtherDiscussion ?? []);
        setLevel(data.article.level ?? null);
        setStatus(data.article.status ?? "draft");
      } catch {
        setMessage("Could not load article for editing.");
      }
    })();
  }, [initialId]);

  const onSave = async (nextStatus: ArticleStatus) => {
    setSaveLoading(true);
    setMessage(null);
    try {
      const payload = {
        title,
        content: draftContent,
        level,
        status: nextStatus,
      };

      if (articleId) {
        const res = await fetch(`/api/articles/${encodeURIComponent(articleId)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Failed to update article");
        const data = (await res.json()) as {
          article: {
            status?: ArticleStatus;
          };
        };
        setStatus(data.article.status ?? nextStatus);
        setMessage(nextStatus === "published" ? "Published." : "Draft saved.");
      } else {
        const res = await fetch("/api/articles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Failed to create article");
        const data = (await res.json()) as {
          article: {
            id: string;
            status?: ArticleStatus;
          };
        };
        setArticleId(data.article.id);
        setStatus(data.article.status ?? nextStatus);
        setMessage(nextStatus === "published" ? "Published." : "Draft saved.");
      }
    } catch {
      setMessage("Save failed. Ensure your database is configured.");
    } finally {
      setSaveLoading(false);
    }
  };

  const renderSectionToolbar = (section: SectionKey) => (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        className="rounded-lg border px-3 py-1 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
        onClick={() => callImprove(section, "improve")}
        disabled={sectionLoading === section}
      >
        Improve with AI
      </button>
      <button
        type="button"
        className="rounded-lg bg-zinc-900 px-3 py-1 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        onClick={() => callImprove(section, "regenerate")}
        disabled={sectionLoading === section}
      >
        Regenerate
      </button>
      {sectionLoading === section ? (
        <div className="text-xs text-zinc-500 dark:text-zinc-400">Loading…</div>
      ) : null}
    </div>
  );

  const vocabItemEditor = (idx: number, item: VocabularyItem) => (
    <div key={idx} className="space-y-2 rounded-lg border p-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label className="space-y-1">
          <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">Word</div>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-zinc-950"
            value={item.word}
            onChange={(e) => {
              const next = [...vocabulary];
              next[idx] = { ...next[idx], word: e.target.value };
              setVocabulary(next);
            }}
          />
        </label>
        <label className="space-y-1">
          <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">IPA</div>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-zinc-950"
            value={item.ipa ?? ""}
            onChange={(e) => {
              const next = [...vocabulary];
              next[idx] = { ...next[idx], ipa: e.target.value };
              setVocabulary(next);
            }}
          />
        </label>
      </div>

      <label className="space-y-1">
        <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">Meaning</div>
        <input
          className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-zinc-950"
          value={item.meaning}
          onChange={(e) => {
            const next = [...vocabulary];
            next[idx] = { ...next[idx], meaning: e.target.value };
            setVocabulary(next);
          }}
        />
      </label>

      <label className="space-y-1">
        <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">Example</div>
        <input
          className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-zinc-950"
          value={item.example ?? ""}
          onChange={(e) => {
            const next = [...vocabulary];
            next[idx] = { ...next[idx], example: e.target.value };
            setVocabulary(next);
          }}
        />
      </label>

      <button
        type="button"
        className="text-sm text-rose-700 hover:underline dark:text-rose-300"
        onClick={() => setVocabulary(vocabulary.filter((_, i) => i !== idx))}
      >
        Remove
      </button>
    </div>
  );

  const answers = question.answers ?? [];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Admin Editor</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Paste an English news article, then generate learning sections with mock AI.
        </p>
      </div>

      {message ? (
        <div className="rounded-lg border bg-zinc-50 p-3 text-sm dark:bg-zinc-900">
          {message}
        </div>
      ) : null}

      <div className="space-y-3 rounded-xl border bg-white p-4 dark:bg-zinc-950">
        <label className="space-y-1">
          <div className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
            Source article text
          </div>
          <textarea
            className="min-h-28 w-full rounded-lg border px-3 py-2 text-sm dark:bg-zinc-950"
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Paste the article here…"
          />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            onClick={onGenerate}
            disabled={!canGenerate}
          >
            {isGenerating ? "Generating…" : "Generate with AI"}
          </button>

          {level ? (
            <div className="text-sm text-zinc-700 dark:text-zinc-200">
              Detected level: <span className="font-medium">{level}</span>
            </div>
          ) : null}
        </div>
      </div>

      {title || reading || vocabulary.length || answers.length ? (
        <div className="space-y-4">
          {/* Title */}
          <section className="space-y-3 rounded-xl border bg-white p-4 dark:bg-zinc-950">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Title</h2>
              {renderSectionToolbar("title")}
            </div>
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-zinc-950"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </section>

          {/* Reading */}
          <section className="space-y-3 rounded-xl border bg-white p-4 dark:bg-zinc-950">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Reading (3–5 sentences)</h2>
              {renderSectionToolbar("reading")}
            </div>
            <textarea
              className="min-h-28 w-full rounded-lg border px-3 py-2 text-sm dark:bg-zinc-950"
              value={reading}
              onChange={(e) => setReading(e.target.value)}
            />
          </section>

          {/* Vocabulary */}
          <section className="space-y-3 rounded-xl border bg-white p-4 dark:bg-zinc-950">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Vocabulary</h2>
              {renderSectionToolbar("vocabulary")}
            </div>

            <div className="space-y-3">{vocabulary.map((v, idx) => vocabItemEditor(idx, v))}</div>

            <button
              type="button"
              className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
              onClick={() => setVocabulary((prev) => [...prev, { word: "", meaning: "", ipa: "", example: "" }])}
            >
              Add vocabulary item
            </button>
          </section>

          {/* Question */}
          <section className="space-y-3 rounded-xl border bg-white p-4 dark:bg-zinc-950">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Question</h2>
              {renderSectionToolbar("question")}
            </div>

            <label className="space-y-1">
              <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">Prompt</div>
              <input
                className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-zinc-950"
                value={question.prompt}
                onChange={(e) => setQuestion((q) => ({ ...q, prompt: e.target.value }))}
              />
            </label>

            <div className="space-y-3">
              {answers.map((a, idx) => (
                <div key={idx} className="space-y-2 rounded-lg border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={a.isCorrect}
                        onChange={(e) => {
                          const nextAnswers = [...answers];
                          nextAnswers[idx] = { ...nextAnswers[idx], isCorrect: e.target.checked };
                          setQuestion((q) => ({ ...q, answers: nextAnswers }));
                        }}
                      />
                      Correct
                    </label>

                    <button
                      type="button"
                      className="text-sm text-rose-700 hover:underline dark:text-rose-300"
                      onClick={() => {
                        const nextAnswers = answers.filter((_, i) => i !== idx);
                        setQuestion((q) => ({ ...q, answers: nextAnswers }));
                      }}
                    >
                      Remove answer
                    </button>
                  </div>

                  <label className="space-y-1">
                    <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">Answer text</div>
                    <input
                      className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-zinc-950"
                      value={a.text}
                      onChange={(e) => {
                        const nextAnswers = [...answers];
                        nextAnswers[idx] = { ...nextAnswers[idx], text: e.target.value };
                        setQuestion((q) => ({ ...q, answers: nextAnswers }));
                      }}
                    />
                  </label>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
              onClick={() => {
                const nextAnswers: MultipleChoiceAnswer[] = [
                  ...answers,
                  { text: "", isCorrect: false },
                ];
                setQuestion((q) => ({ ...q, answers: nextAnswers }));
              }}
            >
              Add answer
            </button>
          </section>

          {/* Discussion */}
          <section className="space-y-3 rounded-xl border bg-white p-4 dark:bg-zinc-950">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Discussion</h2>
              {renderSectionToolbar("discussion")}
            </div>

            <div className="space-y-2">
              {discussion.map((d, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <input
                    className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-zinc-950"
                    value={d}
                    onChange={(e) => {
                      const next = [...discussion];
                      next[idx] = e.target.value;
                      setDiscussion(next);
                    }}
                  />
                  <button
                    type="button"
                    className="text-sm text-rose-700 hover:underline dark:text-rose-300"
                    onClick={() => setDiscussion(discussion.filter((_, i) => i !== idx))}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
              onClick={() => setDiscussion((prev) => [...prev, ""])}
            >
              Add discussion prompt
            </button>
          </section>

          {/* Further Discussion */}
          <section className="space-y-3 rounded-xl border bg-white p-4 dark:bg-zinc-950">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Further Discussion</h2>
              {renderSectionToolbar("furtherDiscussion")}
            </div>

            <div className="space-y-2">
              {furtherDiscussion.map((d, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <input
                    className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-zinc-950"
                    value={d}
                    onChange={(e) => {
                      const next = [...furtherDiscussion];
                      next[idx] = e.target.value;
                      setFurtherDiscussion(next);
                    }}
                  />
                  <button
                    type="button"
                    className="text-sm text-rose-700 hover:underline dark:text-rose-300"
                    onClick={() => setFurtherDiscussion(furtherDiscussion.filter((_, i) => i !== idx))}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
              onClick={() => setFurtherDiscussion((prev) => [...prev, ""])}
            >
              Add further prompt
            </button>
          </section>

          {/* Save */}
          <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-4 dark:bg-zinc-950">
            <div className="text-sm text-zinc-600 dark:text-zinc-300">
              {articleId ? (
                <>
                  Editing article: <span className="font-medium text-zinc-900 dark:text-zinc-100">{articleId}</span>
                </>
              ) : (
                <>New article (not saved yet)</>
              )}
              <div className="mt-1">
                Current status: <span className="font-medium text-zinc-900 dark:text-zinc-100">{status}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 disabled:opacity-50"
                onClick={() => onSave("draft")}
                disabled={saveLoading}
              >
                {saveLoading ? "Saving…" : "Save Draft"}
              </button>
              <button
                type="button"
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                onClick={() => onSave("published")}
                disabled={saveLoading}
              >
                Publish
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

