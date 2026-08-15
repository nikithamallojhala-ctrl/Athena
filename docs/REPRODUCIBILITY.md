# Reproducibility

## Release
- ATHENA OS version: `2.4.0`
- Random seed: `42` where stochastic procedures are used

## Primary performance experiment
- Experiment ID: `ATHENA-NRCD-NEXT-RACE-v2.4`
- Dataset: NRCD v2.0.0
- Dataset SHA-256: `2fdeb707163779bdf00c01d5722474aca02f7b7a7ab1ea1cdbba2a9ab40a234d`
- Output: `data/derived/research_results.json`
- Script: `scripts/research_pipeline.py`

## Secondary wellness experiment
- Experiment: `ATHENA OS Phase 1D evidence-hardening wellness-state validation`
- Dataset: PMData public wellness files, participants p01–p16
- Each source file SHA-256 is recorded in `data/derived/wellness_results.json`
- Output: `data/derived/wellness_results.json`
- Script: `scripts/wellness_validation.py`

## Build environment recorded in generated artifacts
Latest generated artifacts record Python/platform and package versions. At release generation, the environment included Python 3.13.5, pandas 2.2.3, NumPy 2.3.5, and scikit-learn 1.8.0.

## Rebuild both research artifacts

```bash
python -m pip install -r requirements-research.txt
npm run research
```

Or run independently:

```bash
python scripts/research_pipeline.py
python scripts/wellness_validation.py
python scripts/verify_evidence.py
```

Latest build-environment runtime was approximately **20.3 s** for NRCD and **1.1 s** for PMData. Runtime is not a correctness invariant and will vary by machine.

## Run automated checks

```bash
npm test
```

Individual layers:

```bash
npm run test:engine
npm run test:python
npm run test:e2e
```

## Determinism and honest variation
Tree/boosting and sampling procedures use fixed project seeds where applicable. Floating-point results can vary slightly across platforms/library versions, so exact artifact values, source checksums, model configuration, and environment metadata are serialized rather than manually copied as hidden constants.

## Evidence integrity rules
1. Never edit generated metric values by hand to improve appearance.
2. Never select held-out rows after seeing errors to create a better test set.
3. Keep materially informative failed/negative development artifacts.
4. If raw data changes, update version/checksum and regenerate evidence.
5. Keep primary performance, secondary wellness, and prospective validation as distinct claims.
6. Report missingness and difficult cases rather than silently deleting them.
7. If a more complicated method loses—as happened with the direct HGB comparator and event-conditional interval diagnostic—retain that result.
8. A prospective result must not appear until the locked prospective protocol has accumulated real future observations.
9. Run `scripts/verify_evidence.py` after regenerating artifacts; release-blocking consistency/hash checks must pass.
10. Preserve non-significant or unfavorable diagnostics (for example the PMData exact participant-level p-value and subgroup interval under-coverage) rather than editing the narrative around them.
