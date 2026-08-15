# ATHENA — Phase 1A Official Audit & Master Build Specification

**Status:** Phase 1A complete; Phase 1B not started yet.  
**Starting codebase:** `Athena-main (1).zip`  
**Purpose:** This document is the authoritative build specification for Phase 1B. It replaces the earlier hypothetical feature lists with a plan grounded in the actual codebase.

---

## 1. Executive decision

ATHENA should **not** be rebuilt as a different product. The existing athlete-facing platform is worth preserving. The transformation is architectural: the current collection of rule-based tools becomes a unified athlete intelligence + research system centered on a **Dynamic Athlete-State Engine**.

The central research question is:

> **Can a dynamic, individualized, event-aware representation of athlete state produce more reliable and better-calibrated predictions than appropriate simpler/static approaches?**

The user-facing product remains ATHENA. Existing major tools remain recognizable. The technical/research layers underneath them become much deeper, measurable, and reproducible.

---

# 2. Actual current ATHENA — verified from ZIP

## 2.1 Current files / architecture

The project is currently a dependency-free static web app composed primarily of:

- `index.html`
- `styles.css`
- `app.js`
- `manifest.webmanifest`
- `service-worker.js`
- `ATHENA_OS_Single_File.html`
- documentation files (`README.md`, `FEATURE_MAP.md`, `PROJECT_PITCH.md`, `RESUME_COPY.md`)

There is currently no package/build system, backend, database, machine-learning pipeline, automated test suite, or formal experiment runner.

## 2.2 Existing product areas that will be preserved

### Athlete Command Center
- Local athlete profile
- Primary/secondary event
- Baseline resting pulse
- Daily wellness check-in
- Sleep, energy, soreness, stress, hydration, resting pulse, recent effort
- Health flags
- Readiness score
- Readiness labels/recommendations
- Readiness history chart
- Session Compatibility tool
- Voice summary

### Universal Event Lab
- Sprint Architect
- Rhythm Engine
- Pace Matrix
- Flight Log
- Throw Vault
- Relay Intelligence
- Relay permutation search across all 24 four-athlete orders

### Athlete Health Hub
- Heat awareness planner
- General heart-rate zone education
- Seven-night sleep bank
- Safety-signal education

### Nursing Communication
- SBAR-style handoff generator
- Symptom collection
- Emergency escalation messaging
- Copy/print output

### Athlete Research Studio
- Research question/protocol form
- Independent variable / metric
- Observation logging
- Trend chart
- CSV export

### Product features
- localStorage-based persistence
- PWA service worker
- light/dark theme
- responsive layout
- reduced-motion/accessibility intentions
- no external runtime libraries

---

# 3. Major findings from the actual audit

These are not criticisms of the idea; they identify exactly where the Phase 1B transformation should focus.

## 3.1 Readiness is currently heuristic, not a validated predictive model

Current readiness uses hard-coded event-group weights for sleep, energy, soreness, stress, hydration, resting pulse, and recent load. Score caps are applied for selected health flags. This is explainable but is **not trained, calibrated, or validated against outcomes**.

**Build decision:** preserve the interface, but replace/augment the heuristic layer with a formal state-model + baseline system. The old formula may remain as one transparent baseline for research comparison if scientifically useful.

## 3.2 Session compatibility is currently a hand-authored formula

Compatibility is calculated from current readiness, intensity, duration, temperature, event/session matching, and health flags using fixed penalties/bonuses.

**Build decision:** retain the UX, but treat this current version as a baseline/rules layer. The new engine must distinguish between evidence-based rules, learned estimates, and model uncertainty.

## 3.3 Event Genome currently groups events but does not yet constitute a deep event model

Events are grouped into sprint, endurance, hurdle, jump, throw, and multi-event categories, and those groups mostly select different readiness weights/session matches.

**Build decision:** Event Genome becomes a real representation layer feeding event context into the central model. We will experimentally test whether adding event context improves prediction.

