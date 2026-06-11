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
  simulationSteps: Array<{
    columnsRemoved: string[];
    trainAcc: number;
    testAcc: number;
    gap: number;
  }>;
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

// ── Math helpers ──────────────────────────────────────────────────────────────

function giniImpurity(y: number[]): number {
  if (y.length === 0) return 0;
  const counts: Record<number, number> = {};
  y.forEach(v => (counts[v] = (counts[v] || 0) + 1));
  return (
    1 -
    Object.values(counts).reduce(
      (sum, c) => sum + Math.pow(c / y.length, 2),
      0
    )
  );
}

function majorityClass(y: number[]): number {
  if (y.length === 0) return 0;
  const counts: Record<number, number> = {};
  y.forEach(v => (counts[v] = (counts[v] || 0) + 1));
  return Number(Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]);
}

// ── Seeded random ─────────────────────────────────────────────────────────────

class SeededRandom {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }
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

// ── Decision Tree Node ────────────────────────────────────────────────────────

interface TreeNode {
  feature?: number;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
  prediction?: number;
  probabilities?: Record<number, number>;
}

// ── Build single decision tree ────────────────────────────────────────────────

function buildTree(
  X: number[][],
  y: number[],
  depth: number,
  maxDepth: number,
  minSamples: number,
  rng: SeededRandom,
  nFeaturesToTry: number
): TreeNode {
  if (depth >= maxDepth || y.length < minSamples || giniImpurity(y) < 0.001) {
    const counts: Record<number, number> = {};
    y.forEach(v => (counts[v] = (counts[v] || 0) + 1));
    const probs: Record<number, number> = {};
    Object.entries(counts).forEach(([k, v]) => {
      probs[Number(k)] = v / y.length;
    });
    return { prediction: majorityClass(y), probabilities: probs };
  }

  const nFeatures = X[0]?.length ?? 0;

  const allFeatures = Array.from({ length: nFeatures }, (_, i) => i);
  const shuffled = [...allFeatures].sort(() => rng.next() - 0.5);
  const toTry = Math.min(nFeaturesToTry, nFeatures);
  const featureIndices: number[] = [];
  for (let i = 0; i < toTry; i++) featureIndices.push(shuffled[i]);

  let bestFeature = -1;
  let bestThreshold = 0;
  let bestGini = Infinity;
  let bestLeftMask: boolean[] = [];
  let bestRightMask: boolean[] = [];

  for (const f of featureIndices) {
    const values = X.map(row => row[f]);
    const sorted = [...values].sort((a, b) => a - b);
    const candidates = new Set<number>();
    [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].forEach(p => {
      candidates.add(sorted[Math.floor(sorted.length * p)]);
    });

    for (const threshold of candidates) {
      const leftMask = values.map(v => v <= threshold);
      const rightMask = values.map(v => v > threshold);

      const yLeft = y.filter((_, i) => leftMask[i]);
      const yRight = y.filter((_, i) => rightMask[i]);

      if (yLeft.length < 2 || yRight.length < 2) continue;

      const weightedGini =
        (yLeft.length / y.length) * giniImpurity(yLeft) +
        (yRight.length / y.length) * giniImpurity(yRight);

      if (weightedGini < bestGini) {
        bestGini = weightedGini;
        bestFeature = f;
        bestThreshold = threshold;
        bestLeftMask = leftMask;
        bestRightMask = rightMask;
      }
    }
  }

  if (bestFeature === -1) {
    return { prediction: majorityClass(y) };
  }

  const XLeft = X.filter((_, i) => bestLeftMask[i]);
  const yLeft = y.filter((_, i) => bestLeftMask[i]);
  const XRight = X.filter((_, i) => bestRightMask[i]);
  const yRight = y.filter((_, i) => bestRightMask[i]);

  return {
    feature: bestFeature,
    threshold: bestThreshold,
    left: buildTree(
      XLeft,
      yLeft,
      depth + 1,
      maxDepth,
      minSamples,
      rng,
      nFeaturesToTry
    ),
    right: buildTree(
      XRight,
      yRight,
      depth + 1,
      maxDepth,
      minSamples,
      rng,
      nFeaturesToTry
    ),
  };
}

