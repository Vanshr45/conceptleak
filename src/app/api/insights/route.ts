import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getInsights, getAllDatasets } from "@/lib/store";

export async function GET(req: NextRequest) {
  const session = await getSession();
  const userId = session!.sub;

  const { searchParams } = new URL(req.url);
  const datasetId = searchParams.get("datasetId");

  if (datasetId) {
    return NextResponse.json({ insights: getInsights(userId, datasetId) });
  }

  const datasets = getAllDatasets(userId);
  const allInsights = datasets.flatMap((d) => getInsights(userId, d.id));
  return NextResponse.json({ insights: allInsights });
}
