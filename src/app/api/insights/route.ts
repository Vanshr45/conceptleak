import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getInsights, getAllDatasets } from "@/lib/store";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.sub;

  const { searchParams } = new URL(req.url);
  const datasetId = searchParams.get("datasetId");

  try {
    if (datasetId) {
      const insights = await getInsights(userId, datasetId);
      return NextResponse.json({ insights });
    }

    const datasets = await getAllDatasets(userId);
    const allInsights = (await Promise.all(datasets.map((d) => getInsights(userId, d.id)))).flat();
    return NextResponse.json({ insights: allInsights });
  } catch {
    return NextResponse.json({ error: "Failed to load insights" }, { status: 500 });
  }
}
