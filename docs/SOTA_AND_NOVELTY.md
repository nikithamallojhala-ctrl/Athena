# State of the Art and Novelty Boundary

## The most important novelty rule

ATHENA **does not claim to be the first dynamic athlete-state model**.

That would be inaccurate. Longitudinal and individualized sports-performance modeling already exists, including runner-specific prediction and state-space approaches. A very recent 2026 preprint also proposes reusable latent memory states for longitudinal athlete monitoring.

## Relevant prior work

### Individual runner performance prediction
Blythe, D. A. J., & Király, F. J. (2016). *Prediction and Quantification of Individual Athletic Performance of Runners*. PLOS ONE, 11(6), e0157257. https://doi.org/10.1371/journal.pone.0157257

This establishes that individual runner-performance prediction is not new by itself.

### State-space modeling of runner careers
Stival, M., Bernardi, M., Cattelan, M., & Dellaportas, P. (2023). *Missing data patterns in runners' careers: do they matter?* Journal of the Royal Statistical Society Series C: Applied Statistics, 72(1), 213–230. https://doi.org/10.1093/jrsssc/qlad009

The authors use a latent-class matrix-variate state-space model and report improved out-of-sample runner-performance prediction when missingness patterns are modeled. This directly prevents ATHENA from claiming “state-space athlete modeling” as a new field.

### Longitudinal recovery prediction
Rothschild, J. A., Stewart, T., Kilding, A. E., & Plews, D. J. (2024). *Predicting daily recovery during long-term endurance training using machine learning analysis*. European Journal of Applied Physiology, 124, 3279–3290. https://doi.org/10.1007/s00421-024-05530-2

This shows that daily athlete recovery prediction from longitudinal monitoring has also been explored.

### SoccerMon longitudinal athlete-monitoring dataset
Midoglu et al. (2024). *A large-scale multivariate soccer athlete health, performance, and position monitoring dataset*. Scientific Data, 11, 553. https://doi.org/10.1038/s41597-024-03386-x

This demonstrates the availability of rich multivariate athlete monitoring and provides a potential independent future domain, not a reason to merge incompatible targets.

### Very recent latent memory-state work
Lee, D.-J. (2026, preprint). *Learning Latent Memory States from Longitudinal Athlete Monitoring Data*. arXiv:2608.06290. https://arxiv.org/abs/2608.06290

This August 2026 preprint explicitly formalizes longitudinal athlete memory states with uncertainty and validation properties. ATHENA therefore must define its contribution more specifically than “latent athlete state.”

## ATHENA's defensible working contribution

The current build explores a **system-level and methodological combination**:

1. a strong individual/event historical baseline as the default;
2. learned temporal/event-aware residual correction rather than replacing the individual baseline;
3. a calibration-derived **Evidence Gate** that activates complexity only in supported event/history regions and otherwise abstains to the baseline;
4. visible uncertainty, model hierarchy, ablations, robustness, failure taxonomy, model disagreement, and complexity-benefit tradeoffs;
5. a local-first athlete product whose deterministic calculators, daily modeled state, health/safety rules, and learned public-data evidence are explicitly separated rather than marketed as one opaque “AI score”;
6. a reproducible open-data evaluation artifact that lets a reviewer interrogate negative results and failure cases from the interface.

This is a **working/candidate contribution statement**, not a legal or publication-level claim of novelty. A final proposal/paper should repeat a fresh literature search immediately before submission.

## What ATHENA should never claim
- “the first AI for athletes”
- “the first athlete digital twin”
- “the first dynamic athlete-state model”
- “clinically validated readiness”
- “prevents injury”
- “quantum-powered” for the current four-runner relay problem
- universal superiority over existing sports science models

## Research opportunity
The interesting research question is not whether ATHENA has more features. It is whether **selective, evidence-gated personalization/temporal correction** adds reliable value beyond a simple personal-history baseline, and under what conditions the model should abstain.

## Phase 1C clarification

The PMData reanalysis strengthens **evidence breadth**, not the novelty claim by itself. Pallas likewise improves usability but is not presented as a novel language model. ATHENA's research novelty argument should remain centered on the calibrated evidence-gated personalized correction/fallback methodology and the auditable separation between product state, deterministic tools, empirical validation domains, and health/safety boundaries.