## 3.4 Performance tools are useful but mostly deterministic calculators/loggers

- Sprint Architect uses fixed phase proportions.
- Rhythm Engine derives an average hurdle rhythm from goal time and a user-set allowance.
- Pace Matrix uses simple goal-time split logic.
- Flight Log / Throw Vault provide basic best/average/spread statistics.
- Relay Intelligence enumerates 24 permutations but currently ranks them using a hand-authored penalty function based on user ratings.

**Build decision:** keep all tools, improve transparency, evidence, analytics, and where justified connect them to the athlete-state/optimization engine.

## 3.5 Research Studio is currently a logger, not an experiment platform

It supports protocol entry, observations, a graph, and CSV export, but not baselines, model experiments, statistical evaluation, ablation, robustness, reproducibility, or failure analysis.

**Build decision:** Research Studio becomes Research Studio 2.0 / Experiment Lab.

## 3.6 Health tools have careful disclaimers but some computations are intentionally rough heuristics

The heat planner is explicitly “not WBGT” and uses a custom burden formula. Heart-rate education uses the common `220 - age` estimate. These should remain educational and conservative, not be represented as medical prediction.

**Build decision:** preserve safety-first boundaries; make evidence provenance clearer; separate educational guidance from experimental athlete-state modeling.

## 3.7 Privacy is local-first, but public project files contain personal information

The current public source includes founder email addresses, school/GPA/profile details, and external personal links.

**Build decision:** perform privacy sanitation. Default public app should keep founder names and project roles but remove unnecessary direct personal contact/private-profile information. No API keys, credentials, or sensitive user data will be embedded.

## 3.8 Engineering architecture is too monolithic for the planned research system

Most logic lives in one `app.js`, with a duplicate single-file version. There is no test harness or modular domain separation.

**Build decision:** refactor while preserving deployment simplicity. Separate data/model/research/UI logic enough to make the system testable and reproducible.

---

# 4. Phase 1B — Official master build

The items below are requirements/components, **not 100 separate menu buttons**. They will be organized into a small number of coherent systems.

---

# SYSTEM A — Dynamic Athlete-State Engine (central technology)

## A1. Formal athlete-state representation
Represent an athlete with a time-dependent state derived from available observations rather than one isolated daily score.

## A2. Longitudinal modeling
Use prior observations/outcomes to update the current estimated state.

## A3. Individual baselines
Estimate athlete-specific normal ranges where sufficient history exists.

## A4. Event-aware context
Represent the athlete's event/event-family as a meaningful model input rather than only a UI label.

## A5. State transitions
Implement a documented state-update mechanism as new observations arrive.

## A6. State trajectory
Visualize how estimated state changes over time.

## A7. Sparse-history behavior
Provide sensible behavior for new athletes with limited history.

## A8. Missing-data handling
Do not silently fill absent information with arbitrary values; use documented imputation/abstention rules.

## A9. Model versioning
Track which state-model version produced an output.

---

# SYSTEM B — Formal Mathematical & Technical Framework

## B1. Define prediction target(s)
Exactly define what each research model is predicting; no vague “AI readiness” claim.

## B2. Variable notation
Document observed variables, state variables, context variables, targets, and uncertainty terms.

## B3. State update equations/algorithm
Formalize how state evolves over time.

## B4. Prediction function
Document mapping from current state/context to predicted target.

## B5. Objective/loss function
Where trained models are used, explicitly define optimization objective.

## B6. Constraints
Document relevant optimization and safety constraints.

## B7. Uncertainty formulation
Define confidence/uncertainty estimation method.

## B8. Evaluation mathematics
Define metrics and statistical procedures.

## B9. Complexity metrics
Measure computational/model complexity so added sophistication can be evaluated against benefit.

## B10. Optimization formulation
For genuine decision/relay optimization problems, define objective + constraints mathematically.

---

# SYSTEM C — Prediction, Explainability & Uncertainty

