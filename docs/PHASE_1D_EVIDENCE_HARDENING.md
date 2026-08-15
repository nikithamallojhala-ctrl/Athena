# Phase 1D — Evidence Hardening

## Goal
Move ATHENA closer to a near-9.9 research-quality build **without** adding decorative AI or pretending retrospective data are prospective.

## Implemented
1. Athlete-level paired randomization test for the primary NRCD result.
2. Predefined history-depth, sport, and gender subgroup audit with prediction-error, interval-coverage, and gate-coverage metrics.
3. Exact participant-level PMData sign-flip test.
4. Alternate chronological split sensitivity for PMData.
5. Scrambled-target negative control.
6. Evidence Integrity release verifier with raw-file SHA-256 checks.
7. Claim ledger that maps visible headline claims to exact JSON artifact locations and claim boundaries.
8. In-app reviewer-facing integrity panel.

## What the new evidence says
The primary performance effect remains modest but robust to athlete-level resampling/randomization and is stronger in deeper-history bands. The PMData result remains promising and directionally stable across alternate temporal splits, but its exact participant-level p-value is not conventionally significant. ATHENA exposes that limitation directly.

## Remaining ceiling
A real locked prospective pilot, larger independent wellness cohort, independent third-party reproduction, and measured usability/comprehension study remain the highest-value steps.
