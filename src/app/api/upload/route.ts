import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { addDataset } from "@/lib/store";
import { scoreToRisk } from "@/lib/utils";
import type { Dataset } from "@/types";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = [
  "text/csv",
  "application/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];
const ALLOWED_EXTENSIONS = [".csv", ".xlsx"];

export async function POST(req: NextRequest) {
  const session = await getSession();
  const userId = session!.sub;

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
        { error: "Invalid MIME type. Only CSV and XLSX files are accepted." },
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
    let previewRows: Record<string, unknown>[] = [];
    let rowCount = 0;

    if (fileName.endsWith(".csv")) {
      const text = new TextDecoder().decode(buffer);
      const lines = text.split("\n").filter((l) => l.trim());
      if (lines.length > 0) {
        columns = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
        const dataLines = lines.slice(1, 6);
        previewRows = dataLines.map((line) => {
          const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
          return Object.fromEntries(columns.map((col, i) => [col, values[i] ?? ""]));
        });
        rowCount = lines.length - 1;
      }
    } else if (fileName.endsWith(".xlsx")) {
      const XLSX = await import("xlsx");
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

      if (jsonData.length > 0) {
        columns = (jsonData[0] as string[]).map(String);
        const dataRows = jsonData.slice(1, 6);
        previewRows = dataRows.map((row) => {
          const arr = row as unknown[];
          return Object.fromEntries(columns.map((col, i) => [col, arr[i] ?? ""]));
        });
        rowCount = jsonData.length - 1;
      }
    }

    const idPattern = /\b(id|uuid|guid|index)\b/i;
    const piiPattern = /(email|phone|ssn|passport|name|address)/i;
    const temporalPattern = /(date|time|timestamp|created|updated)/i;

    let riskScore = 20;
    columns.forEach((col) => {
      if (idPattern.test(col)) riskScore += 25;
      if (piiPattern.test(col)) riskScore += 15;
      if (temporalPattern.test(col)) riskScore += 10;
    });
    riskScore = Math.min(riskScore, 100);

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

    addDataset(userId, dataset);

    return NextResponse.json({ dataset });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
  }
}
