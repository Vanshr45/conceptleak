// Realistic ML dataset fixtures.

const RISK = {
  CRITICAL: { key: 'CRITICAL', label: 'CRITICAL', color: 'var(--critical)', text: '#fecaca', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.35)' },
  HIGH:     { key: 'HIGH',     label: 'HIGH',     color: 'var(--high)',     text: '#fed7aa', bg: 'rgba(249,115,22,0.10)', border: 'rgba(249,115,22,0.35)' },
  MEDIUM:   { key: 'MEDIUM',   label: 'MEDIUM',   color: 'var(--medium)',   text: '#fde68a', bg: 'rgba(234,179,8,0.10)',  border: 'rgba(234,179,8,0.35)' },
  LOW:      { key: 'LOW',      label: 'LOW',      color: 'var(--low)',      text: '#bbf7d0', bg: 'rgba(34,197,94,0.10)',  border: 'rgba(34,197,94,0.35)' },
  CLEAN:    { key: 'CLEAN',    label: 'CLEAN',    color: '#4a5568', text: '#cbd5e1', bg: 'rgba(120,130,160,0.06)', border: 'rgba(120,130,160,0.25)' },
};

const LEAKAGE_TYPES = {
  ID:     { label: 'Direct ID Leakage',  icon: 'Hash' },
  PII:    { label: 'PII Leakage',        icon: 'Lock' },
  TARGET: { label: 'Target Correlation', icon: 'Target' },
  TEMPORAL: { label: 'Temporal Leakage', icon: 'Clock' },
};

// The hero dataset — heart.csv with realistic critical findings.
const HEART_FINDINGS = [
  {
    id: 'f1',
    severity: 'CRITICAL',
    column: 'patient_diagnosis_code',
    type: 'TARGET',
    score: 98,
    description:
      'Column has 0.97 Pearson correlation with the target label `heart_disease`. This column is effectively a re-encoding of the label — any model trained with it will achieve near-perfect validation accuracy but fail in production where diagnosis codes are not available at inference time.',
    affectedRows: 1025,
    fix: {
      language: 'python',
      code:
`# Drop the leaking column before the train/test split
LEAKED = ["patient_diagnosis_code"]
df = df.drop(columns=LEAKED)

# Re-fit the pipeline without the leaked signal
X = df.drop(columns=["heart_disease"])
y = df["heart_disease"]
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)`,
    },
  },
  {
    id: 'f2',
    severity: 'CRITICAL',
    column: 'patient_id',
    type: 'ID',
    score: 94,
    description:
      '`patient_id` is a unique identifier present in both the training and held-out splits of the source file. IDs carry no generalizable signal and cause models to memorize individuals rather than learn patterns.',
    affectedRows: 1025,
    fix: {
      language: 'python',
      code:
`# IDs are never features. Drop before modeling.
df = df.drop(columns=["patient_id"])

# If you need them for grouping in CV, use GroupKFold
# with the ID as the group key *before* dropping:
groups = df.pop("patient_id")
cv = GroupKFold(n_splits=5).split(X, y, groups)`,
    },
  },
  {
    id: 'f3',
    severity: 'CRITICAL',
    column: 'attending_physician_email',
    type: 'PII',
    score: 91,
    description:
      'Email-format values detected in 1,024 of 1,025 rows. PII must not enter model training — legal risk under HIPAA / GDPR, and the field encodes per-provider treatment patterns that bias the model to specific clinicians.',
    affectedRows: 1024,
    fix: {
      language: 'python',
      code:
`# Anonymize before training. Hash, don't drop, if you
# need to preserve provider-level cohorts.
import hashlib

def anon(v):
    return hashlib.sha256(v.encode()).hexdigest()[:12]

df["provider_hash"] = df["attending_physician_email"].map(anon)
df = df.drop(columns=["attending_physician_email"])`,
    },
  },
  {
    id: 'f4',
    severity: 'HIGH',
    column: 'follow_up_visit_date',
    type: 'TEMPORAL',
    score: 82,
    description:
      'This timestamp occurs *after* the prediction target was recorded in 83% of rows. Using post-event features leaks future information and inflates offline metrics that disappear in production.',
    affectedRows: 853,
    fix: {
      language: 'python',
      code:
`# Only use timestamps that exist at prediction time.
CUTOFF = "event_ts"
df = df[df["follow_up_visit_date"] <= df[CUTOFF]]

# Or compute a pre-event feature instead:
df["days_since_admission"] = (
    df["event_ts"] - df["admission_ts"]
).dt.days`,
    },
  },
  {
    id: 'f5',
    severity: 'HIGH',
    column: 'insurance_claim_approved',
    type: 'TARGET',
    score: 76,
    description:
      'Pearson correlation of 0.71 with target. Claim approval frequently post-dates the diagnosis being predicted, which suggests temporal leakage as well.',
    affectedRows: 1025,
    fix: {
      language: 'python',
      code:
`# Verify temporality before keeping. If the claim is
# approved AFTER the prediction horizon, drop it.
LEAKS_FORWARD = (df["claim_ts"] > df["predict_ts"]).mean()
if LEAKS_FORWARD > 0.05:
    df = df.drop(columns=["insurance_claim_approved"])`,
    },
  },
  {
    id: 'f6',
    severity: 'MEDIUM',
    column: 'zipcode',
    type: 'PII',
    score: 54,
    description:
      '5-digit US zip codes can act as a quasi-identifier when combined with demographics. Consider binning to first 3 digits or using region codes.',
    affectedRows: 1025,
    fix: {
      language: 'python',
      code:
`# Reduce granularity to mitigate re-identification risk
df["zip3"] = df["zipcode"].astype(str).str[:3]
df = df.drop(columns=["zipcode"])`,
    },
  },
  {
    id: 'f7',
    severity: 'MEDIUM',
    column: 'age',
    type: 'TARGET',
    score: 48,
    description:
      'Age shows 0.42 correlation with target. This is within the expected range for clinical data but worth monitoring for subgroup bias.',
    affectedRows: 1025,
    fix: null,
  },
  {
    id: 'f8',
    severity: 'LOW',
    column: 'resting_bp',
    type: 'TARGET',
    score: 22,
    description:
      'Mild correlation, legitimate clinical feature. No action required.',
    affectedRows: 1025,
    fix: null,
  },
];

