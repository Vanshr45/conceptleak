import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDataset, getInsights, getChatHistory } from "@/lib/store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const userId = session!.sub;
  const { id } = await params;

  const dataset = getDataset(userId, id);
  if (!dataset) {
    return NextResponse.json({ error: "Dataset not found" }, { status: 404 });
  }

  const insights = getInsights(userId, id);
  const chatHistory = getChatHistory(userId, id);

  return NextResponse.json({ dataset, insights, chatHistory });
}
