import type { DecisionPackageId } from "./decision-packages";
import type { DecisionPackagePracticeLab, DecisionPackagePracticeRound } from "./decision-package-learning-types";

const round = (
  title: string,
  event: string,
  tasks: string[],
  evidenceToRecord: string[],
  reviewGate: string,
): DecisionPackagePracticeRound => ({ title, event, tasks, evidenceToRecord, reviewGate });

const lab = (
  title: string,
  scenario: string,
  learnerRole: string,
  startingEvidence: string[],
  rounds: DecisionPackagePracticeRound[],
  expectedArtifacts: string[],
  debriefQuestions: string[],
  boundary: string,
): DecisionPackagePracticeLab => ({ title, scenario, learnerRole, startingEvidence, rounds, expectedArtifacts, debriefQuestions, boundary });

export const DECISION_PACKAGE_PRACTICE_LABS: Record<DecisionPackageId, DecisionPackagePracticeLab> = {
  "biopharma-cell-materials-upstream": lab(
    "Fictional bank, feed and upstream signal challenge",
    "A fictional CHO process introduces a new feed lot shortly after a working-cell-bank transition. Two upstream signals shift, while final-product observations remain incomplete and the supplier reports no specification failure.",
    "Evidence lead preparing a cross-functional bank/material/upstream review",
    ["Versioned bank lineage and passage summary", "Feed lot and supplier change history", "Upstream batch chronology with method versions", "Open downstream and product-quality observations"],
    [
      round("Round 1 — establish identity and chronology", "The batch record uses two abbreviations for the working bank and one feed lot lacks a receiving timestamp.", ["Reconcile identifiers without assuming equivalence", "Build a bank–material–batch chronology", "Mark records that cannot be attributed"], ["Canonical identifier table", "Chronology with evidence locators", "Unresolved provenance list"], "Do not compare performance until the exact bank, material lot and batch links are stable."),
      round("Round 2 — challenge the apparent association", "The shifted signal appears in both transition batches, but the sampling time also changed.", ["Separate bank, feed and sampling hypotheses", "Stratify observations by process and method version", "Identify the minimum discriminating evidence"], ["Competing-hypothesis map", "Stratified signal table", "Evidence-generation question"], "No causal material or bank conclusion is allowed while sampling and process changes remain confounded."),
      round("Round 3 — prepare the bounded decision", "A downstream result is delayed and operations asks whether the next batch may proceed.", ["State what current evidence does and does not support", "Assign accountable actions and escalation", "Define lifecycle triggers for renewed review"], ["Review-ready evidence summary", "Open-action register", "Decision and limitation statement"], "The lab may frame review; it cannot authorize bank use, batch manufacture or disposition."),
    ],
    ["Bank–material–batch lineage map", "Hypothesis and confounder register", "Bounded study/review plan", "Decision record with open evidence"],
    ["Which missing identifier most changes interpretability?", "What evidence would distinguish a feed effect from a bank or sampling effect?", "Which statement would overclaim the available evidence?"],
    "Synthetic planning exercise only; it supplies no cell-bank acceptance, material equivalence, operating range or manufacturing authorization.",
  ),

  "biopharma-downstream-analytics-formulation": lab(
    "Fictional polishing, potency and fill-interface signal",
    "A fictional monoclonal-antibody process changes a polishing-resin lot and experiences a longer formulation hold. An aggregate method shifts slightly, potency remains within the controlled reportable framework, and one fill-line sample is atypical.",
    "Product-quality evidence lead integrating downstream, analytical and formulation observations",
    ["Downstream load/pool chronology", "Resin lot and reuse history", "Formulation/fill hold records", "Aggregate, potency and orthogonal method metadata"],
    [
      round("Round 1 — reconstruct the product history", "One analytical sample label identifies the pool but not the fill timepoint.", ["Trace load, pool, formulation and fill samples", "Reconcile method/reference versions", "Quarantine unattributable observations"], ["Sample lineage map", "Process and presentation timeline", "Data limitation log"], "No cross-step comparison proceeds when sample identity or timepoint is unresolved."),
      round("Round 2 — test competing explanations", "The aggregate shift is visible in one method but not an orthogonal measurement.", ["Compare method principles and limitations", "Assess resin, hold and fill-interface hypotheses", "Identify evidence that can discriminate among them"], ["Orthogonality table", "Mechanism–evidence map", "Confirmation-study questions"], "Method disagreement must remain visible; one result cannot become a clearance or stability conclusion."),
      round("Round 3 — hand off the lifecycle question", "The team needs a recommendation for the next comparability review.", ["Summarize claim-level evidence", "Carry unresolved product and method risks", "Define receiving validation/comparability inputs"], ["Claim-level evidence summary", "Residual-risk register", "Comparability handoff"], "The output is decision context, not lot release, viral-clearance, potency, stability or comparability approval."),
    ],
    ["End-to-end sample/process lineage", "Orthogonal evidence challenge", "Interface study frame", "Lifecycle handoff record"],
    ["Why might an apparent aggregate shift be method-dependent?", "What makes the formulation hold relevant to downstream interpretation?", "Which evidence remains product-specific?"],
    "Synthetic exercise; no purge factor, formulation recipe, hold time, shelf life, release criterion or validation conclusion is provided.",
  ),

  "biopharma-validation-comparability-transfer": lab(
    "Fictional receiving-site comparability and CPV handoff",
    "A fictional biologics process transfers a polishing step and potency procedure to a second site after an equipment change. Qualification is complete, but one process signal and one inter-laboratory difference remain unexplained.",
    "Transfer evidence coordinator preparing validation, comparability and receiving-site governance",
    ["Frozen sending-site baseline", "Equipment and method difference register", "Qualification/PPQ evidence index", "Initial receiving-site signal and deviation log"],
    [
      round("Round 1 — freeze the comparison basis", "The sending site updates a method instruction after the transfer protocol was drafted.", ["Version the baseline and change scope", "Assess protocol impact", "Record who can authorize amendment"], ["Baseline freeze", "Change-impact note", "Protocol ownership record"], "Do not compare sites against different undocumented method states."),
      round("Round 2 — evaluate unexplained signals", "The process signal is within site controls but differs from sending-site history; laboratory bias is not resolved.", ["Separate process, method and site hypotheses", "Review capability and comparability evidence", "Define escalation and additional evidence"], ["Signal reconciliation table", "Comparability gap register", "Evidence action plan"], "An unexplained material signal prevents a closed transfer or comparability conclusion."),
      round("Round 3 — define the controlled next state", "Operations requests routine manufacture while monitoring continues.", ["Separate technical conclusion from authorization", "Define CPV and change triggers", "Preserve residual risks and ownership"], ["Bounded disposition draft", "CPV commitment map", "Knowledge-transfer record"], "The learner may prepare review inputs but cannot approve PPQ, transfer, routine manufacture or regulatory filing."),
    ],
    ["Immutable comparison baseline", "Site/method/process difference map", "Comparability evidence hierarchy", "CPV and residual-risk handoff"],
    ["Why is qualification completion insufficient for transfer closure?", "What evidence distinguishes site effect from method effect?", "Which decision requires separate formal authorization?"],
    "Synthetic exercise only; no validation batch count, comparability criterion, transfer acceptance rule or manufacturing authorization is supplied.",
  ),

  "pharma-api-route-inputs-suppliers": lab(
    "Fictional starting-material and supplier-change boundary review",
    "A fictional small-molecule route receives a proposed alternate starting-material supplier. The certificate profile is similar, the synthesis history is less transparent, and one downstream impurity observation is missing.",
    "CMC evidence lead assessing route boundary, supplier inputs and incoming-control questions",
    ["Route and starting-material justification", "Supplier manufacturing/change information", "Incoming method and lot records", "Step-wise impurity observations"],
    [
      round("Round 1 — confirm route and supply-chain scope", "The alternate supplier uses a different intermediate source but describes the material with the same commercial name.", ["Map chemical identity and synthesis history", "Record supply-chain differences", "Identify evidence unavailable to the receiving site"], ["Route-boundary map", "Supplier-chain difference register", "Open source-history questions"], "Commercial naming or a certificate cannot establish equivalence or starting-material suitability."),
      round("Round 2 — connect input risk to route evidence", "A potentially relevant impurity is below reporting in incoming testing but was not measured after a key step.", ["Trace formation and carryover hypotheses", "Challenge method and sampling coverage", "Frame the minimum fate evidence"], ["Input–impurity–step map", "Analytical limitation record", "Fate study question"], "Absence of a result is not evidence of purge or absence."),
      round("Round 3 — prepare supplier decision governance", "Procurement asks to qualify the alternate source before the evidence review closes.", ["Separate commercial urgency from quality evidence", "Define change-notification and monitoring needs", "Assign decision and escalation owners"], ["Evidence-based supplier review memo", "Monitoring/change triggers", "Open-action ownership"], "The lab does not qualify a supplier, approve a starting material or set incoming specifications."),
    ],
    ["Route and supplier boundary map", "Input-to-impurity evidence chain", "Bounded fate study frame", "Supplier review and action record"],
    ["Why is same chemical name not proof of equivalent input risk?", "Which missing downstream result matters most?", "What must procurement not infer from the exercise?"],
    "Synthetic planning example; no supplier approval, starting-material designation, test panel, acceptance criterion or regulatory conclusion is provided.",
  ),

  "pharma-api-reaction-workup-scale-up": lab(
    "Fictional reaction and work-up scale translation",
    "A fictional API reaction moves to a larger vessel with a different addition configuration. Conversion appears similar, but an impurity rises after work-up and one phase sample has uncertain recovery.",
    "Process-development evidence lead preparing a scale-up decision review",
    ["Small- and larger-scale equipment comparison", "Reaction and addition chronology", "Work-up phase/sample map", "Conversion and impurity method capability"],
    [
      round("Round 1 — map mechanisms and measurements", "The larger vessel records bulk temperature but not the local condition near addition.", ["Map mixing, heat and addition hypotheses", "Link observables to mechanisms", "Identify measurement blind spots"], ["Mechanism–observable map", "Equipment difference register", "Measurement gap list"], "Matching nominal setpoints is not evidence of equivalent scale behavior."),
      round("Round 2 — reconcile material and impurity fate", "One aqueous phase was sampled after an unplanned delay and recovery is uncertain.", ["Build step-wise material balance", "Separate reaction from work-up hypotheses", "Flag non-comparable samples"], ["Material-balance table", "Impurity fate alternatives", "Sampling limitation record"], "Do not calculate or claim purge from incomplete or non-comparable phase evidence."),
      round("Round 3 — frame the next scale decision", "Manufacturing requests a provisional operating instruction.", ["State supported observations and open mechanisms", "Define site-owned study and safety reviews", "Carry isolation and hold questions forward"], ["Scale decision context", "Bounded study architecture", "Isolation-stage handoff"], "The exercise cannot create process settings, safe limits, operating ranges or manufacturing instructions."),
    ],
    ["Scale/equipment comparison", "Mechanism and measurement map", "Material/impurity balance", "Next-scale evidence plan"],
    ["Which scale difference can hide behind a matching setpoint?", "Why is sample recovery central to fate reasoning?", "Which requested output is outside Atlas scope?"],
    "Synthetic exercise; all operating parameters, safety controls, protocols and acceptance criteria remain site-owned and qualified.",
  ),

  "pharma-api-isolation-solid-state-impurity": lab(
    "Fictional isolation, drying and milling investigation",
    "A fictional API batch shows a shifted particle result after extended drying and a mill change. Solid-form observations disagree across two sample locations, while one impurity appears lower after isolation.",
    "Solid-state and impurity evidence lead preparing a material-state review",
    ["Crystallization-to-milling batch history", "Sample location and preparation records", "Orthogonal solid-state/particle results", "Mother-liquor, cake and final impurity observations"],
    [
      round("Round 1 — reconstruct sample and process history", "Two containers share a composite identifier, but only one was sampled after milling.", ["Trace every sample to material state", "Separate composite and location-specific evidence", "Record preparation differences"], ["Sample lineage map", "Process exposure chronology", "Representativeness gaps"], "No form or particle comparison proceeds when sample history is ambiguous."),
      round("Round 2 — challenge form and impurity interpretations", "One solid-state method suggests a difference; the second is inconclusive, and impurity recovery is not reconciled.", ["Compare orthogonal method limitations", "Separate observed reduction from purge hypothesis", "Identify transformation and sampling alternatives"], ["Orthogonal evidence matrix", "Observed-versus-inferred fate map", "Competing explanation register"], "A single method or apparent reduction cannot establish form control or purge."),
      round("Round 3 — define downstream handoff", "Drug-product development asks whether the material can be treated as equivalent.", ["State material-state applicability and uncertainty", "Define additional evidence ownership", "Carry particle/form risks into formulation"], ["Bounded material-state conclusion", "Study/action plan", "Drug-product handoff"], "The learner cannot select a solid form, approve material equivalence, set milling conditions or release the batch."),
    ],
    ["Process/sample lineage", "Solid-state orthogonality review", "Impurity fate map", "Drug-product material handoff"],
    ["How can sample preparation create apparent form differences?", "Why is impurity reduction not automatically purge?", "What must the formulation team receive?"],
    "Synthetic exercise only; no solvent system, drying condition, milling setting, form specification, purge factor or disposition is supplied.",
  ),

  "pharma-api-analytical-lifecycle": lab(
    "Fictional method transfer, stability and specification signal",
    "A fictional API procedure transfers to a second laboratory. System suitability passes, but a reference-lot transition coincides with a stability trend and a small inter-laboratory difference.",
    "Analytical lifecycle lead integrating method, transfer, stability and quality-system evidence",
    ["Analytical target profile and intended use", "Development/validation evidence map", "Transfer protocol and laboratory differences", "Stability chronology with method/reference versions"],
    [
      round("Round 1 — freeze intended use and versions", "The receiving laboratory used a newly qualified reference lot not named in the transfer protocol.", ["Map reportable result and intended use", "Version method, reference and software states", "Assess transfer protocol deviation"], ["Intended-use statement", "Version alignment table", "Deviation and impact question"], "Passing system suitability does not close an undocumented reference or protocol difference."),
      round("Round 2 — distinguish method and product signals", "The stability slope changes near the reference transition, while a second attribute remains stable.", ["Stratify by batch, timepoint, method and reference", "Review stability-indicating capability", "Frame competing method/product explanations"], ["Stratified trend package", "Method capability limitations", "Investigation hypotheses"], "Statistical trend, specification status and product disposition remain separate."),
      round("Round 3 — record lifecycle actions", "The team proposes closing transfer and updating a controlled criterion.", ["Assess evidence for transfer fitness", "Separate scientific rationale from approval", "Define monitoring, revalidation and change-control triggers"], ["Transfer evidence summary", "Lifecycle action register", "Controlled change handoff"], "The lab cannot approve method transfer, specification change, retest period, shelf life or batch release."),
    ],
    ["Method/reference/version map", "Transfer difference assessment", "Stability signal analysis", "Lifecycle governance record"],
    ["Why can system suitability pass while the result remains questionable?", "What evidence separates reference shift from product trend?", "Who owns a specification change?"],
    "Synthetic exercise; no method criterion, transfer rule, specification, retest period, shelf life or release conclusion is generated.",
  ),

  "drug-product-formulation-material-attributes": lab(
    "Fictional OSD formulation and material-variability challenge",
    "A synthetic oral-solid-dose planning example changes an excipient source while API particle observations also shift. Blend behavior and dissolution observations differ, but the dataset is sparse and not designed to establish a formulation or design space.",
    "Drug-product development evidence lead framing formulation/material decisions",
    ["Target product and attribute statement", "API/excipient material histories", "Synthetic blend and dissolution observations", "Method, batch and process-version metadata"],
    [
      round("Round 1 — define product and material scope", "The excipient grade name is unchanged, but supplier processing information differs.", ["Map intended material functions", "Record API and excipient attribute differences", "Separate known facts from formulation hypotheses"], ["Material-function map", "Attribute difference register", "Evidence-required hypotheses"], "Grade name or supplier certificate cannot establish functional equivalence."),
      round("Round 2 — challenge the sparse association", "The dissolution difference aligns with both the source change and an API particle shift.", ["Map plausible formulation/process mechanisms", "Review confounding and method capability", "Design a bounded discrimination strategy"], ["Competing mechanism map", "Confounder register", "Study architecture"], "Sparse synthetic observations cannot establish causality, formula, criticality or design space."),
      round("Round 3 — prepare process-stage handoff", "Process development asks for recommended material ranges.", ["State supported planning questions", "Assign product-specific study ownership", "Carry risks into unit-operation development"], ["Bounded decision context", "Evidence and reviewer plan", "Unit-operation handoff"], "No material range, formulation composition, dosage-form applicability or manufacturing recommendation may be produced."),
    ],
    ["Product/material scope map", "Mechanism and confounder register", "Product-specific study frame", "Process-development handoff"],
    ["Why is unchanged grade name insufficient?", "Which variables are confounded?", "What makes the OSD example non-transferable?"],
    "Wholly synthetic OSD planning exercise; not a formula, design space, validation case, regulatory precedent or dosage-form-wide conclusion.",
  ),

  "drug-product-unit-operations-scale-up": lab(
    "Fictional OSD unit-operation and scale-up signal",
    "A synthetic OSD process moves to different blending and compression equipment. In-process observations shift and dissolution variability increases, while material lots and sampling locations are not fully balanced.",
    "Process-development/MSAT evidence lead preparing a unit-operation scale review",
    ["Unit-operation and equipment comparison", "Material-lot genealogy", "In-process sampling map", "Synthetic physical and dissolution observations"],
    [
      round("Round 1 — reconstruct flow and equipment differences", "The receiving blender has a different geometry and the sampling instruction changed.", ["Map unit-operation purpose and handoffs", "Record equipment and sampling differences", "Link material genealogy to batches"], ["Process-flow map", "Equipment difference register", "Batch/material/sample lineage"], "Do not attribute the signal to scale while material and sampling differences remain unresolved."),
      round("Round 2 — test mechanism and measurement hypotheses", "Compression feedback suggests a shift, but the relevant in-process method has limited precision evidence.", ["Connect mechanism to measurable responses", "Challenge in-process method suitability", "Separate normal, assignable and unknown variation"], ["Mechanism–response matrix", "Measurement limitation record", "Evidence priorities"], "An in-process signal cannot become a control or adjustment instruction without capable measurement and site evidence."),
      round("Round 3 — define transfer and validation questions", "Manufacturing asks to copy development settings to the new equipment.", ["Frame mechanism-based scale questions", "Assign engineering, validation and quality review", "Carry analytical and stability consequences forward"], ["Scale-up decision context", "Study/qualification questions", "Analytical lifecycle handoff"], "The lab cannot provide equipment settings, process ranges, adjustment rules or validation authorization."),
    ],
    ["Unit-operation/equipment map", "Material and sample genealogy", "Mechanism/measurement challenge", "Scale-up and validation handoff"],
    ["Why is nominal setting transfer weak evidence?", "How can sampling alter the apparent scale signal?", "Which downstream evidence must be linked?"],
    "Synthetic OSD planning exercise; no process setting, range, sampling plan, scale equivalence or validation conclusion is supplied.",
  ),

  "drug-product-analytical-release-stability-packaging": lab(
    "Fictional release, stability and packaging evidence conflict",
    "A synthetic drug-product example shows a late stability shift after a packaging-component change. Release results were unremarkable, one method version changed mid-study, and an investigation has not reconciled storage excursion data.",
    "Product-quality evidence lead connecting analytical performance, stability, packaging and investigation records",
    ["Release and stability result chronology", "Method/reference change history", "Packaging component/change record", "Storage, excursion and investigation evidence"],
    [
      round("Round 1 — align samples, methods and package states", "Two stability pulls use the new method but the package-change date is recorded differently in two systems.", ["Reconcile batch, pull, package and method identifiers", "Build a controlled chronology", "Mark conflicting source records"], ["Evidence chronology", "Version/package alignment", "Data conflict register"], "No trend or package-effect interpretation proceeds until versions and exposure states are attributable."),
      round("Round 2 — challenge the late signal", "The primary method shifts; an orthogonal measure is stable and excursion impact is unresolved.", ["Compare analytical principles and limitations", "Map degradation, package, storage and method hypotheses", "Define investigation evidence gaps"], ["Orthogonal evidence table", "Competing-cause map", "Investigation action list"], "Do not convert an unresolved trend into shelf-life, package suitability or batch conclusions."),
      round("Round 3 — prepare lifecycle disposition inputs", "The team asks whether the package change may be closed.", ["Summarize evidence by decision claim", "Separate release, stability and change-control authority", "Define continued monitoring and escalation"], ["Claim-level evidence summary", "Change-control handoff", "Monitoring trigger register"], "The learner cannot close the investigation/change, approve packaging, set shelf life or disposition product."),
    ],
    ["Versioned stability chronology", "Packaging exposure map", "Orthogonal signal challenge", "Investigation/change-control handoff"],
    ["Why can acceptable release results coexist with a later stability concern?", "How does a method change complicate trend interpretation?", "Which authority remains outside the lab?"],
    "Synthetic exercise; no specification, shelf life, package suitability, investigation conclusion, release or regulatory decision is provided.",
  ),

  "drug-product-validation-transfer-lifecycle": lab(
    "Fictional drug-product transfer and continued-verification review",
    "A synthetic drug-product process transfers to a receiving site with different equipment and an alternate excipient source. PPQ evidence is structurally complete, but an in-process shift and one method-transfer deviation remain open.",
    "Lifecycle evidence coordinator integrating validation, transfer, change and continued verification",
    ["Sending-site process/validation baseline", "Receiving-site difference and readiness map", "Synthetic PPQ and deviation index", "Method-transfer and early monitoring signals"],
    [
      round("Round 1 — freeze baseline and receiving state", "A late excipient-source change was assessed separately from the transfer plan.", ["Join the change and transfer scopes", "Map product/process/method differences", "Reassess evidence coverage"], ["Integrated baseline", "Difference/impact map", "Coverage gap register"], "Separate assessments cannot be treated as an integrated conclusion when effects may interact."),
      round("Round 2 — review validation and transfer exceptions", "The in-process shift has no specification failure, while the method deviation affects one comparison.", ["Reconcile process and analytical signals", "Assess protocol/deviation impact", "Define evidence needed before closure"], ["Exception review table", "Signal hypotheses", "Action and escalation plan"], "Structural PPQ completion is insufficient while material exceptions remain unexplained."),
      round("Round 3 — establish lifecycle controls", "The site requests transition to routine monitoring.", ["Separate evidence summary from authorization", "Define continued-verification and change triggers", "Assign knowledge and residual-risk owners"], ["Lifecycle disposition draft", "CPV/change trigger map", "Knowledge-transfer record"], "The exercise cannot approve validation, transfer, routine manufacture, change closure or regulatory action."),
    ],
    ["Integrated transfer/change baseline", "Exception evidence review", "Residual-risk register", "Continued-verification governance map"],
    ["Why must concurrent transfer and material changes be integrated?", "What blocks lifecycle closure?", "Which monitoring commitment preserves learning?"],
    "Synthetic exercise only; no PPQ count, acceptance rule, transfer approval, change disposition or commercial authorization is supplied.",
  ),

  "cross-cutting-evidence-governance": lab(
    "Fictional signal-to-investigation-to-change evidence loop",
    "Across a fictional product lifecycle, an analytical trend triggers an investigation, a procedural correction and a proposed method change. The initial root-cause statement is stronger than the evidence and effectiveness monitoring is not yet mature.",
    "Quality evidence lead preserving lineage across investigation, CAPA, change and knowledge transfer",
    ["Signal and data-lineage record", "Investigation hypothesis/evidence log", "CAPA and correction records", "Proposed change and monitoring plan"],
    [
      round("Round 1 — reconstruct the signal", "A data transformation was changed during trending and the original query is not attached.", ["Reproduce the signal from attributable data", "Version transformations and exclusions", "Separate observation from interpretation"], ["Reproducible signal package", "Data/transformation lineage", "Interpretation boundary"], "No investigation conclusion proceeds from a signal that cannot be reproduced and traced."),
      round("Round 2 — challenge cause and CAPA logic", "The team labels retraining as root-cause CAPA, but evidence supports several competing explanations.", ["Map hypotheses to supporting/refuting evidence", "Separate correction from systemic action", "Define effectiveness evidence"], ["Hypothesis evidence matrix", "Correction/CAPA distinction", "Effectiveness measure plan"], "Root cause and CAPA adequacy remain open when alternatives and effectiveness are unresolved."),
      round("Round 3 — govern the proposed change", "A method update is proposed before effectiveness data are available.", ["Assess change impact and required validation", "Preserve unresolved investigation evidence", "Define knowledge-transfer and review triggers"], ["Change impact map", "Residual uncertainty record", "Controlled knowledge handoff"], "The lab does not approve root cause, CAPA, method change, validation or quality-system closure."),
    ],
    ["Reproducible signal lineage", "Hypothesis and evidence matrix", "CAPA/effectiveness architecture", "Change and knowledge-transfer record"],
    ["What breaks signal reproducibility?", "Why is retraining not automatically CAPA?", "What evidence is needed before change closure?"],
    "Synthetic governance exercise; no root cause, CAPA effectiveness, method approval, change closure or batch/product disposition is asserted.",
  ),
};
