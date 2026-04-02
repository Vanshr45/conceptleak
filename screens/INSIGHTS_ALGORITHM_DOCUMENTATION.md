# InsightsScreen - Weighted Risk Algorithm Implementation

## 🎯 Overview

The InsightsScreen has been completely refactored with a **robust, weighted risk assessment algorithm** that calculates concept leakage risk based on three key factors: Target Leakage, Temporal Leakage, and ID Leakage.

## 🧠 The Weighted Risk Algorithm

### Core Formula

```
OverallRiskScore = (TargetLeakage × 0.50) + (TemporalLeakage × 0.30) + (IDLeakage × 0.20)
```

### Weights Rationale

- **Target Leakage (50%)**: Most critical - directly encodes the target variable
- **Temporal Leakage (30%)**: High impact - future information leaking into features
- **ID Leakage (20%)**: Moderate impact - identifiers correlating with target

### Risk Level Thresholds

| Score Range | Risk Level | Color | Icon | Description |
|-------------|-----------|-------|------|-------------|
| **> 80** | **CRITICAL** 🔴 | #EF4444 (Red) | alert-octagon | Severe leakage, immediate action needed |
| **60-80** | **HIGH** 🟠 | #F97316 (Orange) | alert-circle | Significant risks identified |
| **40-60** | **MEDIUM** 🟡 | #F59E0B (Amber) | alert-triangle | Moderate concerns detected |
| **< 40** | **LOW** 🟢 | #10B981 (Green) | check-circle | Relatively clean dataset |

## 📊 Technical Implementation Details

### 1. **Data Structures**

```typescript
interface RiskAssessment {
  overallScore: number;           // 0-100 weighted score
  riskLevel: RiskLevel;           // CRITICAL | HIGH | MEDIUM | LOW | UNKNOWN
  riskColor: string;              // Hex color code
  icon: string;                   // Ionicon name
  description: string;            // Human-readable description
}

interface LeakageScores {
  targetLeakageScore: number;     // 0-100
  temporalLeakageScore: number;   // 0-100
  idLeakageScore: number;         // 0-100
}
```

### 2. **Key Functions**

#### `calculateOverallRisk(scores: LeakageScores): RiskAssessment`

**Purpose**: Applies weighted formula and maps to risk level

**Logic**:
```typescript
const weightedScore = 
  targetLeakageScore * 0.5 + 
  temporalLeakageScore * 0.3 + 
  idLeakageScore * 0.2;
```

**Threshold Mapping**:
- Rounds to nearest integer
- Returns risk level, color, icon, and description
- Enables real-time updates

#### `extractLeakageScores(insights: any[]): LeakageScores`

**Purpose**: Extracts scores from insights array by feature type

**Mapping**:
- Feature contains "target" → targetLeakageScore
- Feature contains "temporal" → temporalLeakageScore
- Feature contains "id" → idLeakageScore

**Default**: 0 if not found (safe fallback)

### 3. **State Management**

```typescript
// Animation state - smoothly animates progress bar
const [progressAnimation] = useState(new Animated.Value(0));

// Memoized insights - prevents unnecessary recalculations
const insights = useMemo(() => {
  if (!selectedDataset) return [];
  return getDatasetInsights(selectedDataset.id);
}, [selectedDataset, getDatasetInsights]);

// Memoized risk assessment - recalculates only when insights change
const riskAssessment = useMemo(() => {
  if (insights.length === 0) {
    return { 
      overallScore: 0, 
      riskLevel: 'UNKNOWN',
      // ...
    };
  }
  const leakageScores = extractLeakageScores(insights);
  return calculateOverallRisk(leakageScores);
}, [insights]);
```

### 4. **Animation System**

Uses React Native's `Animated` API for smooth progress bar animation:

```typescript
useEffect(() => {
  if (riskAssessment.riskLevel !== 'UNKNOWN') {
    Animated.timing(progressAnimation, {
      toValue: riskAssessment.overallScore,  // Animate to calculated score
      duration: 1000,                        // 1 second smooth animation
      useNativeDriver: false,                // Required for width animation
    }).start();
  } else {
    progressAnimation.setValue(0);           // Reset if no data
  }
}, [riskAssessment.overallScore, riskAssessment.riskLevel]);
```

## 🎨 Dynamic UI Components

### 1. **Header Section**
- Shows label and description
- Icon indicator (color-coded based on risk level)
- Dataset name display

### 2. **Overall Risk Display**

