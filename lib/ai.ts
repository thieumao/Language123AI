import type {
  ArticleContent,
  ArticleDraft,
  Question,
  SectionKey,
  VocabularyItem,
} from "./types";

function hashToInt(input: string): number {
  // Simple deterministic hash (mock-only). Do not use for crypto.
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length]!;
}

function clampInt(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function cleanSnippet(text: string): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return "recent news";
  return normalized.length > 90 ? normalized.slice(0, 90).trimEnd() + "…" : normalized;
}

export function detectLevel(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Very rough mock heuristic for MVP.
  if (wordCount < 80) return "A1";
  if (wordCount < 140) return "A2";
  if (wordCount < 230) return "B1";
  return "B2";
}

export async function generateFromText(sourceText: string): Promise<{
  draft: ArticleDraft;
  level: string;
}> {
  const seed = hashToInt(sourceText);
  const snippet = cleanSnippet(sourceText);

  const level = detectLevel(sourceText);
  const sentenceCount = clampInt((seed % 3) + 3, 3, 5);

  const readingTemplatesA1 = [
    `Today, ${snippet} is in the news.`,
    `Many people want to understand what happened.`,
    `This helps you learn new English words.`,
    `In simple steps, we can read and discuss it.`,
    `Now let's focus on key ideas.`,
  ];

  const readingTemplates = level === "A1" ? readingTemplatesA1 : [
    `Recently, ${snippet} has become an important topic.`,
    `The article explains the main events in a clear way.`,
    `It also shares why these changes matter to readers.`,
    `By reading slowly, you can understand the key ideas.`,
    `Then you can practice vocabulary and questions.`,
  ];

  const readingSentences: string[] = [];
  for (let i = 0; i < sentenceCount; i++) {
    readingSentences.push(pick(readingTemplates, seed + i * 17));
  }

  const vocabularyBank: Array<Omit<VocabularyItem, "word"> & { wordVariants: string[] }> = [
    {
      wordVariants: ["report", "update", "story"],
      meaning: "a message about what happened",
      ipa: "/rɪˈpɔːrt/",
      example: "The report explains the situation clearly.",
    },
    {
      wordVariants: ["impact", "effect"],
      meaning: "the result of an action",
      ipa: "/ˈɪmpækt/",
      example: "This change has a strong impact on people.",
    },
    {
      wordVariants: ["community", "neighborhood"],
      meaning: "a group of people who live or work together",
      ipa: "/kəˈmjuːnəti/",
      example: "The community supports local events.",
    },
    {
      wordVariants: ["increase", "rise"],
      meaning: "to become higher or more",
      ipa: "/ɪnˈkriːs/",
      example: "The numbers show an increase this year.",
    },
    {
      wordVariants: ["reason", "cause"],
      meaning: "why something happens",
      ipa: "/ˈriːzən/",
      example: "We learn the reason behind the decision.",
    },
    {
      wordVariants: ["improve", "enhance"],
      meaning: "to make something better",
      ipa: "/ɪmˈpruːv/",
      example: "Daily practice helps you improve your English.",
    },
  ];

  const vocabCount = clampInt((seed % 3) + 4, 4, 6);
  const vocabulary: VocabularyItem[] = [];
  for (let i = 0; i < vocabCount; i++) {
    const entry = pick(vocabularyBank, seed + i * 23);
    const word = pick(entry.wordVariants, seed + i * 5);
    vocabulary.push({
      word,
      meaning: entry.meaning,
      ipa: entry.ipa,
      example: entry.example,
    });
  }

  const correctAnswerIndex = seed % 4;

  const questionPrompts: Record<string, string> = {
    A1: "What is the main idea of the article?",
    A2: "What does the article mainly explain?",
    B1: "Which statement best matches the article?",
    B2: "What is the article's central message?",
  };

  const answerSets: Record<string, Array<string[]>> = {
    A1: [
      ["It explains a recent event.", "It is only a personal story.", "It is about sports games.", "It is a cooking recipe."],
      ["It helps you learn English words.", "It is only for homework.", "It is about cars.", "It is a music album."],
    ],
    A2: [
      ["It describes why the topic matters.", "It says nothing about impact.", "It is written in a different language.", "It only gives dates without meaning."],
    ],
    B1: [
      ["It summarizes the key events and reasons.", "It argues that change is impossible.", "It focuses only on marketing.", "It avoids mentioning causes."],
    ],
    B2: [
      ["It connects the events to broader effects.", "It ignores evidence and examples.", "It only reports without context.", "It focuses on unrelated topics."],
    ],
  };

  const prompt = questionPrompts[level] ?? questionPrompts.A2;
  const set = pick(answerSets[level] ?? answerSets.A2, seed);
  const answersText = set;

  const answers: Question["answers"] = answersText.map((text, idx) => ({
    text,
    isCorrect: idx === correctAnswerIndex,
  }));

  const discussionBase = [
    "Which detail in the article is easiest to understand?",
    "What new vocabulary word do you want to practice?",
    "Do you agree with the article's explanation? Why or why not?",
    "If you could ask the author one question, what would it be?",
    "How would you summarize the article in one sentence?",
  ];

  const discussion = Array.from({ length: 3 }, (_, i) =>
    pick(discussionBase, seed + i * 31),
  );

  const furtherDiscussionBase = [
    "What could be the impact in the next few months?",
    "How might the same topic be explained to a younger learner?",
    "What question would you ask a classmate to start a discussion?",
    "What evidence from the article supports the main point?",
  ];

  const furtherDiscussion = Array.from({ length: 2 }, (_, i) =>
    pick(furtherDiscussionBase, seed + i * 41),
  );

  const content: ArticleContent = {
    reading: readingSentences.join(" "),
    vocabulary,
    question: { prompt, answers },
    discussion,
    furtherDiscussion,
  };

  const title = `English News: ${snippet}`;

  const draft: ArticleDraft = { title, content, level };

  return { draft, level };
}

