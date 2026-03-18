import { NextResponse } from "next/server";
import { getDetectedLevel } from "@/services/aiService";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { text?: string };
    const text = body.text ?? "";
    if (!text.trim()) {
      return NextResponse.json({ error: "Missing `text`" }, { status: 400 });
    }

    const level = getDetectedLevel(text);
    return NextResponse.json({ level });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to detect level" },
      { status: 500 },
    );
  }
}

