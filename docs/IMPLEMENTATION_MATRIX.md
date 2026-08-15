# ATHENA Phase 1B Implementation Matrix

This matrix converts the Phase 1A master specification into auditable build items. “Implemented” means the software/documentation/test surface exists in this release. Items requiring future real-world data are explicitly marked rather than faked.

| ID | Requirement | Implementation evidence | Status |
|---|---|---|---|
| A1 | Formal athlete state representation | js/state-engine.js six-dimensional state vector | **Implemented** |
| A2 | Time-updating state transition | history-dependent λ smoothing in state-engine | **Implemented** |
| A3 | Individualization | profile baseline + personal history | **Implemented** |
| A4 | Longitudinal modeling | state/check-in history + trajectories | **Implemented** |
| A5 | Event-aware modeling | event demand vectors and event projection | **Implemented** |
| A6 | Athlete trajectories | trajectory chart/history | **Implemented** |
| A7 | Trend/deviation detection | personalBaselineContext + deviation flags | **Implemented** |
| A8 | Sparse-history behavior | confidence/history logic + tests | **Implemented** |
| A9 | Missing-observation behavior | neutral fallback + reduced completeness/confidence + tests | **Implemented** |
| A10 | State visualization | Command Center six-dimensional UI | **Implemented** |
| A11 | State versioning | ATHENA_STATE_v2.1.0 | **Implemented** |
| A12 | Historical context | recent personal patterns surfaced in technical view | **Implemented** |
| B1 | Mathematical problem definition | docs/MATHEMATICAL_METHODS.md | **Implemented** |
| B2 | State notation | state vector documented | **Implemented** |
| B3 | State transition equation | z_t equation in app/docs | **Implemented** |
| B4 | Prediction formulation | personal baseline + residual correction | **Implemented** |
| B5 | Loss/evaluation formulation | MAPE/MAE/RMSE definitions | **Implemented** |
| B6 | Constraints | state bounds, relay assignment constraints, gate rules | **Implemented** |
| B7 | Uncertainty formulation | split-conformal-style interval | **Implemented** |
| B8 | Statistical comparison | athlete-cluster bootstrap | **Implemented** |
| B9 | Optimization formulation | relay objective + assignment constraints | **Implemented** |
| B10 | Complexity math | fit time, model size, Pareto analysis | **Implemented** |
| C1 | Prediction engine | M0–M4 public-data pipeline | **Implemented** |
| C2 | Strong simple baseline | M1 personalized median history | **Implemented** |
| C3 | Confidence estimates | product confidence + research intervals | **Implemented** |
| C4 | Abstention | product insufficient-evidence logic + research Evidence Gate | **Implemented** |
| C5 | Calibration analysis | 2024 interval/gate calibration and 2025 coverage | **Implemented** |
| C6 | Explainability | factor contributions + grouped permutation diagnostic | **Implemented** |
| C7 | Feature influence | corrected grouped calibration permutation analysis | **Implemented** |
| C8 | Model disagreement | M3 vs dynamic disagreement summary/top cases | **Implemented** |
| C9 | Provenance | runtime model/output trace | **Implemented** |
| C10 | Historical comparison | baseline/deviation and held-out prior result context | **Implemented** |
| D1 | Counterfactual what-if analysis | Intelligence scenario sliders | **Implemented** |
| D2 | Counterfactual feature analysis | sleep/stress/soreness/session edits | **Implemented** |
| D3 | Scenario comparison | baseline versus edited state display | **Implemented** |
| D4 | Non-causal semantics | explicit UI/docs warning + test | **Implemented** |
| E1 | Hypothesis Manager | Experiment Lab question/hypothesis manifest | **Implemented** |
| E2 | Experiment Lab | register/load/export experiments | **Implemented** |
| E3 | Question→data→method→result→conclusion workflow | Research Graph | **Implemented** |
| E4 | Experiment history | local manifest history | **Implemented** |
| E5 | Research Graph | visual node chain | **Implemented** |
| E6 | Automated experiment matrix | generated hierarchy/ablation/robustness/folds matrix | **Implemented** |
| E7 | Result export | research JSON export | **Implemented** |
| E8 | N-of-1 project builder | preserved original workflow | **Implemented** |
| E9 | N-of-1 observations | local observation log/chart | **Implemented** |
| E10 | N-of-1 CSV export | preserved export | **Implemented** |
| F1 | M0 static/population baseline | event+gender training median | **Implemented** |
| F2 | M1 personalized model | athlete/event prior median | **Implemented** |
| F3 | M2 temporal model | residual Ridge | **Implemented** |
| F4 | M3 event-aware model | context-aware residual Ridge | **Implemented** |
| F5 | M4 full ATHENA model | gated nonlinear residual correction | **Implemented** |
| F6 | Automated model comparison | Research Studio model hierarchy | **Implemented** |
| G1 | Personalization ablation | population baseline ablation | **Implemented** |
| G2 | Temporal/trust-gate ablation | ungated correction comparison | **Implemented** |
| G3 | Event-context ablation | no event/environment model | **Implemented** |
| G4 | Environment ablation | no environmental variables | **Implemented** |
| G5 | Recent/trajectory ablation | no recent trajectory variables | **Implemented** |
| G6 | Feature-group diagnostics | grouped permutation analysis | **Implemented** |
| G7 | Scientific discovery layer | UI summaries tied to result JSON | **Implemented** |
| H1 | Leakage prevention | strictly prior lag features + unit test | **Implemented** |
| H2 | Train/calibration/evaluation separation | through-2023 / 2024 / 2025 | **Implemented** |
| H3 | Forward-time audit | partial 2026 shift | **Implemented** |
| H4 | Rolling-origin validation | 2023/2024/2025 test folds | **Implemented** |
| H5 | Held-out evaluation | 2025 main result | **Implemented** |
| H6 | Task-appropriate metrics | MAPE/MAE/RMSE/median APE/within thresholds | **Implemented** |
| H7 | Confidence intervals | prediction intervals | **Implemented** |
| H8 | Repeated-measure uncertainty | athlete-cluster bootstrap | **Implemented** |
| H9 | Effect comparison | absolute/relative MAPE deltas | **Implemented** |
| H10 | Development disclosure | explicit retrospective-development boundary | **Implemented** |
| I1 | Missing-data robustness | all environment missing stress | **Implemented** |
| I2 | Noise robustness | performance/context perturbation stress | **Implemented** |
| I3 | Sparse history | 1–3 prior subgroup | **Implemented** |
| I4 | Mature history | ≥8 prior subgroup | **Implemented** |
| I5 | Outlier/difficult cases | largest error cases | **Implemented** |
| I6 | Large discontinuity subgroup | >30% prior-result change retained | **Implemented** |
| I7 | Distribution shift | 2026 audit | **Implemented** |
| I8 | Failure Observatory | interactive largest-error viewer | **Implemented** |
| I9 | Failure taxonomy | overlapping diagnostic categories | **Implemented** |
| I10 | Model-disagreement failures | top disagreement cases | **Implemented** |
| I11 | Fail→diagnose→modify→retest | preserved V0 failure + iteration record | **Implemented** |
| J1 | Complexity-versus-benefit analysis | Pareto table | **Implemented** |
| J2 | Model size tracking | serialized KB | **Implemented** |
| J3 | Fit-time tracking | seconds per model | **Implemented** |
| J4 | Inference performance | full path ms/1000 | **Implemented** |
| J5 | Simple-baseline preservation | M1 remains default outside gate | **Implemented** |
| K1 | Public/open dataset integration | NRCD v2.0.0 bundled | **Implemented** |
| K2 | Data cleaning | target-specific deterministic pipeline | **Implemented** |
| K3 | Data normalization/transforms | log time/residual features | **Implemented** |
| K4 | Data quality checks | missingness + cleaning log | **Implemented** |
| K5 | Data provenance | docs + source/license/creators | **Implemented** |
| K6 | Dataset versioning | v2.0.0 + checksum | **Implemented** |
| K7 | Data dictionary | generated artifact + docs | **Implemented** |
| K8 | Claim-domain separation | NRCD explicitly does not validate wellness | **Implemented** |
| K9 | Secondary dataset registry | separate future domains only | **Implemented** |
| K10 | No synthetic research evidence | synthetic only allowed for software tests; no fabricated results | **Implemented** |
| L1 | Experiment ID tracking | ATHENA-NRCD-NEXT-RACE-v2 | **Implemented** |
| L2 | Model configuration tracking | estimator/grid/gate parameters serialized | **Implemented** |
| L3 | Software version tracking | Python/pandas/NumPy/sklearn | **Implemented** |
| L4 | Processing version/checksum | script + raw SHA | **Implemented** |
| L5 | Reproducible experiment mode | one-command pipeline | **Implemented** |
| L6 | Reproducible test mode | npm test | **Implemented** |
| L7 | Exportable research artifact | JSON | **Implemented** |
| M1 | Literature/SOTA comparison | docs/SOTA_AND_NOVELTY.md | **Implemented** |
| M2 | Prior runner prediction acknowledged | Blythe & Király 2016 | **Implemented** |
| M3 | Prior state-space runner modeling acknowledged | Stival et al. 2023 | **Implemented** |
| M4 | Recovery ML acknowledged | Rothschild et al. 2024 | **Implemented** |
| M5 | Recent latent athlete memory work acknowledged | Lee 2026 preprint | **Implemented** |
| M6 | Precise novelty boundary | no first-dynamic-model claim | **Implemented** |
| M7 | Working contribution statement | Evidence Gate + integrated transparent research/product framework | **Implemented** |
| N1 | Relay exact optimization | enumerate 24 orders | **Implemented** |
| N2 | Formal objective | reference time + role fit + exchange risk | **Implemented** |
| N3 | Transparent explanation | score components/caution text | **Implemented** |
| N4 | Sensitivity analysis | eight ±1 scenarios | **Implemented** |
| N5 | V1 baseline comparison | legacy heuristic rank/objective | **Implemented** |
| N6 | Near-tie handling | nearTieThreshold and UI | **Implemented** |
| N7 | Tie/uncertainty caution | not validated finish-time predictor | **Implemented** |
| N8 | Optimization reproducibility | deterministic event-tool test | **Implemented** |
| O1 | Quantum legitimacy screen | fixed 4-person problem evaluated | **Implemented** |
| O2 | Classical exact baseline | 24-order exhaustive optimum | **Implemented** |
| O3 | QUBO/assignment formulation note | docs/QUANTUM_OPTIMIZATION_NOTE.md | **Implemented** |
| O4 | No buzzword-only quantum | quantum explicitly rejected at current scale | **Implemented** |
| P1 | Command Center 2.0 | upgraded | **Implemented** |
| P2 | Event Genome | preserved/upgraded | **Implemented** |
| P3 | Daily readiness inputs | preserved as current-state observations | **Implemented** |
| P4 | Session Compatibility | state-aware + safety abstain | **Implemented** |
| P5 | Sprint Architect | transparent phase blueprint | **Implemented** |
| P6 | Rhythm Engine | transparent hurdle rhythm | **Implemented** |
| P7 | Pace Matrix | goal-sum checked | **Implemented** |
| P8 | Flight Log | attempt stats/trend | **Implemented** |
| P9 | Throw Vault | attempt stats/trend | **Implemented** |
| P10 | Relay Intelligence | 2.0 exact optimization | **Implemented** |
| P11 | Health Hub | evidence-based educational references | **Implemented** |
| P12 | SBAR | 2.0 structured communication | **Implemented** |
| P13 | Research Studio | 2.0 connected evidence + N-of-1 | **Implemented** |
| Q1 | Historical/retrospective replay | representative held-out 2025 examples | **Implemented** |
| Q2 | Pre-event information discipline | lag features only | **Implemented** |
| Q3 | Retrospective labeling | UI explicitly says ATHENA was not present prospectively | **Implemented** |
| Q4 | No prevention counterfactual claim | documented | **Implemented** |
| R1 | Preserve ATHENA identity | dark research-oriented core retained | **Implemented** |
| R2 | Major visual upgrade | custom visual system/cards/layout | **Implemented** |
| R3 | Progressive disclosure | Athlete/Technical modes + Methods | **Implemented** |
| R4 | Advanced visualizations | state/trajectory/bars/folds/scenarios | **Implemented** |
| R5 | Responsive/mobile | 390px E2E no-overflow check | **Implemented** |
| R6 | Accessibility | labels, focus states, reduced motion, alt text | **Implemented** |
| R7 | Loading/empty/error states | research banner/forms/history | **Implemented** |
| R8 | Selective animation | reveal/orbit with reduced-motion fallback | **Implemented** |
| R9 | Light theme | theme toggle | **Implemented** |
| R10 | Research mode clarity | Research Studio/Methods separated from athlete answer | **Implemented** |
| R11 | Guided onboarding | six-step in-app guide + contextual navigation + Pallas | **Implemented** |
| R12 | Useful sparse-history UX | provisional/fallback wording instead of dead-end “no result” | **Implemented** |
| S1 | Custom ATHENA emblem | assets/athena-mark.svg | **Implemented** |
| S2 | PWA icon set | 192/512 PNG | **Implemented** |
| S3 | Athena-inspired geometry | shield/A/eye visual motif | **Implemented** |
| S4 | Founder photo slots | two circular local assets | **Implemented** |
| S5 | 50/50 founder attribution | About section | **Implemented** |
| T1 | Privacy audit | local-first behavior precisely stated | **Implemented** |
| T2 | Remove public personal emails | legacy source removed/final grep | **Implemented** |
| T3 | Local delete control | About | **Implemented** |
| T4 | Local export | profile/state/research exports | **Implemented** |
| T5 | No clinical storage claim | explicit localStorage limitation | **Implemented** |
| T6 | Health boundary | no diagnosis/clearance/injury guarantee | **Implemented** |
| T7 | Safety override | performance modeling stops on serious flags | **Implemented** |
| T8 | Heat source upgrade | NWS Rothfusz, not custom pseudo-risk score | **Implemented** |
| T9 | Concussion conservative language | CDC-aligned return supervision | **Implemented** |
| T10 | Source/claim attribution | privacy/safety docs | **Implemented** |
| U1 | Modular architecture | js modules | **Implemented** |
| U2 | Automated state/event tests | tests/test_engine.mjs | **Implemented** |
| U3 | Research unit tests | tests/test_research_pipeline.py | **Implemented** |
| U4 | Static integrity tests | tests/test_static_integrity.py | **Implemented** |
| U5 | Real browser E2E | tests/e2e_smoke.py + Chromium | **Implemented** |
| U6 | Input validation | form ranges/JS guards | **Implemented** |
| U7 | Error handling | research fetch/banner and guarded UI | **Implemented** |
| U8 | Performance | static app + small model artifact | **Implemented** |
| U9 | PWA/offline | manifest/service-worker | **Implemented** |
| U10 | Mobile QA | Chromium 390px check + screenshot | **Implemented** |
| V1 | Architecture docs | ARCHITECTURE.md | **Implemented** |
| V2 | Mathematical docs | MATHEMATICAL_METHODS.md | **Implemented** |
| V3 | Research methodology/results | RESEARCH_METHODS_AND_RESULTS.md | **Implemented** |
| V4 | Data provenance | DATA_PROVENANCE.md | **Implemented** |
| V5 | Model card | MODEL_CARD.md | **Implemented** |
| V6 | Feasibility | FEASIBILITY.md | **Implemented** |
| V7 | Reproducibility | REPRODUCIBILITY.md | **Implemented** |
| V8 | Privacy/safety | PRIVACY_SAFETY.md | **Implemented** |
| V9 | SOTA/novelty | SOTA_AND_NOVELTY.md | **Implemented** |
| V10 | Quantum decision note | QUANTUM_OPTIMIZATION_NOTE.md | **Implemented** |
| V11 | QA report | QA_REPORT.md | **Implemented** |
| V12 | Implementation matrix | IMPLEMENTATION_MATRIX.md | **Implemented** |
| V13 | Build report | BUILD_REPORT.md | **Implemented** |
| V14 | Sources | SOURCES.md | **Implemented** |
| V15 | Limitations | embedded in model/research/data docs | **Implemented** |
| V16 | Wellness evidence | WELLNESS_EVIDENCE.md + in-app evidence layer | **Implemented** |
| V17 | Prospective validation docs | PROSPECTIVE_VALIDATION.md | **Implemented** |
| W1 | Killer demonstration | docs/KILLER_DEMO.md | **Implemented** |
| W2 | Reviewer understands evidence quickly | Research summary metric cards | **Implemented** |
| W3 | Prediction→confidence→why→what-if | Command/Intelligence flow | **Implemented** |
| W4 | Baseline comparison→validation evidence | Research Studio flow | **Implemented** |
| W5 | Feasibility visible in app | Methods feasibility panel | **Implemented** |
| X1 | Independent secondary-domain evidence | PMData ATHENA next-day readiness reanalysis + leave-one-participant-out stress test; SoccerMon/REST remain separate supporting domains | **Implemented** |
| X2 | Prospective ATHENA-specific validation capability | locked in-app protocol, version fingerprint, future-record capture, minimum-data gate, temporal evaluation, archive/export | **Implemented; empirical result correctly waits for future data** |
| X3 | Pallas local assistant | navigation, state explanations, troubleshooting, personal-history Q&A, no API key | **Implemented** |
| X4 | Personal timed-performance log | local results, personal averages/best/recent context, CSV export | **Implemented** |
| X5 | Pallas performance Q&A | compares logged running results to prior personal average; refuses insufficient history | **Implemented** |
| X6 | Stronger comparator / rejected-method audit | direct nonlinear HGB comparator + rejected event-conditional calibration diagnostic | **Implemented** |

