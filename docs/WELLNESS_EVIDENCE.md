# Recovery / Wellness Evidence and ATHENA Validation

ATHENA's daily state observations include sleep, energy/fatigue, soreness, stress, hydration, resting pulse, recent effort, and subjective readiness context. Version 2.4.0 separates three evidence levels:

1. **Observation-domain evidence** — public athlete-monitoring datasets show that sleep/fatigue/soreness/stress/readiness are real longitudinal monitoring variables.
2. **ATHENA-specific secondary validation** — PMData is reanalyzed in this repository for a pre-specified next-day subjective-readiness prediction task.
3. **Medical/causal validity** — **not claimed**. Neither the public datasets nor this reanalysis establishes medical clearance, injury prevention, or causal treatment effects.

## PMData — ATHENA-specific secondary validation domain

Source: Thambawita et al., *PMData: A Sports Logging Dataset* (MMSys 2020), DOI `10.1145/3339825.3394926`; dataset portal `https://datasets.simula.no/pmdata/`.

The public wellness files include readiness, sleep duration/quality, fatigue, mood, soreness, and stress. ATHENA uses **all 16 participant wellness files present in the public release**, not a selected subset.

### ATHENA protocol

Question:

> Can individualized temporal wellness state improve next-day subjective readiness prediction over generic/static and persistence baselines?

Rules:
- target = next recorded-day readiness (0–10);
- next report must occur within three days;
- every lag/rolling feature is leakage-safe;
- main evaluation is chronological within participant: earliest 60% training, next 20% calibration, latest 20% evaluation;
- the ATHENA blend parameter is chosen on calibration only;
- a leave-one-participant-out stress test holds each person completely out of fitting.

### Main later-period evaluation

| Model | MAE readiness points | Interpretation |
|---|---:|---|
| W0 population mean | 1.353 | generic population baseline |
| W1 persistence | 1.029 | strong simple baseline: tomorrow ≈ today |
| W2 static wellness Ridge | 1.354 | current wellness only, no longitudinal state |
| W3 nonlinear temporal HGB | 1.137 | higher-complexity comparator |
| **W4 ATHENA dynamic wellness** | **0.945** | interpretable temporal model blended toward persistence using calibration-only λ=0.9 |

W4 improves MAE by about **8.22% relative to persistence** on 341 later-period predictions.

The participant-cluster bootstrap interval for ATHENA−persistence MAE is approximately **[−0.205, +0.022]** points. Because it crosses zero, ATHENA reports the result as **promising, not definitive**.

Phase 1D adds an **exact participant-level sign-flip test** across all 2^16 sign assignments. Its two-sided p-value is approximately **0.207**, which reinforces the decision not to call the small-cohort result definitive. Two alternate chronological split schemes preserve the direction of improvement (about **−10.86%** at 50/25/25 and **−7.52%** at 70/15/15 versus persistence). A scrambled-training-target negative control produces no material benefit, providing an additional leakage/calibration sanity check.

### Leave-one-participant-out stress test

Each participant is held out from model fitting in turn.

- ATHENA beats persistence for **12/16** held-out participants.
- ATHENA beats the static model for **15/16**.
- mean participant MAE: static **1.543**, persistence **1.128**, ATHENA **1.063**.

This is a useful external-user transfer test within the same dataset, but it is not equivalent to an independent new cohort.

### Ablation/robustness interpretation

Removing longitudinal history worsens MAE by about **0.063 points**, while several current-day feature-group removals have very small effects in this small sample. That is important: the result does **not** justify claiming every slider has a large independent predictive effect.

The pipeline also tests 10% feature-cell missingness and small input perturbations and exposes the largest errors in a Failure Observatory.

## SoccerMon — external observation-domain evidence

Source: Midoglu et al., *Scientific Data* (2024), DOI `10.1038/s41597-024-03386-x`; open dataset DOI `10.5281/zenodo.10033832`.

SoccerMon supplies a rich longitudinal athlete-monitoring schema containing daily wellness and training-load variables. ATHENA uses it as supporting evidence that the observation domain and temporal framing are realistic. This release **does not claim an ATHENA SoccerMon reanalysis result**.

## REST — objective sleep support

Source: Boeker et al., Zenodo DOI `10.5281/zenodo.16937033` and associated publication.

REST adds objective actigraphy/sleep-related measurements in an elite-athlete cohort. It supports the choice to treat sleep as more than a decorative questionnaire variable, but ATHENA does **not** claim REST validates the entire state engine.

## Product algorithm boundary

ATHENA's browser state engine uses transparent normalization, event-aware projection, temporal smoothing, recent personal-deviation context, capped personal-history adjustment, confidence, and separate safety overrides.

The browser weights are a **transparent product-state representation**, not clinical causal coefficients learned from PMData. PMData instead validates a separate research mechanism: whether longitudinal wellness history contains useful signal for next-day subjective readiness prediction.

## Reviewer-safe conclusion

Defensible:

> ATHENA's wellness observation domain is grounded in public athlete-monitoring data, and ATHENA independently reanalyzes PMData to test whether longitudinal individualized state improves next-day subjective-readiness prediction over static and persistence baselines. The secondary result is promising but limited by cohort size and participant-level uncertainty.

Not defensible:

> ATHENA's wellness score medically clears an athlete, predicts injury, or proves sleep/stress causes a specific performance outcome.

ATHENA never makes the second claim.
