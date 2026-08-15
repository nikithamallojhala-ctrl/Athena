# ATHENA Architecture

## Design principle

ATHENA deliberately separates **six kinds of logic** rather than labeling every output “AI”:

1. **Local dynamic state modeling** — transparent, time-updating athlete-state representation from local check-ins.
2. **Deterministic sport calculators** — sprint phase planning, pace arithmetic, hurdle rhythm, attempt statistics, exact relay enumeration.
3. **Primary public-data learned validation** — NRCD longitudinal running-performance research.
4. **Secondary public-data wellness validation** — PMData next-day subjective-readiness research.
5. **Pallas local assistant** — evidence-bound navigation and local-history question answering, with no API key.
6. **Safety/health education** — conservative reference calculations and communication support separated from performance/wellness model claims.

This separation is a credibility and feasibility feature.

## Runtime data flow

```text
Athlete profile + local check-in
          │
          ▼
  Dynamic State Engine ─────► confidence / abstention / state trajectory
          │                              │
          ├────────► Session Compatibility│
          │                              │
          ▼                              ▼
  Explainability / what-if / provenance / local export
          │
          └────────► Pallas local Q&A (only stored evidence)

Timed personal results ─► Performance Log ─► averages / best / recent trend ─► Pallas

Event inputs ─► deterministic Event Lab ─► transparent calculations

Health inputs ─► conservative health reference layer ─► safety override / SBAR

research_results.json ──────┐
                            ├─► Research Studio 2.0
wellness_results.json ──────┘

raw NRCD ─► research_pipeline.py ─► research_results.json
raw PMData wellness ─► wellness_validation.py ─► wellness_results.json
```

## Canonical modules

### `js/state-engine.js`
Owns state representation, event demand vectors, personal-history smoothing, current-state confidence, personal baseline/deviation context, abstention, and safety override. Product state outputs are modeled summaries, **not clinically validated scores**.

### `js/performance-log.js`
Stores timed personal running results locally, computes athlete-specific averages/best/recent context, exports CSV, and supplies evidence for Pallas. It is not a recruiting/ranking database.

### `js/pallas.js`
Implements the API-key-free local assistant. Pallas recognizes supported navigation, state, trend, performance-history, logging, and troubleshooting intents. It reads only ATHENA's local data and refuses unsupported personal conclusions when evidence is missing.

### `js/event-tools.js`
Contains deterministic track & field tools. Relay Intelligence enumerates all 4! = 24 permutations exactly; it does not pretend a tiny combinatorial problem requires a black-box optimizer.

### `js/health.js`
Contains NWS Heat Index context, general heart-rate reference, sleep summary, safety signals, and SBAR logic. It is intentionally separate from the learned research experiments.

### `js/research-ui.js`
Loads frozen generated artifacts from both validation pipelines and renders model hierarchy, uncertainty, robustness, failures, external-user stress tests, and claim boundaries. Browser users do not retrain models.

### `js/prospective.js`
Implements protocol lock/fingerprint, local future-record capture, minimum-data gate, temporal evaluation, archive, and export. It makes prospective validation operational without inventing prospective evidence.

### `scripts/research_pipeline.py`
Runs the primary NRCD performance experiment: cleaning, leakage-safe histories, temporal split, M0–M4 hierarchy, Evidence Gate, uncertainty, stronger comparator, rejected calibration diagnostic, ablations, robustness, rolling folds, shift audit, failures, and reproducibility metadata.

### `scripts/wellness_validation.py`
Runs the PMData secondary experiment: longitudinal wellness feature construction, W0–W4 hierarchy, calibration-only blend selection, participant-cluster bootstrap, leave-one-participant-out transfer test, ablations, robustness, failures, and provenance hashes.

## Local persistence

Browser state uses `localStorage`. Data generally stays on that browser/device and is not uploaded by ATHENA's static app. **Local storage is not encrypted medical-record storage**, and ATHENA does not claim it is.

## Offline/PWA design

`service-worker.js` caches the app shell and derived research artifacts, including Pallas/performance-log modules. Large raw research files are intentionally excluded from the browser cache; they belong to offline reproducibility, not the live app.

## Progressive disclosure

- **Athlete:** “What should I look at and what changed?”
- **Pallas:** “Help me find/explain it using my stored data.”
- **Advanced user:** “Why did ATHENA reach that modeled state?”
- **Technical reviewer:** “What exact method, evidence, failure mode, and claim boundary supports this?”

This allows the interface to stay usable while exposing rigorous research depth underneath.