const HEART_COLUMNS = [
  { name: 'patient_id',                 severity: 'CRITICAL', type: 'int64' },
  { name: 'patient_diagnosis_code',     severity: 'CRITICAL', type: 'object' },
  { name: 'attending_physician_email',  severity: 'CRITICAL', type: 'object' },
  { name: 'follow_up_visit_date',       severity: 'HIGH',     type: 'datetime' },
  { name: 'insurance_claim_approved',   severity: 'HIGH',     type: 'bool' },
  { name: 'zipcode',                    severity: 'MEDIUM',   type: 'object' },
  { name: 'age',                        severity: 'MEDIUM',   type: 'int64' },
  { name: 'sex',                        severity: 'CLEAN',    type: 'object' },
  { name: 'chest_pain_type',            severity: 'CLEAN',    type: 'object' },
  { name: 'resting_bp',                 severity: 'LOW',      type: 'float64' },
  { name: 'cholesterol',                severity: 'CLEAN',    type: 'float64' },
  { name: 'fasting_blood_sugar',        severity: 'CLEAN',    type: 'bool' },
  { name: 'resting_ecg',                severity: 'CLEAN',    type: 'object' },
  { name: 'max_heart_rate',             severity: 'CLEAN',    type: 'float64' },
  { name: 'exercise_angina',            severity: 'CLEAN',    type: 'bool' },
  { name: 'st_depression',              severity: 'CLEAN',    type: 'float64' },
  { name: 'slope',                      severity: 'CLEAN',    type: 'object' },
  { name: 'num_major_vessels',          severity: 'CLEAN',    type: 'int64' },
  { name: 'thal',                       severity: 'CLEAN',    type: 'object' },
  { name: 'heart_disease',              severity: 'CLEAN',    type: 'bool', isTarget: true },
];

// Dataset list. The first is "heart.csv", the current active dataset.
const DATASETS = [
  {
    id: 'd1',
    name: 'heart.csv',
    size: '142 KB',
    rows: 1025,
    columns: 20,
    score: 93,
    severity: 'CRITICAL',
    uploaded: '12 min ago',
    findings: HEART_FINDINGS,
    columnList: HEART_COLUMNS,
    breakdown: { CRITICAL: 3, HIGH: 2, MEDIUM: 2, LOW: 1, CLEAN: 12 },
    targetCol: 'heart_disease',
  },
  {
    id: 'd2',
    name: 'churn_q3_2025.xlsx',
    size: '2.4 MB',
    rows: 48210,
    columns: 34,
    score: 71,
    severity: 'HIGH',
    uploaded: '2 hr ago',
    breakdown: { CRITICAL: 0, HIGH: 4, MEDIUM: 3, LOW: 2, CLEAN: 25 },
  },
  {
    id: 'd3',
    name: 'ad_clicks_sample.csv',
    size: '8.1 MB',
    rows: 250000,
    columns: 18,
    score: 41,
    severity: 'MEDIUM',
    uploaded: 'yesterday',
    breakdown: { CRITICAL: 0, HIGH: 1, MEDIUM: 3, LOW: 4, CLEAN: 10 },
  },
  {
    id: 'd4',
    name: 'housing_prices_kc.csv',
    size: '1.8 MB',
    rows: 21613,
    columns: 21,
    score: 18,
    severity: 'LOW',
    uploaded: '3 days ago',
    breakdown: { CRITICAL: 0, HIGH: 0, MEDIUM: 1, LOW: 3, CLEAN: 17 },
  },
  {
    id: 'd5',
    name: 'credit_default_raw.csv',
    size: '4.2 MB',
    rows: 30000,
    columns: 25,
    score: 67,
    severity: 'HIGH',
    uploaded: '4 days ago',
    breakdown: { CRITICAL: 0, HIGH: 3, MEDIUM: 4, LOW: 2, CLEAN: 16 },
  },
  {
    id: 'd6',
    name: 'mnist_flat_export.csv',
    size: '112 MB',
    rows: 70000,
    columns: 785,
    score: 12,
    severity: 'LOW',
    uploaded: '1 week ago',
    breakdown: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 1, CLEAN: 784 },
  },
];

const STATS = {
  totalDatasets: 6,
  criticalIssues: 3,
  avgRiskScore: 50,
  columnsScanned: 903,
};

Object.assign(window, { RISK, LEAKAGE_TYPES, DATASETS, HEART_FINDINGS, HEART_COLUMNS, STATS });
