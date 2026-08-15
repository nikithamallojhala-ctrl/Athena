# Quantum / Quantum-Inspired Optimization Investigation

## Current decision: do not add a quantum solver

Relay ordering is a legitimate assignment/permutation optimization problem, but ATHENA currently optimizes **four fixed athletes across four legs**.

The search space is:

```text
4! = 24 orders
```

ATHENA can evaluate all 24 exactly in negligible time. A quantum or quantum-inspired solver would add implementation complexity without improving solution quality for this fixed problem.

## Classical formulation

Let `x_(i,l) ∈ {0,1}` indicate athlete `i` assigned to leg `l`.

Constraints:

```text
Σ_i x_(i,l) = 1   for every leg l
Σ_l x_(i,l) = 1   for every athlete i
```

A generalized objective can combine leg-role cost and adjacent-exchange cost. That formulation can be converted into a QUBO by penalizing assignment-constraint violations, but doing so is unnecessary for four athletes.

## When reconsideration would be legitimate
A quantum/quantum-inspired comparison would become scientifically meaningful only if ATHENA studies a much larger combinatorial variant—for example selecting and ordering relay squads from a large roster across many races/constraints—then compares exact/classical heuristic/quantum-inspired methods on:

- objective quality
- runtime
- scaling with roster size
- robustness
- hardware/access cost

Until such a problem exists, rejecting the buzzword is the technically stronger choice.
