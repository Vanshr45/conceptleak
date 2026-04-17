import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDataset, getInsights, getChatHistory } from "@/lib/store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.sub;
  const { id } = await params;

  try {
    const dataset = await getDataset(userId, id);
    if (!dataset) {
      return NextResponse.json({ error: "Dataset not found" }, { status: 404 });
    }

    const insights = await getInsights(userId, id);
    const chatHistory = getChatHistory(userId, id);

    return NextResponse.json({ dataset, insights, chatHistory });
  } catch {
    return NextResponse.json({ error: "Failed to load dataset" }, { status: 500 });
  }
}
