# Feasibility Engineering

ATHENA's feasibility is designed into the architecture rather than asserted in a proposal paragraph.

## 1. One primary research deliverable, one clearly separate replication

The central experiment remains:

> next individual running performance from strictly prior athlete/event history and archived context.

The PMData wellness analysis is a **secondary validation domain**, not a second giant project. It asks a narrower next-day subjective-readiness question and exists to close the wellness evidence gap without mixing incompatible datasets.

## 2. Measured compute

Latest measurements in the build environment:

- NRCD raw-data → final research JSON: about **20.3 seconds**
- PMData wellness → final research JSON: about **1.1 seconds**
- primary peak RSS: about **417 MB**
- M4 primary model fit: about **1.31 seconds**
- M4 primary serialized size: about **449 KB**
- GPU: **not required**
- paid model/API calls: **none**
- Pallas API key: **none**
- web backend/database: **not required** for the static product

Runtime varies by machine, but this scale supports repeated student experiments on ordinary CPU hardware.

## 3. Deployment feasibility

The user-facing app is static HTML/CSS/JavaScript. It can be served from GitHub Pages or another static host. Model training and public-data reanalysis occur offline in Python and serialize reviewer-readable JSON for the browser.

This deliberately avoids:
- a mandatory cloud backend;
- a secret API key in public source;
- GPU hosting;
- paid inference services;
- a database administration burden.

## 4. Pallas feasibility

Pallas is useful without pretending to be a cloud LLM. It operates on deterministic intent handling plus ATHENA's local stored state/performance history. That means:

- it works without an API key;
- it can run offline after the PWA assets are cached;
- athlete data does not need to leave the device;
- failure behavior is predictable;
- insufficient history produces an explicit limitation rather than hallucinated personal analysis.

A future server-side language model could be added behind a privacy-preserving architecture, but the current research/product does not depend on it.

## 5. Data feasibility

### Primary
NRCD provides enough longitudinal individual running results to support a real chronological prediction experiment and a partial-2026 shift audit.

### Secondary
PMData provides a small but usable longitudinal wellness cohort. The files used by ATHENA are compact and require no large GPS/media download.

### Supporting only
SoccerMon and REST remain external evidence domains unless/until a separate compatible protocol is specified. ATHENA does not merge datasets simply to increase apparent size.

## 6. Failure/fallback matrix

| Risk | Detection | Feasible response |
|---|---|---|
| Dynamic model does not beat M1 | calibration/evaluation hierarchy | keep M1 as winner; report negative result |
| More complex comparator loses | direct comparison | retain the simpler model and preserve the negative comparator |
| Event context lacks support | calibration support / missingness | Evidence Gate falls back to M1 |
| 2026 distribution changes | forward-time audit | dynamic coverage contracts instead of aggressive extrapolation |
| Conditional uncertainty method gets worse | held-out coverage + width | reject it and retain the simpler global method |
| Wellness result is uncertain at participant level | cluster bootstrap | label it promising rather than definitive |
| Wellness fields are missing | robustness test | impute/model only by pre-specified pipeline behavior; report degradation |
| Participant recruitment unavailable | study logistics | retrospective public-data evidence still completes independently |
| Future prospective result does not yet exist | Prospective Mode minimum-data gate | show no empirical result until real future records satisfy protocol |
| Paid compute unavailable | measured CPU pipeline | no dependency on paid compute |
| Quantum adds no value to four-runner relay | exact problem size = 24 permutations | use exact enumeration; reject buzzword complexity |

## 7. Semester-scale execution structure

A credible semester-scale plan can be staged without risking the core deliverable:

1. **Weeks 1–2:** freeze protocol/data versions; reproduce NRCD + PMData baselines.
2. **Weeks 3–5:** refine evidence-gated model and uncertainty using development/calibration only.
3. **Weeks 6–8:** robustness, ablations, external-user stress tests, failure analysis.
4. **Weeks 9–10:** prospective pilot setup/permissions if available; no dependence on pilot success for the retrospective result.
5. **Weeks 11–12:** independent rerun, UI comprehension/usability check, documentation and final audit.

The project therefore has a complete minimum viable research result early, with later work adding evidence rather than rescuing an unfinished core.

## 8. Current-versus-future boundary

### Implemented now
Static app, dynamic local state engine, all Event Lab tools, exact relay optimization, Pallas, personal performance history, NRCD primary experiment, PMData secondary experiment, model hierarchy, Evidence Gate, held-out/rolling evaluation, uncertainty, cluster bootstrap, LOPO wellness stress test, ablations, robustness, Failure Observatory, prospective protocol tooling, tests, documentation, and reviewer-facing evidence UI.

### Meaningful future evidence
A real prospective cohort result, larger independent wellness replication, formal relay-outcome validation, independent reproduction by an outside person, and human-factor/usability evidence.

These are **future empirical extensions**, not missing software features.

## 9. Why the scope is believable

ATHENA is broad as a product but deliberately narrow as research. Computationally expensive or operationally risky components are not required for the central result. Negative results have pre-defined fallbacks, public data reproduces both current empirical tracks, and the app itself requires only static hosting.

That modularity is the project's strongest feasibility defense.
