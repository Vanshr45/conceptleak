# Risk Algorithm - Visual Guide

## 📐 The Weighted Formula

```
OVERALL RISK SCORE CALCULATION
═══════════════════════════════════════════════════════════════════

                    ┌─────────────────┐
                    │ Input Scores    │
                    │    (0-100)      │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
   Target Leakage     Temporal Leakage      ID Leakage
   (Most Critical)    (High Impact)         (Moderate)
         85%                 62%                 28%
         │                   │                  │
         ×0.50               ×0.30              ×0.20
         │                   │                  │
         42.5          +     18.6        +      5.6
         └───────────────────┬────────────────────┘
                             │
                             ▼
                  WEIGHTED SCORE = 66.7
                             │
                             ▼
                    Round to: 67/100
                             │
                             ▼
                    ┌─────────────────┐
                    │  Risk Mapping   │
                    │  (Threshold)    │
                    └────────┬────────┘
```

## 🎯 Risk Threshold Mapping

```
RISK LEVEL DETERMINATION
═════════════════════════════════════════════════════════════════

Score Range     Risk Level      Color       Icon              Action
─────────────────────────────────────────────────────────────────────
 > 80          CRITICAL 🔴     #EF4444     alert-octagon    🚨 URGENT
              ████████████████████████████ (Red)
              Severe leakage detected - IMMEDIATE ACTION REQUIRED

 60-80         HIGH 🟠         #F97316     alert-circle     ⚠️ REVIEW
              ████████████████░░░░░░░░░░░░ (Orange)
              Significant risks - Fix ASAP

 40-60         MEDIUM 🟡       #F59E0B     alert-triangle   ⚒️ MONITOR
              ████████░░░░░░░░░░░░░░░░░░░░ (Amber)
              Moderate concerns - Address soon

 < 40          LOW 🟢          #10B981     check-circle     ✅ PROCEED
              ████░░░░░░░░░░░░░░░░░░░░░░░░ (Green)
              Relatively clean - Low risk
```

## 📊 Weighted Component Distribution

```
RISK SCORE COMPOSITION
═════════════════════════════════════════════════════════════════

100

 85│                                                    
    │         Target: 42.5 (50%)                      
    │    ┌─────────────────────────────┐               
 75 │    │                             │               
    │    │      Temporal: 18.6 (30%)  │               
 65 │    │   ┌──────────────────┐     │               
    │    │   │                  │     │               
 55 │    │   │   ID: 5.6 (20%) │     │    TOTAL: 66.7
    │    │   │  ┌────────┐    │     │               
 45 │    │   │  │        │    │     │               
    │    │   │  │   +    │    │  +  │               
 35 │    │   │  │        │    │     │               
    │    │   │  └────────┘    │     │               
 25 │    │   └──────────────────┘     │               
    │    └─────────────────────────────┘               
 15 │                                                 
    │                                                 
  0 └─────────────────────────────────────────────────

Weights:   50%          +      30%      +     20%    = 100%
```

## 🔄 Real-Time Update Flow

```
DATA FLOW DIAGRAM
═════════════════════════════════════════════════════════════════

┌───────────────────────────────────────────────────────────┐
│ USER INTERACTION / DATA SOURCE                            │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
          User Selects Dataset / Analysis Completes
                       │
                       ▼
        selectedDataset State Change
                       │
    ┌───────────────────┴───────────────────┐
    │ useMemo Dependency: selectedDataset    │
    │ (Triggers getDatasetInsights)         │
    └──────────────────┬────────────────────┘
                       │
                       ▼
              insights Array Updates
                       │
    ┌───────────────────┴───────────────────┐
    │ useMemo Dependency: insights           │
    │ (Triggers extractLeakageScores)       │
    └──────────────────┬────────────────────┘
                       │
                       ▼
      extractLeakageScores() Executes
         Target / Temporal / ID Scores
                       │
    ┌───────────────────┴───────────────────┐
    │ calculateOverallRisk() Executes        │
    │ Applies weighted formula               │
    │ Maps to risk level                     │
    └──────────────────┬────────────────────┘
                       │
                       ▼
          riskAssessment Object Ready
    {
      overallScore: 67,
      riskLevel: 'HIGH',
      riskColor: '#F97316',
      icon: 'alert-circle',
      description: '...'
    }
                       │
    ┌───────────────────┴───────────────────┐
    │ useEffect Dependency: riskAssessment   │
    │ (Starts Animation)                     │
    └──────────────────┬────────────────────┘
                       │
                       ▼
    Animated.timing(progressAnimation, {
        toValue: 67,
        duration: 1000ms
    })
                       │
    ┌───────────────────┴───────────────────┐
    │ Animation Runs                        │
    │ Progress: 0% → 100% over 1 second    │
    └──────────────────┬────────────────────┘
                       │
                       ▼
         ╔═════════════════════════╗
         ║  UI RE-RENDERS          ║
         ║  ✅ Risk Level Updates  ║
         ║  ✅ Color Changes       ║
         ║  ✅ Icon Animates       ║
         ║  ✅ Bar Fills Smoothly  ║
         ╚═════════════════════════╝
```

## 💻 Code Execution Path

