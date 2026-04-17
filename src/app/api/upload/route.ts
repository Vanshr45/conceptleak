import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { addDataset, cacheInsights } from "@/lib/store";
import { scoreToRisk } from "@/lib/utils";
import { analyzeDataset } from "@/lib/analyzer";
import type { Dataset } from "@/types";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".csv", ".xlsx"];
const ALLOWED_TYPES = [
  "text/csv",
  "application/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.sub;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
    if (!hasValidExt) {
      return NextResponse.json(
        { error: "Invalid file type. Only .csv and .xlsx files are allowed." },
        { status: 415 }
      );
    }
    if (file.type && !ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid MIME type." },
        { status: 415 }
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum allowed size is 10 MB." },
        { status: 413 }
      );
    }

    const buffer = await file.arrayBuffer();
    let columns: string[] = [];
    let allRows: Record<string, string>[] = [];

    // ── Parse ALL rows (not just 5) ──────────────────────────────────────────
    if (fileName.endsWith(".csv")) {
      const text = new TextDecoder().decode(buffer);
      const lines = text.split("\n").filter((l) => l.trim());
      if (lines.length > 0) {
        columns = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
        allRows = lines.slice(1).map((line) => {
          const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
          return Object.fromEntries(
            columns.map((col, i) => [col, values[i] ?? ""])
          ) as Record<string, string>;
        });
      }
    } else if (fileName.endsWith(".xlsx")) {
      const XLSX = await import("xlsx");
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];
      if (jsonData.length > 0) {
        columns = (jsonData[0] as string[]).map(String);
        allRows = jsonData.slice(1).map((row) => {
          const arr = row as unknown[];
          return Object.fromEntries(
            columns.map((col, i) => [col, String(arr[i] ?? "")])
          ) as Record<string, string>;
        });
      }
    }

    const rowCount = allRows.length;
    const previewRows = allRows.slice(0, 5);

    // ── Run real statistical analysis ────────────────────────────────────────
    const { riskScore, insights } = analyzeDataset(columns, allRows);

    const sizeStr =
      file.size < 1024
        ? `${file.size} B`
        : file.size < 1024 * 1024
        ? `${(file.size / 1024).toFixed(1)} KB`
        : `${(file.size / 1024 / 1024).toFixed(1)} MB`;

    const dataset: Dataset = {
      id: `ds-${userId}-${Date.now()}`,
      name: file.name,
      size: sizeStr,
      uploadedAt: new Date().toISOString(),
      status: "completed",
      riskScore,
      riskLevel: scoreToRisk(riskScore),
      rowCount,
      columnCount: columns.length,
      columns,
      previewRows,
    };

    const createdDataset = await addDataset(userId, dataset);
    if (!createdDataset) {
      return NextResponse.json({ error: "Failed to save dataset" }, { status: 500 });
    }

    // Cache computed insights so they're ready immediately
    cacheInsights(createdDataset.id, insights);

    return NextResponse.json({ dataset: createdDataset });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
  }
}
