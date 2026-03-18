import { NextResponse } from "next/server";
import { generateArticle } from "@/services/aiService";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { sourceText?: string };
    const sourceText = body.sourceText ?? "";
    if (!sourceText.trim()) {
      return NextResponse.json({ error: "Missing `sourceText`" }, { status: 400 });
    }

    const { draft, level } = await generateArticle(sourceText);
    return NextResponse.json({ draft, level });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to generate article" },
      { status: 500 },
    );
  }
}

