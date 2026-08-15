# ATHENA Model Cards

## A. M4 Gated Dynamic Performance Model

### Identifier
`ATHENA-NRCD-NEXT-RACE-v2`

### Intended use
Research evaluation of whether a calibrated nonlinear residual correction around an athlete/event personal-history baseline can improve **one-step-ahead archived running-time prediction** on NRCD.

### Not intended for
- medical diagnosis or clearance
- injury prediction/prevention claims
- return-to-play decisions
- recruiting/scholarship high-stakes ranking
- causal wellness claims
- unsupported populations outside validation

### Inputs
Strictly prior same-athlete/same-event performance history, history amount/variability, trajectory/timing, event/sport/gender identity, and available archived meet/environment context.

### Output
Log-time point prediction. The Evidence Gate can abstain to the personalized baseline. Research output also contains uncertainty/failure diagnostics.

### Protocol
- train: through 2023
- calibration: 2024
- evaluation: 2025
- forward-shift audit: partial 2026

### 2025 performance
- M1 personalized baseline MAPE: **4.023%**
- M4 ATHENA MAPE: **3.936%**
- delta: **−0.087 points**
- dynamic coverage: **37.16%**
- athlete-cluster delta interval: **[−0.098, −0.075]**
- C1 direct nonlinear HGB comparator: **5.917% MAPE**

### Uncertainty
Retained global split-conformal-style interval: nominal 80%, empirical 77.97%. An event-conditional alternative was tested and rejected because it slightly reduced coverage and widened intervals.

### Limitations
Improvement is modest; metadata are nonuniform; race discontinuities can be large; the dataset is not representative of all athletes; earlier iterations were observed during development; the trust region is intentionally narrow; daily wellness dimensions are not validated by this model.

---

## B. W4 Dynamic Wellness Model

### Identifier
`ATHENA-PMDATA-NEXT-READINESS-v1`

### Intended use
Secondary research evaluation of whether individualized temporal wellness history improves **next recorded-day subjective readiness** prediction in PMData over generic/static/persistence baselines.

### Not intended for
- medical readiness/clearance
- injury prediction or prevention
- causal claims about sleep, stress, soreness, or fatigue
- universal athlete scoring

### Inputs
Current and longitudinal PMData wellness observations constructed with leakage-safe lags/rolling history, including published readiness/sleep/fatigue/mood/soreness/stress variables.

### Output
Predicted next recorded-day subjective readiness (0–10), restricted to target records within three days.

### Protocol
Within each participant: earliest 60% training, next 20% calibration, latest 20% evaluation. Blend weight chosen on calibration only. Separate leave-one-participant-out stress test.

### Performance
- evaluation n: **341**
- W1 persistence MAE: **1.029**
- W4 ATHENA MAE: **0.945**
- relative change: **−8.22%**
- participant-cluster delta interval: approximately **[−0.205, +0.022]**
- LOPO: dynamic beats persistence for **12/16** participants

### Limitations
Only 16 participants; subjective outcome; observational data; participant-cluster interval crosses zero; same-dataset LOPO is not a fully independent cohort replication.

## Shared responsible interpretation
Both models are research evidence for narrowly defined retrospective prediction problems. Neither is a verdict on an athlete's health, talent, safety, or medical ability to train.