export async function improveSection(params: {
  sourceText: string;
  section: SectionKey;
  operation: "improve" | "regenerate";
  current: unknown;
  fullDraft?: ArticleDraft;
}): Promise<unknown> {
  const { sourceText, section, operation, current } = params;
  const seed = hashToInt(sourceText + "|" + section + "|" + operation);

  const improveSuffix =
    operation === "improve"
      ? " (Improved for clarity and level.)"
      : "";

  if (section === "title") {
    const currentTitle = typeof current === "string" ? current : "";
    if (operation === "improve") {
      return currentTitle ? currentTitle + improveSuffix : `English News: ${cleanSnippet(sourceText)}`;
    }
    return `English News (New Version): ${cleanSnippet(sourceText)}`;
  }

  if (section === "reading") {
    const currentReading = typeof current === "string" ? current : "";
    if (operation === "improve") {
      const extra = pick(
        [
          "The sentences are shorter and easier to read.",
          "Try reading it once for meaning, then again for details.",
          "Look for key words and answer the question.",
        ],
        seed,
      );
      return currentReading
        ? currentReading.replace(/\s+/g, " ").trim() + " " + extra
        : `Today, ${cleanSnippet(sourceText)} is in the news. The key idea is to learn and practice English.`;
    }
    return (await generateFromText(sourceText)).draft.content.reading;
  }

  if (section === "vocabulary") {
    const currentVocabulary = Array.isArray(current) ? (current as VocabularyItem[]) : [];
    if (operation === "improve") {
      const improved = currentVocabulary.map((item, idx) => ({
        ...item,
        example:
          item.example ??
          `Example ${idx + 1}: practice the word in a short sentence.`,
        ipa: item.ipa ?? "/…/",
        meaning: item.meaning ? item.meaning + " " : item.meaning,
      }));
      return improved.length ? improved : (await generateFromText(sourceText)).draft.content.vocabulary;
    }
    return (await generateFromText(sourceText)).draft.content.vocabulary;
  }

  if (section === "question") {
    const currentQuestion = current as { prompt?: string; answers?: Array<{ text: string; isCorrect: boolean }> };
    if (operation === "improve") {
      const currentPrompt = typeof currentQuestion?.prompt === "string" ? currentQuestion.prompt : "";
      const updatedPrompt = currentPrompt
        ? currentPrompt + " (Better wording.)"
        : (await generateFromText(sourceText)).draft.content.question.prompt;

      const answers = Array.isArray(currentQuestion?.answers)
        ? currentQuestion.answers.map((a) => ({ ...a }))
        : (await generateFromText(sourceText)).draft.content.question.answers;

      // Ensure at least one correct answer.
      const hasCorrect = answers.some((a) => a.isCorrect);
      if (!hasCorrect && answers.length > 0) answers[0] = { ...answers[0], isCorrect: true };

      return { prompt: updatedPrompt, answers };
    }

    return (await generateFromText(sourceText)).draft.content.question;
  }

  if (section === "discussion") {
    const currentDiscussion = Array.isArray(current) ? current.filter((x) => typeof x === "string") as string[] : [];
    if (operation === "improve") {
      const extra = pick(
        [
          "Which part helped you understand the meaning?",
          "What would you add to the discussion if you were the author?",
          "What is one example from real life that matches this topic?",
        ],
        seed,
      );
      const base = currentDiscussion.length ? currentDiscussion : (await generateFromText(sourceText)).draft.content.discussion;
      return base.slice(0, 3).concat([extra]).slice(0, 3);
    }
    return (await generateFromText(sourceText)).draft.content.discussion;
  }

  if (section === "furtherDiscussion") {
    const currentFurther = Array.isArray(current) ? current.filter((x) => typeof x === "string") as string[] : [];
    if (operation === "improve") {
      const extra = pick(
        [
          "How could we explain this topic in simpler English?",
          "What would you ask classmates to think about?",
          "What changes might happen if this topic grows?",
        ],
        seed,
      );
      const base =
        currentFurther.length
          ? currentFurther
          : (await generateFromText(sourceText)).draft.content.furtherDiscussion;
      return base.slice(0, 2).concat([extra]).slice(0, 2);
    }
    return (await generateFromText(sourceText)).draft.content.furtherDiscussion;
  }

  return current;
}

