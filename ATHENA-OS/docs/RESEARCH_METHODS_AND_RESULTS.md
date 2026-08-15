# Research Methods and Results

## Research architecture

ATHENA now has **two distinct empirical validation domains**. They share the design philosophy of personalization, temporal history, transparent baselines, and complexity only when earned, but they do not share a target or pretend to be one merged dataset.

---

# A. Primary domain — longitudinal running performance

## Primary question

Can a dynamic, individualized, event-aware representation of prior athlete performance improve one-step-ahead prediction while abstaining when development evidence is insufficient?

## Dataset

National Running Club Database (NRCD) anonymized public dataset v2.0.0, CC BY 4.0, covering 2004–May 2026. ATHENA creates **65,895** leakage-safe one-step-ahead prediction samples from **27,548** anonymized athletes after parsing, deduplication, and target-specific filtering.

## Temporal protocol

| Role | Period |
|---|---|
| Model training | through 2023 |
| shrinkage / gate / interval calibration | 2024 |
| main evaluation | 2025 |
| forward shift audit | 2026 through May |

Earlier model attempts were inspected during development, so the result is described as **preliminary retrospective validation**, not a pristine prospective test.

## Model hierarchy — 2025

| Model | MAPE | MAE (s) | RMSE (s) | Role |
|---|---:|---:|---:|---|
| M0 population/event median | 18.514% | 125.71 | 235.79 | weak population reference |
| M1 personalized baseline | 4.023% | 53.72 | 104.96 | strong personal-history baseline |
| M2 temporal residual Ridge | 3.957% | 53.01 | 103.69 | interpretable temporal correction |
| M3 event-aware residual Ridge | 4.009% | 53.73 | 104.85 | explicit event/context variant |
| C1 direct nonlinear HGB | 5.917% | 54.99 | 107.17 | stronger nonlinear absolute-time comparator; loses |
| **M4 ATHENA gated dynamic** | **3.936%** | **52.29** | **103.31** | calibrated residual correction + fallback |

M4 improves over M1 by **0.087 MAPE points**, about **2.16% relative**. The direct nonlinear comparator is retained because plausible complexity should be visible even when it loses.

## Evidence Gate

The 2024 calibration selects supported event/history regions for applying the learned correction. In 2025:

- dynamic coverage: **37.16%** (4,364 records)
- M1 MAPE inside active region: **4.868%**
- M4 dynamic MAPE inside active region: **4.634%**
- mean delta: **−0.234 points**
- athletes represented: **2,147**
- athletes improving on mean APE: **64.6%**

Outside the supported region, M4 explicitly falls back to M1.

## Rolling-origin validation

- 2023: 4.330% → 4.221%
- 2024: 3.732% → 3.693%
- 2025: 4.023% → 3.936%

All **3/3** rolling folds improve; weighted delta is about **−0.073 MAPE points**.

## Uncertainty and rejected calibration method

Retained global split-conformal-style interval:

- nominal coverage: **80%**
- empirical 2025 coverage: **77.97%**
- median width: **11.27%** of prediction

A more complicated event-conditional interval diagnostic achieved only **77.78%** coverage with a wider **12.02%** median interval. It is therefore **rejected and preserved as a negative method result**, not substituted after seeing the holdout.

Athlete-cluster bootstrap M4−M1 mean delta: **−0.087 MAPE points**, 95% interval **[−0.098, −0.075]**, using 3,744 athlete clusters.

## Robustness and failure analysis

The pipeline reports missing-context, perturbation, sparse/mature-history, and large-discontinuity conditions. The >30% result-discontinuity subgroup remains in the headline evaluation and performs poorly, which is intentionally visible rather than filtered away.

The original nonlinear absolute-time model also lost to M1. That failure is preserved in `data/derived/research_results_v0_failed.json` and motivated the residual-correction + Evidence-Gate architecture.

## 2026 shift audit

The partial-2026 period has **5,573** samples. Dynamic coverage falls to **2.26%**, so ATHENA overwhelmingly falls back to M1. M1 MAPE is **3.078%** and gated ATHENA is **3.076%**.

The important result is the contraction in dynamic coverage under shift, not the tiny MAPE difference.

---

# B. Secondary domain — wellness / next-day subjective readiness

## Question

Can individualized temporal wellness state improve next-day subjective readiness prediction over generic/static and persistence baselines?

## Dataset/protocol

ATHENA reanalyzes all **16** PMData public participant wellness files.

- raw wellness rows: **1,747**
- prediction samples after temporal construction: **1,669**
- target: next recorded-day readiness (0–10), maximum three-day gap
- main split within participant: earliest 60% training / next 20% calibration / latest 20% evaluation
- evaluation predictions: **341**
- blend selected on calibration only
- external-user stress test: leave one participant completely out of fitting

## Model hierarchy

| Model | MAE | Role |
|---|---:|---|
| W0 global mean | 1.353 | generic population baseline |
| W1 persistence | 1.029 | strong tomorrow≈today baseline |
| W2 static wellness Ridge | 1.354 | current wellness, no longitudinal state |
| W3 nonlinear temporal HGB | 1.137 | higher-complexity temporal comparator |
| **W4 ATHENA dynamic wellness** | **0.945** | interpretable temporal model + calibration-only persistence blend |

W4 improves MAE by about **8.22% relative to persistence**.

## Participant-level uncertainty

Participant-cluster bootstrap ATHENA−persistence mean MAE delta is about **−0.085 points**, with 95% interval approximately **[−0.205, +0.022]**. The interval crosses zero, so this result is not described as statistically definitive.

## Leave-one-participant-out stress test

- dynamic better than persistence: **12/16** participants
- dynamic better than static: **15/16**
- mean participant MAE: static **1.543**, persistence **1.128**, dynamic **1.063**

This evaluates transfer to a person unseen during fitting, but still within the same public dataset.

## Wellness ablations/robustness

Removing longitudinal history worsens the later-period MAE by about **0.063 points**. Several single current-day feature-group removals change little or even slightly improve the small-sample result; ATHENA reports this rather than claiming every wellness field has a large independent effect.

The pipeline also measures behavior under 10% missing feature cells, small perturbations, and exposes the largest readiness-prediction failures.

## Secondary-domain conclusion

The strongest defensible statement is:

> PMData provides promising evidence that ATHENA's longitudinal individualized wellness-state mechanism can improve next-day subjective-readiness prediction over a strong persistence baseline in a small public cohort, while participant-level uncertainty remains substantial.

This is **not** evidence of medical readiness, causal effects, injury prevention, or clinical safety.

---

# Overall interpretation

Across both domains, the recurring scientific pattern is not “complexity always wins.” Personal/temporal baselines are strong. ATHENA's research contribution is the disciplined use of **history, calibration, model competition, and fallback** so extra complexity must earn its role and negative results remain visible.
