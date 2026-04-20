export interface ColumnImpact {
  column: string;
  leakageType: string;
  gapBefore: number;
  gapAfter: number;
  impactScore: number;
  recommendation: "REMOVE" | "REVIEW" | "KEEP";
}

export interface SimulationResult {
  baselineTrainAccuracy: number;
  baselineTestAccuracy: number;
  baselineGap: number;
  cleanTrainAccuracy: number;
  cleanTestAccuracy: number;
  cleanGap: number;
  columnImpacts: ColumnImpact[];
  modelType: "DecisionTree" | "LogisticRegression";
  problemType: "classification" | "regression";
  rowsUsed: number;
  trainSize: number;
  testSize: number;
  durationMs: number;
}

export interface SimulatorInput {
  columns: string[];
  rows: Record<string, string>[];
  targetColumn: string;
  flaggedColumns: Array<{
    column: string;
    leakageType: string;
    score: number;
  }>;
}

function detectProblemType(values: string[]): "classification" | "regression" {
  const nums = values.map(v => parseFloat(v)).filter(n => !isNaN(n));
  if (nums.length === 0) return "classification";
  const unique = new Set(nums);
  const allIntegers = nums.every(n => Number.isInteger(n));
  if (unique.size <= 10 && allIntegers) return "classification";
  return "regression";
}

function labelEncode(values: string[]): number[] {
  const parsed = values.map(v => {
    if (v === null || v === undefined || v === "") return null;
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
  });

  const allNumeric = parsed.every(v => v !== null);
  if (allNumeric) return parsed as number[];

  const stringMap: Record<string, number> = {};
  let counter = 0;
  return values.map(v => {
    if (v === null || v === undefined || v === "") return 0;
    const n = parseFloat(v);
    if (!isNaN(n)) return n;
    if (!(v in stringMap)) stringMap[v] = counter++;
    return stringMap[v];
  });
}

function prepareFeatures(
  rows: Record<string, string>[],
  columns: string[],
  targetColumn: string
): { X: number[][]; y: number[] } {
  const featureCols = columns.filter(c => c !== targetColumn);

  const encodedFeatures = featureCols.map(col => {
    const vals = rows.map(r => r[col] ?? "");
    return labelEncode(vals);
  });

  const yVals = rows.map(r => r[targetColumn] ?? "");
  const y = labelEncode(yVals);

  const X = rows.map((_, i) => featureCols.map((_, fi) => encodedFeatures[fi][i]));

  return { X, y };
}