## C1. Prediction engine
Produce research-supported predictions/estimates from the state engine.

## C2. Confidence/uncertainty display
Every model output should communicate reliability where the model permits it.

## C3. Abstention
Return “insufficient evidence/data” when appropriate rather than forcing a score.

## C4. Calibration analysis
Evaluate whether confidence levels correspond to observed reliability.

## C5. Feature influence/explainability
Show which factors influence outputs using methods appropriate to the chosen models.

## C6. Historical context
Compare current state/output with prior athlete history.

## C7. Model disagreement
When multiple reasonable models disagree substantially, surface that as uncertainty rather than hiding it.

---

# SYSTEM D — Counterfactual / What-If Intelligence

## D1. Scenario builder
Allow controlled modeled changes to selected inputs.

## D2. Side-by-side scenario comparison
Compare baseline/current state with alternative model scenarios.

## D3. Counterfactual explanations
Identify modeled changes associated with materially different outputs where technically valid.

## D4. Clear semantics
All what-if results must be labeled model-based, not guaranteed causal outcomes.

---

# SYSTEM E — Research Studio 2.0 / Experiment Lab

## E1. Structured research question
## E2. Testable hypothesis
## E3. Dataset selection
## E4. Target/outcome definition
## E5. Feature configuration
## E6. Model configuration
## E7. Evaluation strategy
## E8. Experiment run
## E9. Results
## E10. Conclusion status: supported / unsupported / inconclusive
## E11. Experiment history
## E12. Research Graph linking question → data → method → result → conclusion
## E13. Exportable research summary

---

# SYSTEM F — Baseline & Model Hierarchy

Create a clean progression so ATHENA is compared against serious alternatives rather than a deliberately weak baseline.

## F1. Model 0 — transparent/static baseline
Potentially use/refine the current heuristic approach as a documented baseline.

## F2. Model 1 — personalized baseline
Adds athlete history/personal baseline without full dynamic/event-aware machinery.

## F3. Model 2 — temporal/dynamic baseline
Adds time/trajectory information.

## F4. Model 3 — event-aware model
Adds event context.

## F5. Full ATHENA model
Dynamic + individualized + event-aware + uncertainty.

## F6. Automated model comparison
Generate comparable results under the same evaluation split/protocol.

---

# SYSTEM G — Ablation & Scientific Discovery

## G1. Temporal ablation
## G2. Personalization ablation
## G3. Event-context ablation
## G4. Feature-group ablations
## G5. Uncertainty-component ablation where appropriate
## G6. Quantify change in performance for each removal
## G7. Identify which components actually contribute
## G8. Discovery analysis: identify patterns associated with athlete-state transitions/outcomes, clearly distinguishing exploratory findings from established causal claims

---

# SYSTEM H — Validation & Statistics

## H1. Leakage-safe preprocessing
## H2. Training/development/test separation
## H3. Time-aware splitting for longitudinal data where needed
## H4. Cross-validation where appropriate
## H5. Held-out evaluation
## H6. External/secondary-dataset validation when compatible public data exists
## H7. Task-appropriate error/classification metrics
## H8. Calibration metrics where probabilistic outputs exist
## H9. Confidence intervals / bootstrap where useful
## H10. Effect-size/statistical comparison where justified
## H11. Clearly distinguish preliminary validation from claims of real-world clinical/medical efficacy

---

# SYSTEM I — Robustness & Failure Observatory

## I1. Missing-data stress tests
## I2. Noise sensitivity
## I3. Sparse-history tests
## I4. Outlier tests
## I5. Event-subgroup performance
## I6. Distribution-shift tests when possible
## I7. Failure Observatory dashboard
## I8. Largest-error cases
## I9. Low-confidence failures
## I10. Model-disagreement cases
## I11. Failure categorization
## I12. Failure → diagnose → modify → retest loop

---

# SYSTEM J — Complexity vs. Benefit

