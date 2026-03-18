import { NextResponse } from "next/server";
import { improveArticleSection } from "@/services/aiService";
import type { SectionKey } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      sourceText?: string;
      section?: SectionKey;
      operation?: "improve" | "regenerate";
      current?: unknown;
    };

    const sourceText = body.sourceText ?? "";
    const section = body.section;
    const operation = body.operation ?? "improve";
    const current = body.current;

    if (!sourceText.trim()) {
      return NextResponse.json({ error: "Missing `sourceText`" }, { status: 400 });
    }
    if (!section) {
      return NextResponse.json({ error: "Missing `section`" }, { status: 400 });
    }

    const value = await improveArticleSection({
      sourceText,
      section,
      operation,
      current,
    });

    return NextResponse.json({ value });
  } catch (_e) {
    return NextResponse.json({ error: "Failed to improve section" }, { status: 500 });
  }
}