| X7 | Athlete-level paired randomization diagnostic | 20,000 sign flips on equal-weight athlete mean APE differences | **Implemented** |
| X8 | Predefined subgroup calibration audit | history depth + sport + gender error/interval/gate metrics | **Implemented** |
| X9 | Exact PMData participant randomization test | all 65,536 sign assignments across 16 participants | **Implemented** |
| X10 | PMData split sensitivity | 50/25/25 and 70/15/15 chronological re-evaluations | **Implemented** |
| X11 | Scrambled-target negative control | target-permuted training with calibration still active | **Implemented** |
| X12 | Automated Evidence Integrity verifier | scripts/verify_evidence.py | **Implemented** |
| X13 | Generated claim ledger | data/derived/evidence_integrity.json | **Implemented** |
| X14 | Reviewer-facing Evidence Integrity UI | Methods panel with checks, limits, subgroup audit, claim ledger | **Implemented** |

## Count

- Total tracked items/sub-requirements: **211**
- Implemented as current software/research/documentation capabilities: **211/211**
- Current empirical evidence status: primary NRCD performance experiment and secondary PMData wellness experiment are both reanalyzed in-repo; SoccerMon/REST remain supporting evidence domains; Prospective Validation Mode is operational but correctly cannot contain a future result until future data are collected.

The existence of many checklist items does not change the central research scope: one primary longitudinal running-performance experiment remains the measurable core. The additional evidence/prospective layers close product-research gaps without pretending all domains are the same experiment.