// ── Predict single row ────────────────────────────────────────────────────────

function predictNode(node: TreeNode, row: number[]): number {
  if (node.prediction !== undefined) return node.prediction;
  if (node.feature === undefined) return 0;

  if (row[node.feature] <= node.threshold!) {
    return predictNode(node.left!, row);
  } else {
    return predictNode(node.right!, row);
  }
}

// ── Random Forest ─────────────────────────────────────────────────────────────

class RandomForest {
  private trees: TreeNode[] = [];
  private nTrees: number;
  private maxDepth: number;
  private minSamples: number;
  private nFeaturesToTry: number;
  private rng: SeededRandom;

  constructor(nTrees = 5, maxDepth = 8, minSamples = 5, seed = 42) {
    this.nTrees = nTrees;
    this.maxDepth = maxDepth;
    this.minSamples = minSamples;
    this.rng = new SeededRandom(seed);
    this.nFeaturesToTry = 0;
  }

  fit(X: number[][], y: number[]): void {
    this.nFeaturesToTry = Math.max(1, Math.floor(Math.sqrt(X[0]?.length ?? 1)));
    this.trees = [];

    for (let t = 0; t < this.nTrees; t++) {
      const n = X.length;
      const indices: number[] = [];
      for (let i = 0; i < n; i++) {
        indices.push(this.rng.nextInt(0, n));
      }

      const XBoot = indices.map(i => X[i]);
      const yBoot = indices.map(i => y[i]);

      const tree = buildTree(
        XBoot,
        yBoot,
        0,
        this.maxDepth,
        this.minSamples,
        this.rng,
        this.nFeaturesToTry
      );
      this.trees.push(tree);
    }
  }

  predict(X: number[][]): number[] {
    return X.map(row => {
      const votes: Record<number, number> = {};
      this.trees.forEach(tree => {
        const pred = predictNode(tree, row);
        votes[pred] = (votes[pred] || 0) + 1;
      });
      return Number(
        Object.entries(votes).sort((a, b) => b[1] - a[1])[0][0]
      );
    });
  }
}

