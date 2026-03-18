"use client";

import { useMemo, useState } from "react";
import type { Question } from "@/lib/types";

export default function LearnQuestionBlock({
  question,
}: {
  question: Question;
}) {
  const answers = question.answers ?? [];
  const correctIndex = useMemo(() => {
    return answers.findIndex((a) => a.isCorrect);
  }, [answers]);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const selectedAnswer = selectedIndex !== null ? answers[selectedIndex] : null;
  const isCorrect =
    selectedAnswer?.isCorrect === true ||
    (correctIndex >= 0 && selectedIndex === correctIndex);

  const onSubmit = () => {
    if (selectedIndex === null) return;
    setSubmitted(true);
  };

  const feedback =
    submitted && selectedIndex !== null ? (
      isCorrect ? (
        <div className="rounded-lg border bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
          Correct. Great job!
        </div>
      ) : (
        <div className="rounded-lg border bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-950/30 dark:text-rose-200">
          Not quite. Try the next one!
        </div>
      )
    ) : null;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Question</h2>
      <p className="text-sm text-zinc-700 dark:text-zinc-200">
        {question.prompt}
      </p>

      <div className="space-y-2">
        {answers.map((a, idx) => (
          <label
            key={idx}
            className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            <input
              type="radio"
              name="mcq"
              checked={selectedIndex === idx}
              onChange={() => {
                setSelectedIndex(idx);
                setSubmitted(false);
              }}
              className="mt-1"
            />
            <div className="text-sm leading-5">
              <div>{a.text}</div>
              {submitted && selectedIndex === idx ? (
                <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {a.isCorrect ? "Correct" : "Your answer"}
                </div>
              ) : null}
              {submitted && correctIndex === idx && selectedIndex !== idx ? (
                <div className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                  Correct answer
                </div>
              ) : null}
            </div>
          </label>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onSubmit}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 disabled:opacity-50"
          disabled={selectedIndex === null}
        >
          Check answer
        </button>
        {selectedIndex !== null ? (
          <button
            type="button"
            onClick={() => {
              setSelectedIndex(null);
              setSubmitted(false);
            }}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            Reset
          </button>
        ) : null}
      </div>

      {feedback}
    </div>
  );
}

