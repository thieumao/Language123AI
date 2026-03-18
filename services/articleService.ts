import { prisma } from "@/lib/db";
import type { ArticleContent, ArticleStatus } from "@/lib/types";

export async function createArticle(input: {
  title: string;
  content: ArticleContent;
  level?: string | null;
  status: ArticleStatus;
}): Promise<{
  id: string;
  title: string;
  content: ArticleContent;
  level: string | null;
  status: ArticleStatus;
  createdAt: Date;
  updatedAt: Date;
}> {
  const created = await prisma.article.create({
    data: {
      title: input.title,
      content: input.content,
      level: input.level ?? null,
      status: input.status,
    },
  });

  return {
    id: created.id,
    title: created.title,
    content: created.content as ArticleContent,
    level: created.level,
    status: created.status as ArticleStatus,
    createdAt: created.createdAt,
    updatedAt: created.updatedAt,
  };
}

export async function updateArticle(id: string, input: {
  title: string;
  content: ArticleContent;
  level?: string | null;
  status: ArticleStatus;
}): Promise<{
  id: string;
  title: string;
  content: ArticleContent;
  level: string | null;
  status: ArticleStatus;
  createdAt: Date;
  updatedAt: Date;
}> {
  const updated = await prisma.article.update({
    where: { id },
    data: {
      title: input.title,
      content: input.content,
      level: input.level ?? null,
      status: input.status,
    },
  });

  return {
    id: updated.id,
    title: updated.title,
    content: updated.content as ArticleContent,
    level: updated.level,
    status: updated.status as ArticleStatus,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  };
}

export async function getArticles(status?: ArticleStatus): Promise<Array<{
  id: string;
  title: string;
  level: string | null;
  status: ArticleStatus;
  createdAt: Date;
  updatedAt: Date;
}>> {
  const where = status ? { status } : undefined;
  const rows = await prisma.article.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      level: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    level: r.level,
    status: r.status as ArticleStatus,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));
}

export async function getArticleById(id: string): Promise<{
  id: string;
  title: string;
  content: ArticleContent;
  level: string | null;
  status: ArticleStatus;
  createdAt: Date;
  updatedAt: Date;
}> {
  const found = await prisma.article.findUnique({
    where: { id },
  });

  if (!found) {
    throw new Error("Article not found");
  }

  return {
    id: found.id,
    title: found.title,
    content: found.content as ArticleContent,
    level: found.level,
    status: found.status as ArticleStatus,
    createdAt: found.createdAt,
    updatedAt: found.updatedAt,
  };
}

