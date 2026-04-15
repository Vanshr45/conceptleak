import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllDatasets } from "@/lib/store";

export async function GET() {
  const session = await getSession();
  // session is guaranteed by middleware, but getSession() gives us the userId
  const userId = session!.sub;
  return NextResponse.json({ datasets: getAllDatasets(userId) });
}