## J1. Measure model size / computation time / relevant complexity
## J2. Compare complexity against predictive gain
## J3. Identify Pareto-efficient model choices where possible
## J4. Report if a simpler model performs essentially as well as full ATHENA

This prevents “more complicated = better” reasoning.

---

# SYSTEM K — Public Data & Provenance

## K1. Identify suitable reputable open/public datasets
## K2. Use each dataset only for questions its variables can actually answer
## K3. Dataset registry
## K4. Source/creator attribution
## K5. License/usage notes
## K6. Variable/data dictionary
## K7. Cleaning log
## K8. Missingness report
## K9. Quality checks
## K10. Dataset versioning/checksums where practical
## K11. Transformation provenance

No public dataset will be presented as data collected by ATHENA's founders.

---

# SYSTEM L — Reproducibility

## L1. Experiment identifiers
## L2. Dataset version
## L3. Feature set
## L4. Model version/configuration
## L5. Evaluation split
## L6. Random seed where applicable
## L7. Metrics/results
## L8. Processing configuration
## L9. Exportable experiment manifest

A result should be traceable back to how it was produced.

---

# SYSTEM M — State-of-the-Art / Novelty Layer

## M1. Literature/current-approach review
## M2. Existing athlete-readiness/performance modeling comparison
## M3. Define exactly what ATHENA does differently
## M4. Do not claim novelty until supported by comparison
## M5. Maintain citations/references inside the technical/research section

---

# SYSTEM N — Optimization & Relay Intelligence 2.0

## N1. Preserve all-24-order enumeration
## N2. Formalize relay objective/constraints
## N3. Correctly adapt input semantics to relay type/event
## N4. Explain why an order ranks higher
## N5. Sensitivity analysis on ratings/times
## N6. Compare heuristic/current optimization with improved formulation
## N7. Show when multiple orders are essentially tied rather than presenting false precision

---

# SYSTEM O — Quantum / Quantum-Inspired Investigation (conditional)

This is **not forced** into ATHENA.

## O1. First determine whether a genuine combinatorial optimization subproblem can be expressed appropriately (e.g. a suitable binary optimization formulation).
## O2. If justified, implement an experimental benchmark against the best reasonable classical baseline available in the project.
## O3. Compare solution quality, computational cost, scaling, and practical limitations.
## O4. Include it only if it teaches something real; otherwise record the investigation in technical notes and omit quantum branding from the product.

This closes the “quantum” question without turning it into a gimmick or an unfinished TODO.

---

# SYSTEM P — Existing ATHENA Feature Transformations

No useful current capability is casually deleted.

## P1. Command Center 2.0
Current readiness UI becomes the front end for the state/prediction engine. Preserve simple experience while adding confidence, trend, explanation, and model provenance.

## P2. Event Genome 2.0
Move from event-group weights to a documented event-context representation. Preserve event selection and athlete profile.

## P3. Session Compatibility 2.0
Separate safety rules, transparent baseline heuristic, and model-based compatibility. Show uncertainty.

## P4. Sprint Architect 2.0
Preserve goal-time race planning; document assumptions; improve event-specific logic and visualization; connect to athlete context only where evidence supports it.

## P5. Rhythm Engine 2.0
Preserve hurdle rhythm tool; improve technical assumptions, event-specific outputs, validation, and explanation.

## P6. Pace Matrix 2.0
Preserve pacing calculator; improve strategy math/visualization and ensure strategy actually affects relevant outputs consistently.

## P7. Flight Log 2.0
Preserve attempt logging; add longitudinal trends, consistency measures, event-aware handling, and links to athlete history.

## P8. Throw Vault 2.0
Preserve attempt logging; add longitudinal trends, consistency, event-aware analytics, and research/export hooks.

## P9. Relay Intelligence 2.0
Upgrade to formal optimization + explainable rankings + sensitivity/uncertainty.

## P10. Health Hub 2.0
Preserve educational tools while clearly separating public-health guidance from experimental athlete modeling. Improve source visibility and conservative safety boundaries.

