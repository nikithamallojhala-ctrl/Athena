# ATHENA OS

**ATHENA OS** is a local-first, event-aware athlete-state modeling and track & field research platform co-founded and co-developed equally by **Nikitha Mallojhala** and **Shriyan Avadhanula**.

Version **2.5.0** preserves ATHENA's original athlete tools while adding a dynamic local athlete-state engine, transparent event calculators, exact relay-order optimization, two reproducible real-world public-data validation tracks, athlete/participant-level randomization diagnostics, split-sensitivity and negative controls, an automated Evidence Integrity ledger, uncertainty/abstention, failure analysis, counterfactuals, a locked prospective-validation workflow, guided onboarding, and **Pallas**, an API-key-free local assistant for navigation and personal-history questions. v2.5.0 adds a signature visual hierarchy, a high-visibility evidence stage, a six-capability differentiator stage, a richer founder showcase, resilient founder-photo configuration, a dedicated Pallas companion mark, and separate athlete/reviewer tours without changing the validated research artifacts.

## Start the app

No build step or API key is required. Serve the repository as static files:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/`.

Opening `index.html` directly from the filesystem is not recommended because browsers commonly block `fetch()` of bundled research JSON under `file://`.

## Reproduce both public-data experiments

```bash
python -m pip install -r requirements-research.txt
npm run research
```

This regenerates:

- `data/derived/research_results.json` — primary NRCD performance experiment
- `data/derived/wellness_results.json` — secondary PMData wellness experiment
- `data/derived/evidence_integrity.json` — automated claim/hash/guardrail verification ledger

Latest measured build-environment runtimes are serialized into the generated artifacts; both pipelines and the evidence verifier are CPU-only and intended for ordinary local execution. The primary pipeline peaked at approximately **417 MB RSS**. No GPU, paid model API, or remote training service is required.

## Run the test suite

```bash
npm test
```

The suite covers state-engine math, missing-data behavior, safety overrides, counterfactual semantics, deterministic event tools, all 24 relay permutations, health-reference calculations, SBAR behavior, research leakage/integrity, PMData wellness validation, Pallas, personal performance logging, static integrity, and a real Chromium end-to-end smoke test including mobile overflow checks.

## Primary research result — longitudinal running performance

Question:

> Can a dynamic, individualized, event-aware representation of prior athlete performance improve one-step-ahead prediction while abstaining when development evidence is insufficient?

Protocol: train through 2023, tune/calibrate on 2024 only, evaluate on 2025, then audit partial 2026 distribution shift.

- 2025 held-out predictions: **11,745**
- M1 personalized baseline MAPE: **4.023%**
- M4 ATHENA gated dynamic MAPE: **3.936%**
- Change: **−0.087 MAPE points** (**−2.16% relative**)
- Dynamic correction coverage: **37.2%**; otherwise ATHENA falls back to M1
- Athlete-cluster bootstrap 95% interval for M4−M1 MAPE: **[−0.098, −0.075]** points
- Rolling-origin folds improved: **3/3**
- Equal-athlete paired sign-flip diagnostic: **one-sided p < 0.00005** across 3,744 athlete clusters
- Predefined history/sport/gender subgroup audit reports both error and interval/gate coverage instead of hiding weak groups
- Partial-2026 dynamic coverage: **2.26%**, demonstrating conservative fallback under event-mix shift
- Strong direct nonlinear comparator (C1 HGB): **5.917% MAPE**, worse than the personalized-residual architecture
- A tested event-conditional interval method was **rejected** because it slightly reduced coverage while widening intervals

These are **preliminary retrospective** results, not a prospective trial.

## Secondary research result — wellness / next-day readiness

ATHENA separately reanalyzes all 16 public PMData participant wellness files. This experiment does **not** use the NRCD race dataset.

Question:

> Can individualized temporal wellness state improve next-day subjective readiness prediction over generic/static and persistence baselines?

- Chronological evaluation: **341** later-period predictions
- W1 persistence MAE: **1.029 readiness points**
- W4 ATHENA dynamic wellness MAE: **0.945**
- Relative MAE change: **−8.22%**
- Leave-one-participant-out: ATHENA beats persistence for **12/16** held-out people and the static model for **15/16**
- Participant-cluster bootstrap 95% interval for ATHENA−persistence MAE: approximately **[−0.205, +0.022]** points
- Exact participant-level sign-flip: **two-sided p ≈ 0.207** — explicitly non-definitive
- Alternate chronological splits: **50/25/25 = −10.86%** and **70/15/15 = −7.52%** relative MAE change versus persistence
- Scrambled-target negative control creates **no material gain**

Because that interval crosses zero and the cohort is small, ATHENA reports this as **promising secondary-domain replication, not definitive superiority**. It does not establish medical readiness, causality, injury prevention, or clinical validity.

## Pallas — no API key

**Pallas — Athena's close companion and friend** is a local, evidence-bound assistant. It can:

- explain how to navigate ATHENA;
- summarize the athlete's current local state;
- explain state-factor changes and confidence;
- compare local state history;
- answer personal timed-running-history questions such as whether recent results are faster/slower than prior personal average;
- log a simple timed result command such as `log 100m 12.45`;
- route health/safety questions to the conservative Health/SBAR sections.

Pallas does not require an LLM API key and does not upload athlete history to a remote service. If the local history is insufficient, it says so instead of inventing an answer.

## Critical claim boundary

The NRCD experiment validates a **retrospective longitudinal running-performance prediction mechanism**. PMData separately tests a **subjective wellness/readiness time-series mechanism**. Neither dataset validates medical clearance, diagnosis, injury prevention, or causal treatment recommendations.

SoccerMon and REST remain supporting external evidence for the choice of longitudinal wellness/sleep observations; they are not presented as ATHENA reanalysis results in this release.

ATHENA is educational/research software. It does not diagnose, provide medical clearance, guarantee performance, or guarantee injury prevention.

## Repository map

- `index.html` — canonical interface
- `styles.css` — ATHENA visual system and responsive layout
- `js/state-engine.js` — dynamic local athlete-state model
- `js/event-tools.js` — sprint/rhythm/pace/jumps/throws/relay calculations
- `js/health.js` — educational heat, heart-rate, sleep, safety, and SBAR logic
- `js/performance-log.js` — local timed-performance history and personal comparisons
- `js/pallas.js` — local API-key-free assistant
- `js/research-ui.js` — both validation domains, ablations, failures, experiment lab
- `js/prospective.js` — locked future-data validation protocol and minimum-data gate
- `scripts/research_pipeline.py` — primary NRCD pipeline
- `scripts/wellness_validation.py` — secondary PMData pipeline
- `scripts/verify_evidence.py` — raw-hash, claim-ledger, negative-control, and uncertainty guardrail verifier
- `data/raw/` — attributed public source data used for reproducibility
- `data/derived/` — generated research artifacts
- `tests/` — unit, integrity, research, and Chromium E2E tests
- `docs/` — architecture, mathematics, model cards, data, feasibility, novelty, privacy, QA, implementation matrix

## Founder photo slots

Drop square images at:

- `assets/founders/nikitha.jpg`
- `assets/founders/shriyan.jpg`

The About section automatically crops them into circular portraits. If you use different filenames or file extensions, edit `assets/founders/photos.json` with the exact case-sensitive filename. If no working image is found, ATHENA displays initials instead. See `assets/founders/README.md`.

## Licensing and attribution

Third-party public datasets retain their own licenses/citation requirements. See `data/README.md`, `docs/DATA_PROVENANCE.md`, and `docs/SOURCES.md`. Inclusion in this research package does not transfer ownership of third-party data to ATHENA.
