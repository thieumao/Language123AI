import type { ArticleContent, ArticleDraft, SectionKey } from "@/lib/types";
import { detectLevel, generateFromText, improveSection } from "@/lib/ai";

export async function generateArticle(sourceText: string): Promise<{
  draft: ArticleDraft;
  level: string;
}> {
  return generateFromText(sourceText);
}

export async function improveArticleSection(params: {
  sourceText: string;
  section: SectionKey;
  operation: "improve" | "regenerate";
  current: unknown;
  fullDraft?: ArticleDraft;
}): Promise<unknown> {
  return improveSection(params);
}

export function getDetectedLevel(text: string): string {
  return detectLevel(text);
}

export type { ArticleContent, ArticleDraft };

