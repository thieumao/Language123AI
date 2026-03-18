export type VocabularyItem = {
  word: string;
  meaning: string;
  ipa?: string;
  example?: string;
};

export type MultipleChoiceAnswer = {
  text: string;
  isCorrect: boolean;
};

export type Question = {
  prompt: string;
  answers: MultipleChoiceAnswer[];
};

export type ArticleContent = {
  reading: string;
  vocabulary: VocabularyItem[];
  question: Question;
  discussion: string[];
  furtherDiscussion: string[];
};

export type ArticleStatus = "draft" | "published";

export type SectionKey =
  | "title"
  | "reading"
  | "vocabulary"
  | "question"
  | "discussion"
  | "furtherDiscussion";

export type ArticleDraft = {
  title: string;
  content: ArticleContent;
  level?: string | null;
};