function seededShuffle(arr: number[], seed: number): number[] {
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function trainTestSplit(
  X: number[][],
  y: number[],
  testRatio = 0.2
): {
  XTrain: number[][];
  XTest: number[][];
  yTrain: number[];
  yTest: number[];
} {
  const n = X.length;
  const indices = seededShuffle(
    Array.from({ length: n }, (_, i) => i),
    42
  );
  const splitAt = Math.floor(n * (1 - testRatio));
  const trainIdx = indices.slice(0, splitAt);
  const testIdx = indices.slice(splitAt);

  return {
    XTrain: trainIdx.map(i => X[i]),
    XTest: testIdx.map(i => X[i]),
    yTrain: trainIdx.map(i => y[i]),
    yTest: testIdx.map(i => y[i]),
  };
}

class SimpleDecisionTree {
  private splitFeature: number = 0;
  private splitThreshold: number = 0;
  private leftClass: number = 0;
  private rightClass: number = 0;

  fit(X: number[][], y: number[]): void {
    if (X.length === 0 || X[0].length === 0) return;
    let bestGini = Infinity;
    for (let f = 0; f < X[0].length; f++) {
      const values = X.map(row => row[f]);
      const threshold = values.reduce((a, b) => a + b, 0) / values.length;
      const left = y.filter((_, i) => X[i][f] <= threshold);
      const right = y.filter((_, i) => X[i][f] > threshold);
      const gini = this.gini(left, right, y.length);
      if (gini < bestGini) {
        bestGini = gini;
        this.splitFeature = f;
        this.splitThreshold = threshold;
        this.leftClass = this.majorityClass(left);
        this.rightClass = this.majorityClass(right);
      }
    }
  }

  predict(X: number[][]): number[] {
    return X.map(row =>
      row[this.splitFeature] <= this.splitThreshold
        ? this.leftClass
        : this.rightClass
    );
  }

  private gini(left: number[], right: number[], total: number): number {
    const giniSplit = (arr: number[]) => {
      if (arr.length === 0) return 0;
      const counts: Record<number, number> = {};
      arr.forEach(v => (counts[v] = (counts[v] || 0) + 1));
      return (
        1 -
        Object.values(counts).reduce(
          (sum, c) => sum + Math.pow(c / arr.length, 2),
          0
        )
      );
    };
    return (
      (left.length / total) * giniSplit(left) +
      (right.length / total) * giniSplit(right)
    );
  }

  private majorityClass(arr: number[]): number {
    if (arr.length === 0) return 0;
    const counts: Record<number, number> = {};
    arr.forEach(v => (counts[v] = (counts[v] || 0) + 1));
    return Number(
      Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
    );
  }
}

function accuracy(yTrue: number[], yPred: number[]): number {
  if (yTrue.length === 0) return 0;
  const correct = yTrue.filter((v, i) => v === yPred[i]).length;
  return Math.round((correct / yTrue.length) * 1000) / 10;
}

function trainAndScore(
  XTrain: number[][],
  XTest: number[][],
  yTrain: number[],
  yTest: number[]
): { trainAcc: number; testAcc: number; gap: number } {
  const model = new SimpleDecisionTree();
  model.fit(XTrain, yTrain);

  const trainPred = model.predict(XTrain);
  const testPred = model.predict(XTest);

  const trainAcc = accuracy(yTrain, trainPred);
  const testAcc = accuracy(yTest, testPred);
  const gap = Math.round((trainAcc - testAcc) * 10) / 10;

  return { trainAcc, testAcc, gap };
}

export async function runSimulation(
  input: SimulatorInput
): Promise<SimulationResult> {
  const start = Date.now();

  const rows = input.rows.slice(0, 5000);
  const { columns, targetColumn, flaggedColumns } = input;

  if (rows.length < 50) {
    throw new Error("Too few rows for simulation");
  }

  const targetValues = rows.map(r => r[targetColumn] ?? "");
  const uniqueTarget = new Set(targetValues);
  if (uniqueTarget.size <= 1) {
    throw new Error("Target column has only 1 unique value");
  }

  const problemType = detectProblemType(targetValues);

  // Baseline: all columns
  const { X: Xall, y } = prepareFeatures(rows, columns, targetColumn);
  const { XTrain, XTest, yTrain, yTest } = trainTestSplit(Xall, y);
  const baseline = trainAndScore(XTrain, XTest, yTrain, yTest);

  const baselineTrainAccuracy = baseline.trainAcc;
  const baselineTestAccuracy = baseline.testAcc;
  const baselineGap = baseline.gap;

  const columnImpacts: ColumnImpact[] = [];

  if (flaggedColumns.length === 0) {
    return {
      baselineTrainAccuracy,
      baselineTestAccuracy,
      baselineGap,
      cleanTrainAccuracy: baselineTrainAccuracy,
      cleanTestAccuracy: baselineTestAccuracy,
      cleanGap: baselineGap,
      columnImpacts: [],
      modelType: "DecisionTree",
      problemType,
      rowsUsed: rows.length,
      trainSize: XTrain.length,
      testSize: XTest.length,
      durationMs: Date.now() - start,
    };
  }

  // Sort flagged columns by score descending
  const sorted = [...flaggedColumns].sort((a, b) => b.score - a.score);

  let currentColumns = columns.filter(c => c !== targetColumn);
  let currentGap = baselineGap;

  for (const flagged of sorted) {
    if (!currentColumns.includes(flagged.column)) continue;

    const nextColumns = currentColumns.filter(c => c !== flagged.column);

    const featureCols = nextColumns.length > 0 ? nextColumns : currentColumns;
    const { X: Xnew, y: yNew } = prepareFeatures(
      rows,
      [...featureCols, targetColumn],
      targetColumn
    );
    const split = trainTestSplit(Xnew, yNew);
    const result = trainAndScore(
      split.XTrain,
      split.XTest,
      split.yTrain,
      split.yTest
    );

    const gapBefore = currentGap;
    const gapAfter = result.gap;
    const impactScore = Math.round((gapBefore - gapAfter) * 10) / 10;

    let recommendation: "REMOVE" | "REVIEW" | "KEEP";
    if (impactScore > 10) recommendation = "REMOVE";
    else if (impactScore > 3) recommendation = "REVIEW";
    else recommendation = "KEEP";

    columnImpacts.push({
      column: flagged.column,
      leakageType: flagged.leakageType,
      gapBefore: Math.round(gapBefore * 10) / 10,
      gapAfter: Math.round(gapAfter * 10) / 10,
      impactScore,
      recommendation,
    });

    currentColumns = nextColumns.length > 0 ? nextColumns : currentColumns;
    currentGap = gapAfter;
  }

  // Final clean run: remove all "REMOVE" columns
  const removeSet = new Set(
    columnImpacts
      .filter(c => c.recommendation === "REMOVE")
      .map(c => c.column)
  );

  const cleanCols = columns.filter(
    c => c !== targetColumn && !removeSet.has(c)
  );

  let cleanTrainAccuracy: number;
  let cleanTestAccuracy: number;
  let cleanGap: number;
  let cleanTrainSize: number;
  let cleanTestSize: number;

  if (cleanCols.length > 0) {
    const { X: Xclean, y: yClean } = prepareFeatures(
      rows,
      [...cleanCols, targetColumn],
      targetColumn
    );
    const cleanSplit = trainTestSplit(Xclean, yClean);
    const cleanResult = trainAndScore(
      cleanSplit.XTrain,
      cleanSplit.XTest,
      cleanSplit.yTrain,
      cleanSplit.yTest
    );
    cleanTrainAccuracy = cleanResult.trainAcc;
    cleanTestAccuracy = cleanResult.testAcc;
    cleanGap = cleanResult.gap;
    cleanTrainSize = cleanSplit.XTrain.length;
    cleanTestSize = cleanSplit.XTest.length;
  } else {
    cleanTrainAccuracy = baselineTrainAccuracy;
    cleanTestAccuracy = baselineTestAccuracy;
    cleanGap = baselineGap;
    cleanTrainSize = XTrain.length;
    cleanTestSize = XTest.length;
  }

  return {
    baselineTrainAccuracy,
    baselineTestAccuracy,
    baselineGap,
    cleanTrainAccuracy,
    cleanTestAccuracy,
    cleanGap,
    columnImpacts,
    modelType: "DecisionTree",
    problemType,
    rowsUsed: rows.length,
    trainSize: cleanTrainSize,
    testSize: cleanTestSize,
    durationMs: Date.now() - start,
  };
}