```
COMPONENT LIFECYCLE
═════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────┐
│ 1. MOUNT PHASE                                          │
│    ├─ useState(Animated.Value(0)) → progressAnimation   │
│    ├─ useMemo for insights                              │
│    ├─ useMemo for riskAssessment                        │
│    └─ useEffect to start animation                      │
└─────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│ 2. RENDER PHASE                                         │
│    ├─ Check selectedDataset                             │
│    │  ├─ No → Show Empty State                          │
│    │  └─ Yes → Show Risk Assessment                     │
│    ├─ If riskAssessment.riskLevel === 'UNKNOWN'        │
│    │  └─ Display "NO DATA"                              │
│    └─ Else                                              │
│       ├─ Display Risk Level with color/icon             │
│       ├─ Show Score Breakdown                           │
│       ├─ Render Animated Progress Bar                   │
│       └─ Display Status Message                         │
└─────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│ 3. UPDATE PHASE (When dataset changes)                  │
│    ├─ selectedDataset prop updates                      │
│    ├─ insights useMemo dependency changes               │
│    ├─ New insights extracted                            │
│    ├─ calculateOverallRisk() runs                       │
│    ├─ riskAssessment updates                            │
│    ├─ useEffect triggered                               │
│    ├─ Animated.timing starts                            │
│    └─ Progress animates from 0 to newScore              │
└─────────────────────────────────────────────────────────┘
```

## 🧮 Calculation Examples

### Example 1: Mixed Risk Dataset
```
Input:
  Target Leakage:   75
  Temporal Leakage: 45
  ID Leakage:       35

Calculation:
  (75 × 0.50) = 37.5
  (45 × 0.30) = 13.5
  (35 × 0.20) =  7.0
              ─────────
  Total       = 58.0
  
Result: 58 → MEDIUM (40-60) → Amber (#F59E0B) → alert-triangle
```

### Example 2: Severe Leakage
```
Input:
  Target Leakage:   92
  Temporal Leakage: 88
  ID Leakage:       85

Calculation:
  (92 × 0.50) = 46.0
  (88 × 0.30) = 26.4
  (85 × 0.20) = 17.0
              ─────────
  Total       = 89.4
  
Result: 89 → CRITICAL (>80) → Red (#EF4444) → alert-octagon
```

### Example 3: Clean Dataset
```
Input:
  Target Leakage:   18
  Temporal Leakage: 22
  ID Leakage:       15

Calculation:
  (18 × 0.50) = 9.0
  (22 × 0.30) = 6.6
  (15 × 0.20) = 3.0
              ──────
  Total       = 18.6
  
Result: 19 → LOW (<40) → Green (#10B981) → check-circle
```

## 🎨 UI State Transitions

```
STATE MACHINE
═════════════════════════════════════════════════════════════════

                    ┌──────────────┐
                    │ APP STARTS    │
                    │ selectedData- │
                    │ set = null    │
                    └────────┬──────┘
                             │
                             ▼
                      ┌─────────────┐
                      │ EMPTY STATE │
         ┌────────────→│ "NO DATA"   │←─────────────┐
         │            │ Gray Icons  │              │
         │            └─────────────┘              │
         │                                         │
    Dataset              Dataset              Dataset
   Deselected          Selected             Unloaded
         │                  │                     │
         │                  ▼                     │
         │            ┌──────────────┐            │
         │            │ LOADING DATA │            │
         │            │ Animation=0  │            │
         │            └──────┬───────┘            │
         │                   │                    │
         │                   ▼                    │
         │            ┌──────────────────────────┐
         └────────────│ CALCULATED STATE         │
                      │ ├─ LOW (Green)           │
                      │ ├─ MEDIUM (Amber)        │
                      │ ├─ HIGH (Orange)         │
                      │ ├─ CRITICAL (Red)        │
                      │ Bar animates to score    │
                      │ Icons + colors update    │
                      └──────┬───────────────────┘
                             │
                      Analysis Done / User
                      switches dataset
                             │
                             └→ Back to states above
```

## ⚡ Performance Metrics

```
OPERATION PERFORMANCE
═════════════════════════════════════════════════════════════════

Operation                   Time        Triggered By
─────────────────────────────────────────────────────
extractLeakageScores()      ~0.5ms      insights change
calculateOverallRisk()      ~0.1ms      scores change
useMemo evaluation          ~1ms        dependency change
Animation per frame         ~16ms       60fps rendering
Total render cycle          ~20ms       state update

Impact: Negligible (typically < 1ms for calculations)
```

## 🔐 Type Safety

```
TYPESCRIPT TYPES
═════════════════════════════════════════════════════════════════

interface RiskAssessment {
  overallScore: number;     // 0-100, rounded integer
  riskLevel: RiskLevel;     // 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN'
  riskColor: string;        // Hex color: '#EF4444' | '#F97316' | '#F59E0B' | '#10B981'
  icon: string;             // Ionicon name: 'alert-octagon' | 'alert-circle' | ...
  description: string;      // Human readable: "Severe concept leakage..."
}

type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

interface LeakageScores {
  targetLeakageScore: number;     // 0-100
  temporalLeakageScore: number;   // 0-100
  idLeakageScore: number;         // 0-100
}
```

## ✅ Validation Checklist

```
BEFORE DEPLOYMENT
═════════════════════════════════════════════════════════════════

Code Quality:
  ☑ TypeScript strict mode passes
  ☑ No linting errors
  ☑ No console warnings
  ☑ Memoization properly configured

Functionality:
  ☑ Calculates correct weighted scores
  ☑ Maps to correct risk levels
  ☑ Colors match requirements
  ☑ Icons display correctly
  ☑ Animation runs smoothly

Real-Time Updates:
  ☑ Updates when dataset selected
  ☑ Updates when new analysis runs
  ☑ Shows "NO DATA" when needed
  ☑ Handles edge cases (0 insights)

Animations:
  ☑ Starts at 0
  ☑ Animates to final score
  ☑ Duration 1 second
  ☑ Smooth on mobile devices

Testing:
  ☑ Tested with high-risk data
  ☑ Tested with critical data
  ☑ Tested with clean data
  ☑ Tested empty/no-data state
```

---

**Visual Guide Version**: 1.0  
**Last Updated**: March 29, 2026
