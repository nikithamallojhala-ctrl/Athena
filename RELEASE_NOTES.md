# ATHENA OS v2.4.0 — Phase 1D Evidence Hardening

## Purpose
Phase 1D deliberately avoids feature bloat. It pushes ATHENA closer to a near-perfect research build by making the two real-world validation tracks harder to attack and easier to audit.

## New research-hardening additions
- Athlete-level paired sign-flip randomization diagnostic for the NRCD 2025 performance result.
- Predefined subgroup audit across history depth, sport, and gender with error, interval coverage, and Evidence Gate coverage.
- Exact 2^16 participant-level sign-flip test for the PMData wellness result.
- Alternate participant-wise chronological split sensitivity (50/25/25 and 70/15/15).
- Scrambled-training-target negative control for the PMData pipeline.
- Automated `scripts/verify_evidence.py` release gate.
- Generated `data/derived/evidence_integrity.json` claim ledger tying headline values to source artifacts and raw-data hashes.
- In-app Evidence Integrity panel exposing passed checks, small-cohort uncertainty, weak calibration subgroups, and claim boundaries.

## Evidence summary
### NRCD performance
- M1 personalized baseline: **4.023% MAPE**
- M4 ATHENA gated dynamic: **3.936% MAPE**
- athlete-cluster bootstrap interval remains below zero
- rolling-origin improvement: **3/3 folds**
- equal-athlete sign-flip diagnostic: **p < 0.00005** (20,000 randomizations)
- benefit is larger in deeper-history bands, while subgroup interval under-coverage is surfaced rather than hidden

### PMData wellness
- persistence MAE: **1.029**
- ATHENA MAE: **0.945**
- alternate chronological splits preserve the improvement direction
- exact participant-level two-sided sign-flip **p ≈ 0.207**, so the result remains explicitly promising rather than definitive
- scrambled-target control produces no material artificial benefit

## Release philosophy
The build does not claim that extra statistical checks create prospective evidence. They make the existing retrospective real-world evidence more transparent, reproducible, and difficult to overstate. A genuine prospective pilot remains the largest step toward a true ~9.9 research package.
