import { NextResponse } from "next/server";
import { replay } from "@/lib/engine";
import type { Case } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Case;
    const rows = replay(body);
    return NextResponse.json({ rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