## P11. SBAR Handoff 2.0
Preserve structured communication; add completeness checks, missing-information prompts, clearer export/print layout, and accessibility. No diagnostic claims.

## P12. Research Studio 2.0
Replace simple logger-only role with full experiment/research workspace while retaining manual N-of-1 logging and CSV export.

---

# SYSTEM Q — Historical / Retrospective Case Replay

## Q1. Use only cases with enough publicly documented pre-event information.
## Q2. Feed only information that would have been available beforehand.
## Q3. Show what ATHENA would have output under the model.
## Q4. Compare with documented outcome.
## Q5. Explicitly label as retrospective simulation.
## Q6. Never claim ATHENA “would have prevented” an injury or event from retrospective replay alone.

---

# SYSTEM R — UI/UX & Information Architecture

The current dark, high-tech ATHENA visual identity is worth preserving.

## R1. Keep recognizable ATHENA look/feel
## R2. Refine typography, spacing, hierarchy, component consistency
## R3. Improve navigation without exploding number of top-level sections
## R4. Progressive disclosure: simple answer → explanation → technical method → evidence
## R5. Separate Athlete mode from Research/Technical depth without making two unrelated apps
## R6. Improve chart quality and labeling
## R7. Better empty/loading/error states
## R8. Keyboard/accessibility review
## R9. Responsive/mobile refinement
## R10. Reduced-motion behavior
## R11. Prevent information overload

Likely top-level organization after implementation (subject to usability testing):

- Command / Athlete
- Event Lab / Performance
- Intelligence
- Research / Validation
- Health & Handoff
- Data & Methods
- About

This is not seven isolated systems; it is a navigation layer over the shared architecture.

---

# SYSTEM S — ATHENA Branding Upgrade

## S1. Preserve ATHENA name
## S2. Create a modern Athena-inspired emblem (helmet/owl/Greek geometry/A/data motif)
## S3. Avoid literal mythological illustration or a themed “Greek mythology” site
## S4. Integrate emblem consistently into header, favicon/PWA icon, loading/empty states, technical materials
## S5. Maintain a research/technology aesthetic

---

# SYSTEM T — Privacy, Safety & Security

## T1. Remove unnecessary personal emails/details from public build by default
## T2. Keep founder names/roles and equal attribution
## T3. Audit all files for credentials/secrets
## T4. Document local storage behavior accurately
## T5. Add data deletion/reset controls
## T6. Add export controls where appropriate
## T7. Make privacy claims precise; localStorage is local-first but not magical encryption
## T8. Separate safety-rule overrides from predictive model outputs
## T9. No diagnosis, medical clearance, or guaranteed injury-prevention claims
## T10. Keep urgent safety escalation language conservative and sourced

---

# SYSTEM U — Engineering Architecture & QA

## U1. Refactor monolithic JS into maintainable modules/files while retaining easy static deployment where possible
## U2. Establish explicit data schemas
## U3. Automated unit tests for deterministic calculations
## U4. Tests for state/model pipeline
## U5. Tests for data preprocessing
## U6. Tests for relay permutation/optimization
## U7. Tests for safety override rules
## U8. Tests for missing/invalid inputs
## U9. Integration/end-to-end smoke tests
## U10. Accessibility checks
## U11. Performance checks
## U12. Offline/PWA regression tests
## U13. Service-worker version/update strategy
## U14. Resolve duplicate-source risk from separate single-file build or automate its generation

---

# SYSTEM V — Technical Documentation

## V1. Architecture diagram
## V2. Mathematical definitions
## V3. Model-card style documentation
## V4. Dataset cards / provenance
## V5. Experiment methodology
## V6. Baseline definitions
## V7. Ablation methodology
## V8. Robustness methodology
## V9. Statistical methodology
## V10. Limitations
## V11. Responsible-use boundaries
## V12. Reproducibility guide
## V13. Source/reference library