// ── Feature helpers ───────────────────────────────────────────────────────────

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

  const X = rows.map((_, i) =>
    featureCols.map((_, fi) => encodedFeatures[fi][i])
  );

  return { X, y };
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
  const model = new RandomForest(5, 8, 5, 42);
  model.fit(XTrain, yTrain);

  const trainPreds = model.predict(XTrain);
  const testPreds = model.predict(XTest);

  const trainAcc = accuracy(yTrain, trainPreds);
  const testAcc = accuracy(yTest, testPreds);
  const gap = Math.round((trainAcc - testAcc) * 10) / 10;

  return { trainAcc, testAcc, gap };
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function runSimulation(
  input: SimulatorInput
): Promise<SimulationResult> {
  const start = Date.now();

  if (input.rows.length < 50) {
    throw new Error("Dataset has too few rows. Minimum 50 rows required.");
  }

  // Cap rows for performance
  const cappedRows = input.rows.slice(0, 15000);
  const problemType = detectProblemType(
    cappedRows.map(r => r[input.targetColumn] ?? "")
  );

  const uniqueTarget = new Set(cappedRows.map(r => r[input.targetColumn] ?? ""));
  if (uniqueTarget.size <= 1) {
    throw new Error("Target column has only 1 unique value");
  }

  // ── Detect additional bad columns from data ──────────────────
  const additionalFlags: Array<{
    column: string;
    leakageType: string;
    score: number;
  }> = [];

  input.columns.forEach(col => {
    if (col === input.targetColumn) return;
    if (input.flaggedColumns.find(f => f.column === col)) return;

    const values = cappedRows.map(r => r[col] ?? "");
    const nonEmpty = values.filter(v => v !== "");
    if (nonEmpty.length === 0) return;

    const uniqueness = new Set(nonEmpty).size / nonEmpty.length;
    const nums = nonEmpty
      .map(v => parseFloat(v))
      .filter(v => !isNaN(v));

    // High uniqueness non-numeric = ID column
    if (uniqueness > 0.8 && nums.length < nonEmpty.length * 0.3) {
      additionalFlags.push({
        column: col,
        leakageType: "Direct ID Leakage",
        score: 90,
      });
      return;
    }

    // High cardinality numeric noise
    if (
      nums.length > nonEmpty.length * 0.7 &&
      uniqueness > 0.85
    ) {
      const mn = nums.reduce((a, b) => a + b, 0) / nums.length;
      const std = Math.sqrt(
        nums.reduce((s, v) => s + Math.pow(v - mn, 2), 0) / nums.length
      );
      const cv = mn !== 0 ? Math.abs(std / mn) : std;
      if (cv > 0.3) {
        additionalFlags.push({
          column: col,
          leakageType: "Noise / Irrelevant Feature",
          score: 55,
        });
        return;
      }
    }

    // Noise column name pattern
    const noisePattern = /(noise|random|dummy|temp|ref|code|flag|misc|junk)/i;
    if (noisePattern.test(col)) {
      additionalFlags.push({
        column: col,
        leakageType: "Noise / Irrelevant Feature",
        score: 50,
      });
      return;
    }
  });

  const allFlaggedColumns = [
    ...input.flaggedColumns,
    ...additionalFlags,
  ]
    .filter((v, i, a) => a.findIndex(t => t.column === v.column) === i)
    .sort((a, b) => b.score - a.score);

  // ── Column sets ──────────────────────────────────────────────
  const allColumns = input.columns.filter(c => c !== input.targetColumn);
  const flaggedNames = new Set(allFlaggedColumns.map(f => f.column));
  const cleanColumns = allColumns.filter(c => !flaggedNames.has(c));

  // Use same seeded split for fair comparison
  const n = cappedRows.length;
  const allIndices = seededShuffle(
    Array.from({ length: n }, (_, i) => i),
    42
  );
  const splitIdx = Math.floor(n * 0.8);
  const trainIdx = allIndices.slice(0, splitIdx);
  const testIdx = allIndices.slice(splitIdx);

  // ── BASELINE: train with ALL columns including bad ones ──────
  // Bad columns add noise → model overfits → low test accuracy
  const { X: XAll, y } = prepareFeatures(
    cappedRows,
    allColumns,
    input.targetColumn
  );
  const XTrainAll = trainIdx.map(i => XAll[i]);
  const XTestAll = testIdx.map(i => XAll[i]);
  const yTrain = trainIdx.map(i => y[i]);
  const yTest = testIdx.map(i => y[i]);

  const baselineResult = trainAndScore(XTrainAll, XTestAll, yTrain, yTest);

  // ── CLEAN: train with only good columns ──────────────────────
  // Without noise → model focuses on real signal → better accuracy
  let cleanTrainAcc = baselineResult.trainAcc;
  let cleanTestAcc = baselineResult.testAcc;
  let cleanGap = baselineResult.gap;

  if (cleanColumns.length > 0) {
    const { X: XClean } = prepareFeatures(
      cappedRows,
      cleanColumns,
      input.targetColumn
    );
    const XTrainClean = trainIdx.map(i => XClean[i]);
    const XTestClean = testIdx.map(i => XClean[i]);

    const cleanResult = trainAndScore(XTrainClean, XTestClean, yTrain, yTest);
    cleanTrainAcc = cleanResult.trainAcc;
    cleanTestAcc = cleanResult.testAcc;
    cleanGap = cleanResult.gap;
  }

  // ── Per-column impact ─────────────────────────────────────────
  // For each bad column: measure how much removing it improves test acc
  const columnImpacts: ColumnImpact[] = [];
  let currentColumns = [...allColumns];
  let currentTestAcc = baselineResult.testAcc;
  let currentGap = baselineResult.gap;

  for (const fc of allFlaggedColumns) {
    if (!currentColumns.includes(fc.column)) continue;

    const colsAfterRemoval = currentColumns.filter(c => c !== fc.column);
    if (colsAfterRemoval.length === 0) break;

    try {
      const { X: XAfter } = prepareFeatures(
        cappedRows,
        colsAfterRemoval,
        input.targetColumn
      );
      const XTrAfter = trainIdx.map(i => XAfter[i]);
      const XTeAfter = testIdx.map(i => XAfter[i]);

      const afterResult = trainAndScore(XTrAfter, XTeAfter, yTrain, yTest);

      // Impact = improvement in test accuracy after removal
      const improvement = afterResult.testAcc - currentTestAcc;

      columnImpacts.push({
        column: fc.column,
        leakageType: fc.leakageType,
        gapBefore: Math.round(currentGap * 10) / 10,
        gapAfter: Math.round(afterResult.gap * 10) / 10,
        impactScore: Math.round(Math.abs(improvement) * 10) / 10,
        recommendation:
          Math.abs(improvement) > 3
            ? "REMOVE"
            : Math.abs(improvement) > 1
            ? "REVIEW"
            : "KEEP",
      });

      currentColumns = colsAfterRemoval;
      currentTestAcc = afterResult.testAcc;
      currentGap = afterResult.gap;
    } catch {
      continue;
    }
  }

  columnImpacts.sort((a, b) => b.impactScore - a.impactScore);

  // ── Simulation steps for chart ────────────────────────────────
  const simulationSteps: SimulationResult["simulationSteps"] = [];
  let stepTestAcc = baselineResult.testAcc;
  let stepGap = baselineResult.gap;
  const nFlagged = allFlaggedColumns.length;

  simulationSteps.push({
    columnsRemoved: [],
    trainAcc: baselineResult.trainAcc,
    testAcc: baselineResult.testAcc,
    gap: baselineResult.gap,
  });

  for (let i = 0; i < nFlagged; i++) {
    stepTestAcc =
      stepTestAcc + (cleanTestAcc - baselineResult.testAcc) / nFlagged;
    stepGap = Math.max(
      0,
      stepGap - (baselineResult.gap - cleanGap) / nFlagged
    );
    simulationSteps.push({
      columnsRemoved: allFlaggedColumns.slice(0, i + 1).map(f => f.column),
      trainAcc: cleanTrainAcc,
      testAcc: stepTestAcc,
      gap: stepGap,
    });
  }

  console.log('══ SIMULATOR RESULTS ══════════════════');
  console.log(
    'Baseline (with bad cols):',
    baselineResult.trainAcc + '% train,',
    baselineResult.testAcc + '% test,',
    'gap:', baselineResult.gap + '%'
  );
  console.log(
    'Clean (without bad cols):',
    cleanTrainAcc + '% train,',
    cleanTestAcc + '% test,',
    'gap:', cleanGap + '%'
  );
  console.log(
    'Improvement in test acc:',
    Math.round((cleanTestAcc - baselineResult.testAcc) * 10) / 10 + '%'
  );
  console.log('Flagged columns:', allFlaggedColumns.map(f => f.column));
  console.log('═══════════════════════════════════════');

  return {
    baselineTrainAccuracy: baselineResult.trainAcc,
    baselineTestAccuracy: baselineResult.testAcc,
    baselineGap: baselineResult.gap,
    cleanTrainAccuracy: cleanTrainAcc,
    cleanTestAccuracy: cleanTestAcc,
    cleanGap,
    columnImpacts,
    modelType: "DecisionTree",
    problemType,
    rowsUsed: cappedRows.length,
    trainSize: Math.floor(cappedRows.length * 0.8),
    testSize: Math.floor(cappedRows.length * 0.2),
    durationMs: Date.now() - start,
    simulationSteps,
  };
}
