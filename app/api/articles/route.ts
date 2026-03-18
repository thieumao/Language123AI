import { NextResponse } from "next/server";
import { createArticle, getArticles } from "@/services/articleService";
import type { ArticleContent, ArticleStatus } from "@/lib/types";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const statusParam = url.searchParams.get("status") ?? undefined;
    const status = statusParam as ArticleStatus | undefined;

    const articles = await getArticles(status);
    return NextResponse.json({ articles });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
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

    const created = await createArticle({
      title: body.title,
      content: body.content,
      level: body.level ?? null,
      status: body.status,
    });

    return NextResponse.json({ article: created }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 },
    );
  }
}

