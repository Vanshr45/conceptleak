import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { getDataset, getInsights } from "@/lib/store";
import { runSimulation } from "@/lib/simulator";

const SimulateSchema = z.object({
  datasetId: z.string().min(1),
  targetColumn: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = SimulateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { datasetId, targetColumn } = result.data;
    const userId = session.sub;

    const dataset = await getDataset(userId, datasetId);
    if (!dataset) {
      return NextResponse.json({ error: "Dataset not found" }, { status: 404 });
    }

    const allRows = Array.isArray(dataset.allRows)
      ? (dataset.allRows as Record<string, unknown>[])
      : [];

    if (allRows.length <= 5) {
      return NextResponse.json(
        {
          error:
            "This dataset was uploaded before full-row storage was added. Please delete it and re-upload to run a simulation.",
        },
        { status: 400 }
      );
    }

    const rawRows = allRows;

    if (!dataset.columns?.includes(targetColumn)) {
      return NextResponse.json(
        { error: `Column "${targetColumn}" not found in dataset` },
        { status: 400 }
      );
    }

    const insights = await getInsights(userId, datasetId);

    const flaggedColumns = insights
      .filter(i => i.riskLevel !== "LOW" && i.feature !== "General Assessment")
      .map(i => ({
        column: i.feature,
        leakageType: i.leakageType ?? "Unknown",
        score: i.score,
      }))
      .filter(f => f.column !== targetColumn);

    const rows = rawRows.map(row =>
      Object.fromEntries(
        Object.entries(row).map(([k, v]) => [k, String(v ?? "")])
      ) as Record<string, string>
    );

    const simulationResult = await runSimulation({
      columns: dataset.columns ?? [],
      rows,
      targetColumn,
      flaggedColumns,
    });

    return NextResponse.json({ result: simulationResult });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Simulation failed";
    console.error("Simulate error:", err);

    if (
      message.includes("Too few rows") ||
      message.includes("single unique value")
    ) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