Normal users do not need to read this; technical reviewers can drill into it.

---

# SYSTEM W — “Killer Demonstration”

Build one reviewer-friendly flow that communicates the whole project:

1. Athlete history/current observations/event context
2. Dynamic state estimate
3. Prediction
4. Confidence
5. Explanation
6. Counterfactual scenario
7. Baseline comparison
8. Validation result
9. Failure/limitation disclosure

A technically sophisticated system must still be understandable in minutes.

---

# 5. What will NOT be done

- No fabricated athlete data
- No fabricated accuracy/improvement numbers
- No invented citations
- No fake clinical validation
- No false injury-prevention claims
- No “quantum AI” branding without an actual quantum experiment
- No deliberately weak baseline merely to make ATHENA look good
- No silent data leakage
- No arbitrary deletion of existing useful features
- No complete visual redesign that makes ATHENA unrecognizable

---

# 6. No-holes rule / autonomous fallback policy

During Phase 1B, if an ideal implementation is unavailable:

1. Try the planned implementation.
2. Identify the exact blocker.
3. Find the closest legitimate alternative that preserves the scientific/product purpose.
4. Implement that alternative without fabricating evidence.
5. Record the difference in technical documentation.

Examples:

- No suitable private participant data → use compatible public/open datasets and narrow the experiment to what they support.
- Dataset lacks a desired variable → change the experiment; do not synthesize the missing variable as if observed.
- A complex model is unsupported by sample size → use a simpler defensible model and evaluate complexity vs. benefit.
- Quantum formulation is not justified → retain classical optimization and document why quantum was rejected.
- An expected improvement does not occur → report/analyze the failure; do not manipulate results.

The goal is no intentional `TODO: founders must solve this later` inside the Phase 1B technical build.

---

# 7. Phase 1B sequencing

1. **Architecture/refactor foundation**
2. **Data schemas + public-data registry**
3. **Baseline implementations**
4. **Dynamic Athlete-State Engine**
5. **Prediction / uncertainty / explainability**
6. **Research Studio 2.0 / Experiment Lab**
7. **Validation / ablation / robustness / failure systems**
8. **Counterfactual engine**
9. **Optimization / relay upgrade**
10. **Quantum feasibility investigation**
11. **Integrate/upgrade existing ATHENA tools**
12. **Technical documentation**
13. **UI/UX/branding refinement**
14. **Privacy/safety sanitation**
15. **Automated tests + end-to-end QA**
16. **Killer demonstration**
17. **Final packaging**

---

# 8. Phase 1B completion standard

Phase 1B is complete only when:

- Existing useful ATHENA capabilities still function
- Core state/model architecture is implemented
- At least one meaningful baseline comparison is reproducible
- Preliminary quantitative validation uses legitimate data
- Model limitations/failures are visible
- Math/technical methodology is documented
- Public-data provenance is traceable
- UI remains easy to navigate
- Personal/secret information is sanitized appropriately
- Automated tests cover critical deterministic/research logic
- Final build runs cleanly and is packaged for delivery
- No major technical gap is intentionally handed back to the founders as homework

---

# 9. THINK alignment used to shape this specification

The current THINK guidelines emphasize:

- **Impact** — relevance/importance of the problem
- **Innovation** — novelty, context within existing work, and improvement over current solutions
- **Clarity** — clearly defined goals/methods/timeline and reliably evaluable results
- **Feasibility** — ability to complete within cost/resources and one semester
- **Benefit** — meaningful benefit from THINK funding and mentorship

The most recent finalist abstracts reinforce a pattern of narrow technical mechanisms, explicit experiments, measurable targets/metrics, and validation rather than feature count alone.

The Phase 1B build is therefore designed to make ATHENA a coherent technical research platform—not a collection of unrelated advanced-sounding features.

---

# 10. Final status

**Phase 1A:** COMPLETE  
**Phase 1B:** NOT STARTED  
**Next action:** Build against this specification after founder approval.
