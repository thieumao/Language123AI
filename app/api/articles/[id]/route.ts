import { NextResponse } from "next/server";
import { getArticleById, updateArticle } from "@/services/articleService";
import type { ArticleContent, ArticleStatus } from "@/lib/types";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const article = await getArticleById(id);
    return NextResponse.json({ article });
  } catch {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = (await req.json()) as {
      title?: string;
      content?: ArticleContent;
      level?: string | null;
      status?: ArticleStatus;
    };

    if (!body.title?.trim()) {
      return NextResponse.json({ error: "Missing `title`" }, { status: 400 });
    }
    if (!body.content) {
      return NextResponse.json({ error: "Missing `content`" }, { status: 400 });
    }
    if (!body.status) {
      return NextResponse.json({ error: "Missing `status`" }, { status: 400 });
    }

    const updated = await updateArticle(id, {
      title: body.title,
      content: body.content,
      level: body.level ?? null,
      status: body.status,
    });

    return NextResponse.json({ article: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update article" }, { status: 500 });
  }
}

