# ADR 0004: Versioned Quality Lab contracts and traceability

- **Status:** Accepted
- **Date:** 2026-07-11
- **Decision owners:** Life Science Atlas product and engineering

## Context

The first Quality Lab concept engine mixed its input shape, calculation version, microbiology assumptions, and report output into one module. It exposed assumptions at report level but could not answer four controlled-delivery questions reliably:

1. Which input and output contract produced this project?
2. Which versioned rule produced a material output?
3. Which evidence or concept benchmark supports that rule?
4. Which missing site facts prevent the Blueprint from controlled use?

This made the prototype useful for interaction testing but unsuitable as the basis for repeatable service-assisted Blueprint delivery.

## Decision

Quality Lab now separates and versions four layers:

- `quality-lab-input/v1` — canonical project intake contract;
- `quality-lab-blueprint/v1` — canonical compiled output contract;
- `compiler-core/v1.0` — shared capacity, resource, cost, and space logic;
- `microbiology-pack/v1.1` — domain evidence and workflow rules.

Every compiled Blueprint must validate against `qualityLabBlueprintSchema` and contain:

- the exact input snapshot and contract versions;
- Domain Pack identity, version, status, and scope;
- an evidence register that distinguishes public references, user inputs, internal concept benchmarks, and required site evidence;
- a versioned rule trace with applicability, limitations, confidence, evidence IDs, output types, and review requirements;
- unresolved inputs with severity, decision impact, resolution path, and related rules;
- a data-quality summary;
- a review object that remains `concept-only` until review and approval occur under the client quality system.

Public regulatory references provide scope and method context only. They do not validate Atlas numerical benchmarks, site applicability, capacity, cost, or design outputs.

## Compatibility

Browser-local projects from the initial concept edition are migrated by parsing their saved input through the current canonical input schema and recompiling the Blueprint. A missing input contract version defaults to `quality-lab-input/v1`. Stored historical output is not trusted as authoritative.

## Consequences

- JSON exports are self-describing and machine-validatable.
- Reports can expose why an output exists and what must be resolved next.
- Compiler Core and Domain Pack versions can evolve independently.
- A future contract change requires a new version and an explicit migration path.
- Expert review cannot be represented by merely editing a concept flag in the browser; it requires a controlled review workflow.