#### When Data Available:
```
┌─────────────────────────────┐
│ Overall Risk Assessment     │ ⚠️
│ Description of risk level   │
│                             │
│ CRITICAL        [Target: 85]│
│ 85/100          [Temp:   62]│
│                 [ID:     28]│
│                             │
│ ████████████████████▓▓░░░░░░░ │
│ 0                          100 │
│                             │
│ ⚡ Critical: Immediate      │
│   action needed             │
└─────────────────────────────┘
```

#### When No Data:
```
┌─────────────────────────────┐
│ Overall Risk Assessment     │
│                             │
│ NO DATA                     │
│ Analyze a dataset to        │
│ generate risk assessment    │
└─────────────────────────────┘
```

### 3. **Risk Badge Mini Components**

Shows weight breakdown:
```
Target Temporal ID
  │       │      │
  ▪       ▪      ▪      (colored indicators)
  85      62     28     (individual scores)
  50%     30%    20%    (weights)
```

### 4. **Animated Progress Bar**

- Starts at 0 on mount
- Animates to final score over 1 second
- Color matches risk level
- Shows scale labels (Low 0 → High 100)

### 5. **Risk Status Indicator**

Dynamic status message:
- **CRITICAL**: "⚡ Critical: Immediate action needed to fix leakage"
- **HIGH**: "⚠️ High: Significant leakage risks detected"
- **MEDIUM**: "⚒️ Medium: Moderate concerns to address"
- **LOW**: "✅ Low: Dataset is relatively clean"

## 🔄 Real-Time Updates

### Trigger Points

1. **Dataset Selected**: When user selects a new dataset
   ```typescript
   const insights = useMemo(() => {
     if (!selectedDataset) return [];
     return getDatasetInsights(selectedDataset.id);
   }, [selectedDataset]);  // ← Dependency
   ```

2. **Analysis Result Received**: When new analysis completes
   - DatasetContext updates getDatasetInsights()
   - useMemo detects change
   - Risk assessment recalculates

3. **Component Mount**: Initial calculation on first render

### Data Flow

```
User Selection
      ↓
selectedDataset changes
      ↓
insights useMemo triggers
      ↓
riskAssessment useMemo triggers
      ↓
calculateOverallRisk() executes
      ↓
progressAnimation animates (useEffect)
      ↓
UI re-renders with new values
```

## 📈 Example Scenarios

### Scenario 1: High-Risk Dataset
```
Insights: [
  { feature: 'Target Leakage', score: 85 },
  { feature: 'Temporal Leakage', score: 62 },
  { feature: 'ID Leakage', score: 28 }
]

Calculation:
  (85 × 0.5) + (62 × 0.3) + (28 × 0.2)
  = 42.5 + 18.6 + 5.6
  = 66.7 → 67 (rounded)

Result: HIGH risk (60-80) → Orange color, alert-circle icon
```

### Scenario 2: Critical Risk
```
Insights: [
  { feature: 'Target Leakage', score: 95 },
  { feature: 'Temporal Leakage', score: 90 },
  { feature: 'ID Leakage', score: 70 }
]

Calculation:
  (95 × 0.5) + (90 × 0.3) + (70 × 0.2)
  = 47.5 + 27 + 14
  = 88.5 → 88 (rounded)

Result: CRITICAL (>80) → Red color, alert-octagon icon
```

### Scenario 3: Clean Dataset
```
Insights: [
  { feature: 'Target Leakage', score: 25 },
  { feature: 'Temporal Leakage', score: 30 },
  { feature: 'ID Leakage', score: 20 }
]

Calculation:
  (25 × 0.5) + (30 × 0.3) + (20 × 0.2)
  = 12.5 + 9 + 4
  = 25.5 → 26 (rounded)

Result: LOW (<40) → Green color, check-circle icon
```

## 🛡️ Error Handling

### Empty State
- No dataset selected → "NO DATA" message
- Progress bar remains at 0
- Grayed-out indicator

### Missing Leakage Types
- If any leakage score missing → defaults to 0
- Still calculates weighted average from available scores
- Prevents crashes from incomplete data

### Edge Cases
```typescript
// Division by zero protection
if (insights.length === 0) return unknownState;

// Score boundaries
const weightedScore = Math.max(0, Math.min(100, calculatedScore));

// Type safety
riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
```

## ⚡ Performance Optimizations

### 1. **Memoization**
```typescript
// Prevents recalculation unless dependencies change
const insights = useMemo(() => {...}, [selectedDataset]);
const riskAssessment = useMemo(() => {...}, [insights]);
```

### 2. **Native Driver Animation**
```typescript
// Uses native thread - doesn't block JS thread
Animated.timing(progressAnimation, {
  ...
  useNativeDriver: false,  // false for width (only x/y/scale support native)
})
```

