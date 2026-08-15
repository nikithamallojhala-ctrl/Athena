# Mathematical Methods

## 1. Product athlete-state representation

Let the local athlete state at time `t` be

```text
z_t = [recovery, freshness, loadTolerance, powerAvailability, aerobicDurability, stability]^T
```

Each dimension is scaled to `[0,100]`. Current observations `x_t` include self-reported sleep, energy, soreness, stress, hydration, resting pulse, recent effort, and health flags. Event context `c_t` is represented by an event-demand vector.

ATHENA uses a transparent state update:

```text
z_t = λ_t z_(t-1) + (1 - λ_t) f(x_t, c_t)
```

`λ_t` increases modestly as reliable personal history accumulates, so a new athlete is more responsive to the current observation while an athlete with history receives more smoothing. Missing fields use documented neutral fallbacks and reduce completeness/confidence rather than producing `NaN` or silently inventing measurements.

A separate descriptive personal-baseline routine compares recent self-observations with up to 14 prior entries and may flag large deviations. These are **within-person descriptive deviations**, not medical thresholds.

## 2. Research prediction target

For the public NRCD experiment, the target is the next archived individual running performance time `y_(i,e,t+1)` in seconds for athlete `i`, event `e`.

Because race times are positive and multiplicative error is meaningful, models operate in log-time space.

## 3. Leakage-safe features

For every target race, all history features are computed only from records with dates **strictly earlier** than that target. Examples include:

- last same-event log time
- recent-three mean
- exponentially weighted history
- mean / median / best prior
- prior count
- historical coefficient of variation
- recent trajectory
- days since prior result
- event/sport/gender context
- available archived environmental/meet context

No target/future result is used to construct its own features.

## 4. Model hierarchy

### M0 — population/event baseline
A static median derived from training-period event + gender, with event-only/global fallback.

### M1 — personalized baseline

```text
b_(i,e,t) = median(log y_(i,e,<t))
```

This intentionally strong baseline forces complexity to earn itself.

### M2 — temporal residual Ridge
A regularized linear model predicts a residual correction around the personal baseline from prior-history features.

### M3 — event-aware residual Ridge
Adds event and archived context to the residual correction.

### M4 — ATHENA gated dynamic residual model
A nonlinear histogram-gradient-boosting model predicts a residual correction `r_hat` around M1:

```text
raw_prediction = b_(i,e,t) + α r_hat(x_(i,e,t))
```

where shrinkage `α` is selected on the calibration year only.

## 5. ATHENA Evidence Gate

Complexity is allowed to act only where the preceding calibration year shows enough support. The gate requires:

```text
calibration event sample count >= 80
mean calibration MAPE benefit > 0.03 points
history freshness <= 180 days
```

Then

```text
ŷ = b + α r_hat     if gate = 1
ŷ = b               if gate = 0
```

This is ATHENA's operational **abstention/fallback** mechanism. It is not a claim that these exact thresholds are universally optimal; they are pre-specified/tuned from the calibration period and reported in the output artifact.

For the 2025 evaluation, the calibrated gate activates on **37.16%** of cases.

## 6. Loss / evaluation

Reported primary error is mean absolute percentage error:

```text
MAPE = (100/n) Σ |y_i - ŷ_i| / y_i
```

ATHENA also reports MAE, RMSE, median APE, and proportions within 3% and 5%.

The 2025 result is M1 **4.023%** MAPE versus M4 **3.936%**.

## 7. Uncertainty

Calibration absolute log residuals define an 80% split-conformal-style interval. The evaluation coverage is **77.97%** with median interval width **11.27%** of the point prediction.

The interval is an empirical prediction interval for this retrospective task, not a medical confidence interval.

## 8. Cluster bootstrap

Repeated races from one athlete are not independent. ATHENA therefore bootstraps **athlete clusters**, not individual rows, when estimating the M4−M1 MAPE difference. The 500-bootstrap 95% interval is **[-0.098, -0.075] MAPE points**.

## 9. Counterfactual semantics

The product counterfactual tool evaluates the local formula under edited inputs:

```text
Δ_model = F(x_edited, history, event) - F(x_observed, history, event)
```

This is a **model-based scenario comparison**. It is not a causal estimate and must not be interpreted as “changing sleep by X hours will cause Y performance change.”

## 10. Relay optimization

For four athletes there are exactly `4! = 24` relay orders. ATHENA evaluates all of them, so the returned minimum is exact **for its stated objective**:

```text
J(order) = Σ reference_time_i
         + Σ role_fit_penalty(i, leg)
         + Σ exchange_risk_penalty(adjacent athletes)
```

The objective is a transparent planning heuristic, not a validated relay-finish-time model. ATHENA reports near ties, V1 heuristic comparison, and ±1 rating sensitivity scenarios.

## 11. Complexity principle

M4 is not accepted simply because it is more sophisticated. The Research Studio reports a complexity-benefit frontier using prediction error, serialized model size, and fit time. M1 remains visible as a zero-model-size benchmark.
