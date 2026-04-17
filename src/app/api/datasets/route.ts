import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllDatasets } from "@/lib/store";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session!.sub;

  try {
    const datasets = await getAllDatasets(userId);
    return NextResponse.json({ datasets });
  } catch {
    return NextResponse.json({ error: "Failed to load datasets" }, { status: 500 });
  }
}