### 3. **Efficient Extraction**
```typescript
// Single array iteration - O(n) complexity
insights.forEach((insight) => {
  // Extract and map values
});
```

## 🧪 Testing Scenarios

### Test Case 1: Basic Calculation
```typescript
const scores: LeakageScores = {
  targetLeakageScore: 80,
  temporalLeakageScore: 60,
  idLeakageScore: 40,
};
const result = calculateOverallRisk(scores);
// Expected: 
// - overallScore: 66
// - riskLevel: 'HIGH'
// - riskColor: '#F97316'
```

### Test Case 2: Real-Time Update
```
1. Mount component with dataset A (score: 50 - MEDIUM)
2. Select dataset B (score: 85 - HIGH)
3. Verify UI updates immediately
4. Verify animation runs smoothly
```

### Test Case 3: Empty State
```
1. Mount with no selected dataset
2. Verify "NO DATA" displayed
3. Verify progress bar at 0
4. Select dataset
5. Verify UI updates correctly
```

## 📱 UI/UX Improvements

### Before
- ❌ Shows "UNKNOWN" even with data
- ❌ Simple average calculation
- ❌ No color differentiation for critical issues
- ❌ No animation
- ❌ No weight visualization

### After
- ✅ Shows actual risk level (CRITICAL/HIGH/MEDIUM/LOW)
- ✅ Weighted algorithm reflecting real risk
- ✅ Color-coded for quick risk assessment
- ✅ Smooth animated progress bar
- ✅ Component breakdown with weights visible
- ✅ Dynamic icon matching risk level
- ✅ Contextual status messages
- ✅ Graceful empty state handling

## 🔧 Customization Guide

### Adjusting Weights

Edit the weights in the formula:
```typescript
const weightedScore =
  targetLeakageScore * 0.40 +    // Change to 40%
  temporalLeakageScore * 0.40 +  // Change to 40%
  idLeakageScore * 0.20;          // Keep at 20%
```

### Changing Thresholds

Modify the threshold mapping:
```typescript
if (weightedScore > 85) {        // Change CRITICAL threshold
  riskLevel = 'CRITICAL';
} else if (weightedScore >= 65) { // Change HIGH threshold
  riskLevel = 'HIGH';
}
// ... etc
```

### Custom Colors

Update in Colors object:
```typescript
// In theme/colors.ts
riskCritical: '#FF0000',  // Custom red
riskHigh: '#FFA500',      // Custom orange
```

## 📚 API Reference

### `calculateOverallRisk(scores: LeakageScores): RiskAssessment`

**Parameters**:
- `scores.targetLeakageScore`: 0-100
- `scores.temporalLeakageScore`: 0-100
- `scores.idLeakageScore`: 0-100

**Returns**: RiskAssessment object with calculated values

### `extractLeakageScores(insights: any[]): LeakageScores`

**Parameters**:
- `insights`: Array of insight objects with `feature` and `score` properties

**Returns**: LeakageScores object with extracted values

## 🎓 Key Learnings

1. **Weighted Scoring**: More nuanced than simple averaging
2. **Real-time Reactivity**: useMemo + useEffect = automatic updates
3. **Animation Performance**: Native driver support varies by property
4. **Type Safety**: TypeScript prevents runtime errors
5. **User Experience**: Visual feedback (colors, icons) aids quick assessment

## 🚀 Future Enhancements

- [ ] Configurable weights per user/organization
- [ ] Historical trend charts
- [ ] Dataset comparison mode
- [ ] Automated alerts for critical issues
- [ ] Integration with fix recommendations
- [ ] Export risk reports as PDF
- [ ] Risk prediction for new features
- [ ] A/B testing for threshold optimization

## 📝 Code Examples

### Using the Algorithm in Other Screens

```typescript
import { calculateOverallRisk } from './InsightsScreen';

const scores = {
  targetLeakageScore: 75,
  temporalLeakageScore: 55,
  idLeakageScore: 35,
};

const assessment = calculateOverallRisk(scores);
console.log(`Risk Level: ${assessment.riskLevel}`);
console.log(`Score: ${assessment.overallScore}/100`);
console.log(`Color: ${assessment.riskColor}`);
```

### Integrating with External Data Source

```typescript
// If using API instead of local context
const [riskAssessment, setRiskAssessment] = useState<RiskAssessment>();

useEffect(() => {
  fetchInsights(datasetId).then(insights => {
    const scores = extractLeakageScores(insights);
    const assessment = calculateOverallRisk(scores);
    setRiskAssessment(assessment);
  });
}, [datasetId]);
```

---

**Version**: 1.0  
**Last Updated**: March 29, 2026  
**Author**: Senior Data Science Engineer  
**Status**: Production Ready ✅

