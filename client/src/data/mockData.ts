import { Term, Job, Product, SOP, LabTool, Skill } from "@shared/schema";

export const academyData: Term[] = [
  {
    id: "1",
    slug: "pcr-basics",
    title: "Polymerase Chain Reaction (PCR)",
    mode: "STUDENT",
    category: "Molecular Biology",
    tags: ["DNA", "Amplification", "Genetics"],
    summary: "A method widely used in molecular biology to make millions to billions of copies of a specific DNA sample rapidly. PCR enables researchers to amplify trace amounts of DNA for downstream analysis and diagnostics.",
    whyItMatters: "PCR is fundamental to almost all genetic mapping, cloning, and forensics. It underpins diagnostic testing for infectious diseases and genetic disorders. Without PCR, modern molecular biology would lack its most versatile amplification tool.",
    commonMistakes: [
      "Contamination of reagents leading to false positives.",
      "Incorrect annealing temperatures resulting in non-specific binding.",
      "Pipetting errors causing inconsistent results."
    ],
    difficulty: "Beginner",
    readTimeMin: 5,
    status: "READY"
  },
  {
    id: "2",
    slug: "western-blot",
    title: "Western Blotting",
    mode: "STUDENT",
    category: "Protein Analysis",
    tags: ["Proteins", "Antibodies", "Immunology"],
    summary: "An analytical technique used to detect specific proteins in a sample of tissue homogenate or extract. It uses gel electrophoresis to separate proteins by size before transferring them to a membrane for antibody-based detection.",
    whyItMatters: "It allows you to identify specific proteins from a complex mixture of proteins extracted from cells. Western blotting is a gold standard for confirming protein expression and post-translational modifications. Regulatory agencies often require Western blot data as part of biologic drug characterization.",
    commonMistakes: [
      "High background noise due to insufficient washing.",
      "Non-specific bands from poor primary antibody specificity.",
      "Over-transferring proteins through the membrane."
    ],
    difficulty: "Intermediate",
    readTimeMin: 8,
    status: "READY"
  },
  {
    id: "3",
    slug: "cell-culture",
    title: "Mammalian Cell Culture",
    mode: "STUDENT",
    category: "Cell Biology",
    tags: ["Sterile Technique", "Media", "Incubation"],
    summary: "The process by which cells are grown under controlled conditions, generally outside their natural environment. Cell culture is essential for drug discovery, vaccine production, and understanding fundamental cell biology.",
    whyItMatters: "Essential for producing vaccines, studying cell signaling, and testing drug toxicity. Cell-based assays are the backbone of preclinical drug evaluation. Mastering cell culture technique is a prerequisite for most biotech laboratory roles.",
    commonMistakes: [
      "Bacterial or fungal contamination.",
      "Over-confluency leading to cell death or differentiation.",
      "Improper pH management of the media."
    ],
    difficulty: "Intermediate",
    readTimeMin: 7,
    status: "READY"
  },
  {
    id: "4",
    slug: "flow-cytometry",
    title: "Flow Cytometry",
    mode: "STUDENT",
    category: "Immunology",
    tags: ["Fluorescence", "Cell Sorting", "Analysis"],
    summary: "A technique used to detect and measure physical and chemical characteristics of a population of cells or particles. Cells pass through a laser beam in a fluid stream, and scattered light and fluorescence are captured by detectors.",
    whyItMatters: "Allows simultaneous multi-parametric analysis of thousands of particles per second. It is critical for immunophenotyping, cell cycle analysis, and apoptosis studies. Flow cytometry data drives decisions in both research and clinical diagnostics.",
    commonMistakes: [
      "Poor compensation settings leading to false positives.",
      "Cell clumping clogging the cytometer.",
      "Using too high a flow rate reducing resolution."
    ],
    difficulty: "Advanced",
    readTimeMin: 12,
    status: "READY"
  },
  {
    id: "5",
    slug: "crispr-cas9",
    title: "CRISPR-Cas9 Gene Editing",
    mode: "STUDENT",
    category: "Genetics",
    tags: ["Gene Editing", "Cas9", "gRNA"],
    summary: "A unique technology that enables geneticists and medical researchers to edit parts of the genome by removing, adding or altering sections of the DNA sequence. CRISPR has revolutionized genetic engineering with its precision and accessibility.",
    whyItMatters: "It is faster, cheaper and more accurate than previous techniques of editing DNA. CRISPR-Cas9 has enabled breakthroughs in gene therapy and functional genomics. Understanding this tool is essential for anyone entering modern biotech research.",
    commonMistakes: [
      "Off-target effects modifying unintended genes.",
      "Inefficient delivery of the Cas9 complex into cells.",
      "Mosaicism in the resulting cell population."
    ],
    difficulty: "Advanced",
    readTimeMin: 10,
    status: "READY"
  },
  {
    id: "6",
    slug: "elisa",
    title: "ELISA (Enzyme-Linked Immunosorbent Assay)",
    mode: "STUDENT",
    category: "Immunology",
    tags: ["Antibodies", "Antigens", "Quantification"],
    summary: "A plate-based assay technique designed for detecting and quantifying soluble substances such as peptides, proteins, antibodies, and hormones. ELISA is one of the most widely used immunoassays in clinical and research laboratories.",
    whyItMatters: "Standard method for quantifying secreted proteins and diagnosing infections. ELISA is used in QC release testing for biologic drug products. Its sensitivity and specificity make it indispensable for biomarker quantification.",
    commonMistakes: [
      "Edge effect on plates causing uneven signal.",
      "Insufficient blocking leading to high background.",
      "Pipetting variability between replicates."
    ],
    difficulty: "Beginner",
    readTimeMin: 6,
    status: "READY"
  },
  {
    id: "7",
    slug: "hplc",
    title: "HPLC (High-Performance Liquid Chromatography)",
    mode: "STUDENT",
    category: "Analytical Chemistry",
    tags: ["Separation", "Purification", "Chemistry"],
    summary: "A technique in analytical chemistry used to separate, identify, and quantify each component in a mixture. HPLC uses high pressure to push solvents through a packed column, enabling fine resolution of complex samples.",
    whyItMatters: "Crucial for drug purity testing and metabolomics. HPLC is a regulatory requirement for release testing of pharmaceutical products. Proficiency in HPLC operation and troubleshooting is one of the most sought-after skills in QC labs.",
    commonMistakes: [
      "Column contamination causing peak tailing.",
      "Air bubbles in the pump or detector.",
      "Using incompatible solvents precipitating samples."
    ],
    difficulty: "Advanced",
    readTimeMin: 15,
    status: "READY"
  },
  {
    id: "8",
    slug: "gram-staining",
    title: "Gram Staining",
    mode: "STUDENT",
    category: "Microbiology",
    tags: ["Bacteria", "Microscopy", "Diagnosis"],
    summary: "A method of staining used to differentiate bacterial species into two large groups (gram-positive and gram-negative). The technique relies on differences in cell wall composition to produce a differential color result.",
    whyItMatters: "The first step in identifying bacterial infections. Gram staining guides initial antibiotic selection in clinical settings. It remains a foundational technique taught in every microbiology training program.",
    commonMistakes: [
      "Over-decolorizing leading to false gram-negatives.",
      "Using old cultures that stain inconsistently.",
      "Heat fixing for too long distorting cell shape."
    ],
    difficulty: "Beginner",
    readTimeMin: 4,
    status: "READY"
  },
  {
    id: "9",
    slug: "gel-electrophoresis",
    title: "Gel Electrophoresis",
    mode: "STUDENT",
    category: "Molecular Biology",
    tags: ["DNA", "RNA", "Separation"],
    summary: "A laboratory method used to separate mixtures of DNA, RNA, or proteins according to molecular size. Molecules migrate through a gel matrix under an electric field, with smaller fragments traveling farther.",
    whyItMatters: "Gel electrophoresis is a core technique for verifying PCR products and restriction digests. It provides a simple, visual confirmation of nucleic acid or protein size. Nearly every molecular biology workflow includes at least one gel step.",
    commonMistakes: [
      "Incorrect agarose concentration for the target fragment size.",
      "Running the gel at too high a voltage causing smearing.",
      "Forgetting to include a molecular weight ladder."
    ],
    difficulty: "Beginner",
    readTimeMin: 5,
    status: "READY"
  },
  {
    id: "10",
    slug: "rna-extraction",
    title: "RNA Extraction and Purification",
    mode: "STUDENT",
    category: "Molecular Biology",
    tags: ["RNA", "Purification", "Gene Expression"],
    summary: "The process of isolating RNA from biological samples for downstream applications such as RT-qPCR and RNA-seq. Proper RNA extraction requires RNase-free technique and rapid processing to prevent degradation.",
    whyItMatters: "High-quality RNA is essential for accurate gene expression analysis. Degraded RNA leads to unreliable qPCR and sequencing results. RNA extraction quality directly impacts the validity of transcriptomic experiments.",
    commonMistakes: [
      "RNase contamination from ungloved hands or dirty surfaces.",
      "Incomplete cell lysis reducing RNA yield.",
      "Failing to assess RNA integrity before downstream use.",
      "Storing RNA at improper temperatures."
    ],
    difficulty: "Intermediate",
    readTimeMin: 7,
    status: "READY"
  },
  {
    id: "11",
    slug: "cell-viability-assays",
    title: "Cell Viability Assays",
    mode: "STUDENT",
    category: "Cell Biology",
    tags: ["Viability", "Cytotoxicity", "Drug Screening"],
    summary: "A collection of methods used to determine the proportion of live, healthy cells within a population. Common assays include MTT, trypan blue exclusion, and ATP-based luminescence readouts.",
    whyItMatters: "Cell viability is a primary endpoint in drug toxicity screening. Regulatory agencies require cytotoxicity data for new drug applications. Accurate viability measurement ensures reliable dose-response curves.",
    commonMistakes: [
      "Seeding cells at inconsistent densities across wells.",
      "Allowing the reagent incubation time to vary between plates.",
      "Using media with phenol red that interferes with absorbance readings."
    ],
    difficulty: "Beginner",
    readTimeMin: 6,
    status: "READY"
  },
  {
    id: "12",
    slug: "bioprocess-scale-up",
    title: "Bioprocess Scale-Up Principles",
    mode: "STUDENT",
    category: "Bioprocess",
    tags: ["Bioreactors", "Scale-Up", "Manufacturing"],
    summary: "The engineering discipline of transitioning a biological manufacturing process from bench scale to production volumes. Scale-up considers mixing, oxygen transfer, heat removal, and shear stress at larger volumes.",
    whyItMatters: "Successful scale-up is required to move a drug candidate from the lab to commercial manufacturing. Process parameters do not scale linearly, making engineering judgment critical. Scale-up failures can cost millions and delay product launch.",
    commonMistakes: [
      "Assuming linear scale-up of mixing parameters.",
      "Neglecting dissolved oxygen gradients in large vessels.",
      "Failing to account for increased heat generation at scale.",
      "Insufficient process characterization at bench scale before scaling."
    ],
    difficulty: "Advanced",
    readTimeMin: 12,
    status: "READY"
  },
  {
    id: "13",
    slug: "southern-blotting",
    title: "Southern Blotting",
    mode: "STUDENT",
    category: "Genetics",
    tags: ["DNA", "Hybridization", "Detection"],
    summary: "A technique for detecting a specific DNA sequence in a sample by transferring electrophoretically separated DNA fragments to a membrane and probing with a labeled complementary sequence. It was among the first blotting techniques developed.",
    whyItMatters: "Southern blotting is used to confirm gene integrations in genetically modified organisms. It provides definitive evidence of copy number and integration site. Regulatory submissions for gene therapies may include Southern blot data.",
    commonMistakes: [
      "Incomplete DNA digestion leading to extra bands.",
      "Probe cross-hybridization under low stringency conditions.",
      "Poor transfer efficiency from gel to membrane."
    ],
    difficulty: "Intermediate",
    readTimeMin: 9,
    status: "READY"
  },
  {
    id: "14",
    slug: "spectrophotometry",
    title: "UV-Vis Spectrophotometry",
    mode: "STUDENT",
    category: "Analytical Chemistry",
    tags: ["Absorbance", "Quantification", "Beer-Lambert"],
    summary: "A quantitative analytical technique that measures the absorbance or transmittance of light through a liquid sample. UV-Vis spectrophotometry is used for nucleic acid quantification, protein assays, and enzyme kinetics.",
    whyItMatters: "Spectrophotometry is one of the most frequently used instruments in any life science laboratory. Accurate concentration measurements are critical for preparing reagents and normalizing experiments. Understanding Beer-Lambert law is essential for interpreting results.",
    commonMistakes: [
      "Using scratched or dirty cuvettes affecting readings.",
      "Failing to blank the instrument with the correct reference.",
      "Measuring samples outside the linear range of the instrument."
    ],
    difficulty: "Beginner",
    readTimeMin: 5,
    status: "READY"
  },
  {
    id: "15",
    slug: "aseptic-technique",
    title: "Aseptic Technique",
    mode: "STUDENT",
    category: "Microbiology",
    tags: ["Sterility", "Contamination", "Lab Practice"],
    summary: "A set of procedures used to prevent contamination from bacteria, viruses, and other microorganisms during laboratory work. Aseptic technique is fundamental to cell culture, microbiology, and pharmaceutical manufacturing.",
    whyItMatters: "Contamination can invalidate weeks of experimental work and waste expensive reagents. GMP manufacturing requires strict aseptic technique to ensure product sterility. Mastering aseptic practices is a non-negotiable skill for any lab-based biotech role.",
    commonMistakes: [
      "Working outside the laminar flow hood or biosafety cabinet.",
      "Talking or reaching over open sterile containers.",
      "Failing to flame loop or pipette tips between transfers.",
      "Not decontaminating the work surface before and after use."
    ],
    difficulty: "Beginner",
    readTimeMin: 5,
    status: "READY"
  },
  {
    id: "16",
    slug: "qc-environmental-monitoring",
    title: "Environmental Monitoring in GMP Facilities",
    mode: "QC",
    category: "Quality Control",
    tags: ["GMP", "Cleanroom", "Particulate"],
    summary: "The systematic sampling and testing of air, surfaces, and personnel in controlled manufacturing environments. Environmental monitoring ensures that cleanroom classifications are maintained and product contamination risks are minimized.",
    whyItMatters: "Regulatory agencies require documented EM programs for all sterile manufacturing facilities. Excursions in EM data can trigger batch investigations and potential product recalls. Trending EM data helps identify contamination sources before they become critical.",
    commonMistakes: [
      "Inconsistent sampling locations between monitoring sessions.",
      "Failing to incubate settle plates for the full required duration.",
      "Not correlating EM excursions with manufacturing activities.",
      "Using expired or improperly stored media fills."
    ],
    difficulty: "Intermediate",
    readTimeMin: 10,
    status: "READY"
  },
  {
    id: "17",
    slug: "qc-stability-testing",
    title: "Stability Testing Programs",
    mode: "QC",
    category: "Quality Control",
    tags: ["ICH", "Shelf Life", "Degradation"],
    summary: "A structured program of testing to establish the shelf life and storage conditions for pharmaceutical products. Stability studies follow ICH guidelines and test products under accelerated, intermediate, and long-term conditions.",
    whyItMatters: "Stability data is required for regulatory submissions and determines product expiry dates. Out-of-specification stability results can force product withdrawals from the market. Well-designed stability programs prevent costly late-stage reformulation efforts.",
    commonMistakes: [
      "Not including sufficient time points in accelerated studies.",
      "Storing stability samples at incorrect temperature or humidity.",
      "Failing to test all relevant container-closure configurations.",
      "Ignoring photostability testing requirements."
    ],
    difficulty: "Intermediate",
    readTimeMin: 11,
    status: "READY"
  },
  {
    id: "18",
    slug: "qc-method-validation",
    title: "Analytical Method Validation",
    mode: "QC",
    category: "Quality Control",
    tags: ["Validation", "ICH Q2", "Accuracy"],
    summary: "The process of demonstrating that an analytical procedure is suitable for its intended purpose through documented evidence. Method validation covers parameters such as accuracy, precision, specificity, linearity, and robustness.",
    whyItMatters: "Validated methods are a regulatory requirement for any GMP testing activity. Invalid methods produce unreliable results that can lead to incorrect release decisions. FDA and EMA inspectors routinely review method validation packages during audits.",
    commonMistakes: [
      "Confusing method validation with method verification.",
      "Using insufficient replicates for precision studies.",
      "Not challenging the method with known interfering substances.",
      "Failing to establish system suitability criteria."
    ],
    difficulty: "Advanced",
    readTimeMin: 14,
    status: "READY"
  },
  {
    id: "19",
    slug: "qc-oos-investigations",
    title: "Out-of-Specification (OOS) Investigations",
    mode: "QC",
    category: "Quality Control",
    tags: ["OOS", "Investigation", "CAPA"],
    summary: "A systematic approach to investigating test results that fall outside established acceptance criteria. OOS investigations follow a phased approach beginning with laboratory error assessment before expanding to process review.",
    whyItMatters: "FDA requires thorough OOS investigations before any batch disposition decision. Poorly conducted OOS investigations are among the top findings in regulatory inspections. Proper OOS handling protects patient safety and company reputation.",
    commonMistakes: [
      "Retesting without completing the initial laboratory investigation.",
      "Attributing results to analyst error without documented evidence.",
      "Failing to extend the investigation to other potentially affected batches.",
      "Not linking OOS findings to the CAPA system."
    ],
    difficulty: "Advanced",
    readTimeMin: 13,
    status: "READY"
  },
  {
    id: "20",
    slug: "qc-water-systems",
    title: "Pharmaceutical Water Systems",
    mode: "QC",
    category: "Quality Control",
    tags: ["WFI", "Purified Water", "USP"],
    summary: "The design, qualification, and monitoring of water purification systems used in pharmaceutical manufacturing. Water is the most commonly used raw material in pharma and must meet strict USP, EP, or JP standards.",
    whyItMatters: "Water quality directly impacts drug product safety and efficacy. Biofilm formation in water systems is a persistent contamination risk. Regulatory agencies closely scrutinize water system qualification and monitoring programs.",
    commonMistakes: [
      "Allowing dead legs in the distribution system where biofilm can form.",
      "Insufficient sampling frequency during initial qualification.",
      "Not trending TOC and conductivity data for early warning signs.",
      "Failing to sanitize systems on a validated schedule."
    ],
    difficulty: "Intermediate",
    readTimeMin: 10,
    status: "READY"
  },
  {
    id: "21",
    slug: "qc-release-testing",
    title: "Batch Release Testing",
    mode: "QC",
    category: "Quality Control",
    tags: ["Release", "CoA", "Specifications"],
    summary: "The collection of analytical tests performed on each manufactured batch to confirm it meets predefined specifications before market release. Release testing generates the Certificate of Analysis that accompanies every shipped batch.",
    whyItMatters: "No pharmaceutical product can reach patients without passing release testing. Errors in release testing can lead to recalls affecting thousands of patients. The CoA is a legal document that certifies product quality.",
    commonMistakes: [
      "Testing against outdated specifications.",
      "Not verifying instrument calibration status before testing.",
      "Releasing batches before all test results are reviewed and approved.",
      "Failing to retain sufficient samples for future investigation."
    ],
    difficulty: "Intermediate",
    readTimeMin: 9,
    status: "READY"
  },
  {
    id: "22",
    slug: "qc-dissolution-testing",
    title: "Dissolution Testing",
    mode: "QC",
    category: "Analytical Chemistry",
    tags: ["Dissolution", "Oral Dosage", "USP"],
    summary: "An in vitro test that measures the rate and extent of drug release from a solid dosage form in a dissolution medium. Dissolution testing is a critical quality attribute for oral drug products and a key regulatory requirement.",
    whyItMatters: "Dissolution results serve as a surrogate for in vivo drug absorption. Failing dissolution specs can prevent batch release and delay product availability. It is a required test for bioequivalence studies of generic drugs.",
    commonMistakes: [
      "Incorrect media pH or deaeration leading to variable results.",
      "Paddle or basket speed deviating from method specifications.",
      "Sinker selection affecting tablet positioning in the vessel.",
      "Sampling at incorrect time points."
    ],
    difficulty: "Intermediate",
    readTimeMin: 10,
    status: "READY"
  },
  {
    id: "23",
    slug: "qc-microbial-limits",
    title: "Microbial Limits Testing",
    mode: "QC",
    category: "Microbiology",
    tags: ["Bioburden", "USP 61", "USP 62"],
    summary: "Quantitative and qualitative microbiological testing performed on non-sterile pharmaceutical products. Microbial limits testing determines total aerobic count, total yeast and mold count, and screens for specified objectionable organisms.",
    whyItMatters: "Non-sterile products must still meet microbial limits to ensure patient safety. Presence of objectionable organisms like Pseudomonas or Staphylococcus requires batch rejection. Validated microbial methods are scrutinized during GMP inspections.",
    commonMistakes: [
      "Not performing method suitability to account for product antimicrobial properties.",
      "Using growth media past its expiration date.",
      "Inadequate environmental controls during sample preparation.",
      "Misidentifying colony morphology during pathogen screening."
    ],
    difficulty: "Intermediate",
    readTimeMin: 9,
    status: "READY"
  },
  {
    id: "24",
    slug: "qc-endotoxin-testing",
    title: "Bacterial Endotoxin Testing (LAL/rFC)",
    mode: "QC",
    category: "Quality Control",
    tags: ["Endotoxin", "LAL", "Pyrogen"],
    summary: "Testing to detect and quantify bacterial endotoxins in pharmaceutical products and medical devices using Limulus Amebocyte Lysate (LAL) or recombinant Factor C (rFC) methods. Endotoxin contamination can cause fever, septic shock, and death in patients.",
    whyItMatters: "All parenteral drugs and medical devices must pass endotoxin testing before release. Endotoxin limits are calculated based on the dose and route of administration. The transition from horseshoe crab-derived LAL to recombinant reagents is a major industry shift.",
    commonMistakes: [
      "Using depyrogenated glassware past its validated hold time.",
      "Failing to demonstrate adequate spike recovery in inhibition/enhancement testing.",
      "Not accounting for low endotoxin recovery phenomenon.",
      "Preparing standard curves with improper vortexing technique."
    ],
    difficulty: "Advanced",
    readTimeMin: 12,
    status: "READY"
  },
  {
    id: "25",
    slug: "qc-data-integrity",
    title: "Data Integrity in QC Laboratories",
    mode: "QC",
    category: "Quality Control",
    tags: ["ALCOA+", "Data Integrity", "Compliance"],
    summary: "The principles and practices ensuring that laboratory data is attributable, legible, contemporaneous, original, and accurate throughout its lifecycle. Data integrity failures are among the most common causes of FDA warning letters to pharmaceutical companies.",
    whyItMatters: "Data integrity violations can result in consent decrees, import alerts, and criminal prosecution. The ALCOA+ framework is now the global standard for GMP data management. Electronic systems require audit trails and access controls to maintain data integrity.",
    commonMistakes: [
      "Backdating or predating laboratory notebook entries.",
      "Deleting or overwriting electronic raw data without justification.",
      "Sharing login credentials for analytical instruments.",
      "Not reviewing audit trails during data review."
    ],
    difficulty: "Intermediate",
    readTimeMin: 8,
    status: "READY"
  },
  {
    id: "26",
    slug: "qc-reference-standards",
    title: "Reference Standard Management",
    mode: "QC",
    category: "Quality Control",
    tags: ["Reference Standards", "USP", "Traceability"],
    summary: "The qualification, storage, and lifecycle management of primary and working reference standards used in pharmaceutical testing. Reference standards provide the benchmark against which product quality is measured.",
    whyItMatters: "Incorrect reference standards invalidate every test result generated with them. Traceability to pharmacopoeial standards is a regulatory expectation. Improper storage can degrade reference materials and introduce systematic analytical bias.",
    commonMistakes: [
      "Using reference standards beyond their qualified expiry date.",
      "Not protecting hygroscopic standards from moisture exposure.",
      "Failing to re-qualify working standards at defined intervals.",
      "Inadequate documentation of standard preparation and assignment."
    ],
    difficulty: "Intermediate",
    readTimeMin: 7,
    status: "READY"
  },
  {
    id: "27",
    slug: "qc-change-control",
    title: "Change Control in GMP Environments",
    mode: "QC",
    category: "Regulatory",
    tags: ["Change Control", "GMP", "Impact Assessment"],
    summary: "A formal system for evaluating, approving, and documenting changes to validated processes, equipment, materials, or systems. Change control prevents unintended consequences that could affect product quality or regulatory compliance.",
    whyItMatters: "Uncontrolled changes are a leading cause of quality failures in pharmaceutical manufacturing. Regulatory agencies expect a robust change control system as part of the quality management system. Effective change control balances operational agility with quality assurance.",
    commonMistakes: [
      "Implementing changes before obtaining all required approvals.",
      "Underestimating the scope of impact assessments.",
      "Not linking change controls to revalidation activities.",
      "Failing to communicate approved changes to all affected departments."
    ],
    difficulty: "Intermediate",
    readTimeMin: 8,
    status: "READY"
  },
  {
    id: "28",
    slug: "qc-equipment-qualification",
    title: "Equipment Qualification (IQ/OQ/PQ)",
    mode: "QC",
    category: "Quality Control",
    tags: ["Qualification", "IQ", "OQ", "PQ"],
    summary: "The documented process of demonstrating that laboratory and manufacturing equipment is properly installed, operates correctly, and performs as intended. The IQ/OQ/PQ framework ensures equipment fitness for its intended use.",
    whyItMatters: "Unqualified equipment cannot be used for GMP testing or manufacturing. Qualification gaps are frequently cited in FDA 483 observations. A lifecycle approach to equipment qualification reduces requalification burden.",
    commonMistakes: [
      "Skipping design qualification and proceeding directly to installation.",
      "Using generic qualification protocols that do not address specific use cases.",
      "Not defining meaningful acceptance criteria for performance qualification.",
      "Failing to maintain the qualified state through periodic recalibration."
    ],
    difficulty: "Advanced",
    readTimeMin: 11,
    status: "READY"
  },
  {
    id: "29",
    slug: "qc-deviations",
    title: "Deviation Management",
    mode: "QC",
    category: "Quality Control",
    tags: ["Deviation", "Root Cause", "Quality"],
    summary: "The process of documenting, investigating, and resolving departures from approved procedures, specifications, or established standards. Deviation management is a core element of the pharmaceutical quality system.",
    whyItMatters: "Unmanaged deviations can compromise product quality and patient safety. Trending deviation data reveals systemic issues before they become critical. Regulatory inspectors evaluate deviation closure timeliness and investigation thoroughness.",
    commonMistakes: [
      "Classifying deviations at too low a severity to avoid investigation requirements.",
      "Not performing true root cause analysis beyond surface-level symptoms.",
      "Allowing deviation backlogs to accumulate without timely closure.",
      "Failing to verify effectiveness of corrective actions."
    ],
    difficulty: "Intermediate",
    readTimeMin: 9,
    status: "READY"
  },
  {
    id: "30",
    slug: "qc-capa",
    title: "CAPA (Corrective and Preventive Action)",
    mode: "QC",
    category: "Quality Control",
    tags: ["CAPA", "Root Cause", "Continuous Improvement"],
    summary: "A systematic approach to investigating the root causes of identified problems and implementing corrective actions to eliminate recurrence and preventive actions to avoid similar issues. CAPA is a regulatory expectation for all GMP operations.",
    whyItMatters: "An effective CAPA system demonstrates a commitment to continuous quality improvement. FDA views CAPA effectiveness as an indicator of overall quality system maturity. Weak CAPA programs are a top contributor to consent decrees.",
    commonMistakes: [
      "Confusing corrections with corrective actions.",
      "Defining CAPAs that are too broad to be actionable or measurable.",
      "Not verifying CAPA effectiveness after implementation.",
      "Opening excessive CAPAs that dilute focus from critical quality issues."
    ],
    difficulty: "Advanced",
    readTimeMin: 10,
    status: "READY"
  },
  {
    id: "31",
    slug: "sales-value-proposition",
    title: "Building a Value Proposition for Lab Products",
    mode: "SALES",
    category: "Sales & Marketing",
    tags: ["Value Proposition", "Positioning", "Messaging"],
    summary: "The art of articulating how a laboratory product or service solves a specific customer pain point better than alternatives. A strong value proposition connects product features to measurable outcomes that matter to the buyer.",
    whyItMatters: "Lab professionals evaluate products based on data, not marketing claims. A compelling value proposition shortens the sales cycle and increases close rates. Differentiation in the life science tools market requires deep technical understanding.",
    commonMistakes: [
      "Leading with product features instead of customer outcomes.",
      "Using generic claims that could apply to any competitor product.",
      "Failing to quantify the economic impact of the solution.",
      "Not tailoring the message to different stakeholder roles."
    ],
    difficulty: "Intermediate",
    readTimeMin: 8,
    status: "READY"
  },
  {
    id: "32",
    slug: "sales-gmp-regulations",
    title: "GMP Regulations for Sales Professionals",
    mode: "SALES",
    category: "Regulatory",
    tags: ["GMP", "FDA", "cGMP"],
    summary: "An overview of current Good Manufacturing Practice regulations that sales representatives must understand to effectively sell into regulated pharmaceutical and biotech environments. Knowing GMP helps reps speak the customer's language.",
    whyItMatters: "Customers in regulated environments will not purchase from vendors who lack GMP awareness. Understanding compliance drivers helps reps position products as solutions to regulatory requirements. GMP fluency builds credibility and trust with quality and operations teams.",
    commonMistakes: [
      "Confusing GMP with GLP or GCP in conversations with customers.",
      "Overpromising compliance claims without documentation support.",
      "Not understanding how change control affects purchasing decisions.",
      "Ignoring the role of validation in the customer buying process."
    ],
    difficulty: "Beginner",
    readTimeMin: 7,
    status: "READY"
  },
  {
    id: "33",
    slug: "sales-consultative-selling",
    title: "Consultative Selling in Life Sciences",
    mode: "SALES",
    category: "Sales & Marketing",
    tags: ["Consultative", "Needs Assessment", "Solution Selling"],
    summary: "A sales methodology where the representative acts as a trusted advisor by deeply understanding the customer's workflow challenges before recommending solutions. In life sciences, consultative selling requires genuine scientific literacy.",
    whyItMatters: "Scientists and lab managers respond poorly to high-pressure sales tactics. Consultative sellers build long-term relationships that drive repeat business and referrals. This approach uncovers hidden needs that lead to larger, multi-product deals.",
    commonMistakes: [
      "Jumping to product demonstrations before understanding the workflow.",
      "Asking surface-level questions instead of probing for root causes.",
      "Failing to involve all decision-makers in the discovery process.",
      "Not following up with relevant technical resources after initial meetings."
    ],
    difficulty: "Intermediate",
    readTimeMin: 9,
    status: "READY"
  },
  {
    id: "34",
    slug: "sales-cold-chain",
    title: "Cold Chain Logistics for Reagent Sales",
    mode: "SALES",
    category: "Sales & Marketing",
    tags: ["Cold Chain", "Logistics", "Reagents"],
    summary: "Understanding the temperature-controlled supply chain required for shipping biological reagents, enzymes, and temperature-sensitive products. Sales representatives must understand cold chain requirements to set proper customer expectations.",
    whyItMatters: "Reagent failures due to cold chain breaks damage customer trust and increase return costs. Proper cold chain knowledge helps reps recommend appropriate shipping options. Understanding stability data enables confident responses to customer concerns about product quality.",
    commonMistakes: [
      "Promising overnight delivery without confirming cold chain packaging availability.",
      "Not informing customers about proper storage upon receipt.",
      "Underestimating shipping costs for dry ice or gel pack requirements.",
      "Failing to document temperature excursions during transit."
    ],
    difficulty: "Beginner",
    readTimeMin: 6,
    status: "READY"
  },
  {
    id: "35",
    slug: "sales-territory-management",
    title: "Territory Management in Biotech Sales",
    mode: "SALES",
    category: "Business Development",
    tags: ["Territory", "Pipeline", "CRM"],
    summary: "Strategic planning and execution of sales activities across a defined geographic or account-based territory. Effective territory management maximizes coverage of high-potential accounts while maintaining relationships with existing customers.",
    whyItMatters: "Top-performing sales reps spend their time on the highest-value activities in their territory. Poor territory management leads to missed opportunities and uneven market coverage. CRM discipline ensures pipeline visibility and accurate forecasting.",
    commonMistakes: [
      "Spending disproportionate time on small accounts while neglecting key targets.",
      "Not segmenting accounts by revenue potential and strategic value.",
      "Failing to update CRM data regularly, reducing forecast accuracy.",
      "Neglecting competitive intelligence gathering during customer visits."
    ],
    difficulty: "Intermediate",
    readTimeMin: 8,
    status: "READY"
  },
  {
    id: "36",
    slug: "sales-product-launch",
    title: "Product Launch Strategy for Lab Equipment",
    mode: "SALES",
    category: "Sales & Marketing",
    tags: ["Launch", "Go-to-Market", "Strategy"],
    summary: "The coordinated plan for introducing a new laboratory instrument or reagent to the market. A successful product launch aligns marketing messaging, sales enablement, and technical support from day one.",
    whyItMatters: "The first 90 days of a product launch determine its long-term market trajectory. Early adopters become reference accounts that accelerate broader market adoption. Misaligned launches waste marketing spend and erode sales team confidence.",
    commonMistakes: [
      "Launching without adequate sales training on competitive differentiation.",
      "Not having case study data or application notes ready at launch.",
      "Targeting too many market segments simultaneously.",
      "Underestimating the time needed for technical evaluation by key accounts."
    ],
    difficulty: "Advanced",
    readTimeMin: 10,
    status: "READY"
  },
  {
    id: "37",
    slug: "sales-key-account-management",
    title: "Key Account Management in Pharma",
    mode: "SALES",
    category: "Business Development",
    tags: ["Key Accounts", "Strategic", "Relationship"],
    summary: "The practice of building deep, multi-threaded relationships with an organization's most strategically important customers. In pharma, key accounts often involve complex procurement processes with multiple stakeholders across R&D, QC, and operations.",
    whyItMatters: "Key accounts typically represent a disproportionate share of territory revenue. Losing a key account can devastate quarterly and annual sales targets. Multi-threaded relationships protect against single-point-of-contact risk.",
    commonMistakes: [
      "Relying on a single champion without building relationships across departments.",
      "Not creating a formal account plan with defined growth objectives.",
      "Reacting to customer needs instead of proactively identifying opportunities.",
      "Failing to coordinate with applications and service teams for account support."
    ],
    difficulty: "Advanced",
    readTimeMin: 11,
    status: "READY"
  },
  {
    id: "38",
    slug: "sales-roi-analysis",
    title: "ROI Analysis for Capital Equipment Sales",
    mode: "SALES",
    category: "Sales & Marketing",
    tags: ["ROI", "Capital Equipment", "Financial Justification"],
    summary: "The process of building a financial justification model that demonstrates return on investment for high-value laboratory equipment purchases. ROI analysis helps customers secure internal budget approval by quantifying productivity gains and cost savings.",
    whyItMatters: "Capital equipment purchases require management approval with documented financial justification. A well-built ROI model differentiates your proposal from competitors. Understanding the customer's cost structure enables more persuasive business cases.",
    commonMistakes: [
      "Using generic ROI templates that do not reflect the customer's actual workflow.",
      "Overstating savings assumptions that undermine credibility.",
      "Not accounting for total cost of ownership including service and consumables.",
      "Failing to involve procurement or finance teams early in the process."
    ],
    difficulty: "Advanced",
    readTimeMin: 10,
    status: "READY"
  },
  {
    id: "39",
    slug: "sales-technical-presentations",
    title: "Delivering Technical Presentations to Scientists",
    mode: "SALES",
    category: "Sales & Marketing",
    tags: ["Presentations", "Communication", "Technical"],
    summary: "Best practices for presenting scientific data, product specifications, and application results to an audience of trained scientists and lab managers. Effective technical presentations balance depth with clarity and invite dialogue.",
    whyItMatters: "Scientists evaluate vendors partly on the quality and honesty of their technical presentations. Poor presentations damage credibility and eliminate future opportunities. The ability to handle tough technical questions distinguishes top sales performers.",
    commonMistakes: [
      "Filling slides with marketing language instead of application data.",
      "Not preparing for likely objections and competitive comparisons.",
      "Speaking in generalities when the audience expects specific performance metrics.",
      "Running over time and leaving no room for Q&A discussion."
    ],
    difficulty: "Intermediate",
    readTimeMin: 7,
    status: "READY"
  },
  {
    id: "40",
    slug: "sales-regulatory-landscape",
    title: "Navigating the Regulatory Landscape as a Sales Rep",
    mode: "SALES",
    category: "Regulatory",
    tags: ["Regulatory", "Compliance", "Sales Strategy"],
    summary: "How regulatory requirements such as FDA 21 CFR Part 11, EU Annex 11, and ISO standards influence purchasing decisions in pharmaceutical and biotech companies. Sales reps who understand the regulatory environment can position products more effectively.",
    whyItMatters: "Regulated customers prioritize vendor qualification and compliance documentation over price. Understanding regulatory drivers helps identify urgent purchase triggers. Competitors who cannot demonstrate compliance readiness lose deals regardless of product performance.",
    commonMistakes: [
      "Claiming regulatory compliance without having supporting documentation available.",
      "Not understanding the difference between FDA, EMA, and ICH guidelines.",
      "Overlooking the importance of IQ/OQ documentation in instrument sales.",
      "Failing to connect product capabilities to specific regulatory requirements."
    ],
    difficulty: "Intermediate",
    readTimeMin: 9,
    status: "READY"
  },
  {
    id: "41",
    slug: "sales-competitive-intelligence",
    title: "Competitive Intelligence in Life Science Sales",
    mode: "SALES",
    category: "Business Development",
    tags: ["Competitive Analysis", "Market Intelligence", "Strategy"],
    summary: "Systematic gathering and analysis of information about competitor products, pricing, and market positioning. Effective competitive intelligence enables sales teams to anticipate objections and highlight genuine differentiation points.",
    whyItMatters: "Customers expect sales reps to know how their products compare to alternatives. Data-driven competitive positioning wins more deals than opinion-based claims. Understanding competitor weaknesses helps identify opportunities in accounts currently using rival products.",
    commonMistakes: [
      "Disparaging competitors instead of focusing on your own strengths.",
      "Relying on outdated competitive information from months or years ago.",
      "Not tracking competitor product launches and pricing changes.",
      "Failing to gather field intelligence from customer interactions."
    ],
    difficulty: "Intermediate",
    readTimeMin: 8,
    status: "READY"
  },
  {
    id: "42",
    slug: "sales-distributor-management",
    title: "Managing Distribution Channels for Lab Products",
    mode: "SALES",
    category: "Business Development",
    tags: ["Distribution", "Channel", "Partnerships"],
    summary: "Strategies for working with and through distribution partners to extend market reach for laboratory products. Effective distributor management requires balancing direct sales efforts with channel support and enablement.",
    whyItMatters: "Distribution partners provide access to accounts and geographies that direct sales cannot efficiently cover. Poorly managed channel relationships lead to price conflicts and customer confusion. Distributor training directly impacts how well your products are represented in the market.",
    commonMistakes: [
      "Creating channel conflict by competing with distributors on the same accounts.",
      "Not providing adequate product training and technical support to partners.",
      "Offering inconsistent pricing across direct and indirect channels.",
      "Failing to track distributor pipeline and forecast contributions."
    ],
    difficulty: "Intermediate",
    readTimeMin: 8,
    status: "READY"
  },
  {
    id: "43",
    slug: "sales-clinical-trial-supply",
    title: "Understanding Clinical Trial Supply Chains",
    mode: "SALES",
    category: "Sales & Marketing",
    tags: ["Clinical Trials", "Supply Chain", "Pharma"],
    summary: "An overview of the clinical trial supply chain from raw material sourcing through to investigator site delivery. Sales professionals selling into clinical operations must understand the unique procurement requirements and timelines of clinical programs.",
    whyItMatters: "Clinical trial supply disruptions can delay drug development timelines by months. Vendors who understand clinical timelines can proactively position solutions at the right stage. Selling into clinical operations requires understanding of GMP, blinding, and randomization logistics.",
    commonMistakes: [
      "Not aligning product delivery timelines with clinical study milestones.",
      "Overlooking the documentation requirements for clinical supply vendors.",
      "Failing to understand the difference between commercial and clinical supply needs.",
      "Not building relationships with clinical operations teams early in the trial planning phase."
    ],
    difficulty: "Advanced",
    readTimeMin: 10,
    status: "READY"
  },
  {
    id: "44",
    slug: "sales-trade-shows",
    title: "Maximizing Trade Show ROI in Biotech",
    mode: "SALES",
    category: "Sales & Marketing",
    tags: ["Trade Shows", "Events", "Lead Generation"],
    summary: "Strategies for planning, executing, and following up on trade show participation to maximize lead generation and brand visibility. Trade shows remain a critical channel for life science companies to demonstrate products and build relationships.",
    whyItMatters: "Trade show leads convert at higher rates because prospects have already self-selected by attending. Effective booth engagement creates lasting impressions that influence future purchasing decisions. Post-show follow-up speed and quality determine how many leads convert to opportunities.",
    commonMistakes: [
      "Not setting measurable objectives for trade show participation.",
      "Staffing the booth with untrained personnel who cannot answer technical questions.",
      "Collecting business cards without qualifying leads or capturing notes.",
      "Waiting more than 48 hours after the show to follow up with hot leads."
    ],
    difficulty: "Beginner",
    readTimeMin: 6,
    status: "READY"
  },
  {
    id: "45",
    slug: "sales-pricing-strategy",
    title: "Pricing Strategy for Laboratory Consumables",
    mode: "SALES",
    category: "Business Development",
    tags: ["Pricing", "Margins", "Consumables"],
    summary: "Frameworks for setting and defending pricing for high-volume laboratory consumables such as pipette tips, filters, and reagent kits. Effective pricing balances margin protection with competitive positioning and customer perceived value.",
    whyItMatters: "Consumables drive recurring revenue and customer stickiness in the life science market. Price erosion on consumables can significantly impact overall profitability. Understanding customer procurement processes helps defend pricing against discount pressure.",
    commonMistakes: [
      "Offering blanket discounts without understanding the customer's purchasing volume.",
      "Not bundling consumables with instruments to protect margin.",
      "Failing to communicate the cost of switching from a competitor product.",
      "Ignoring group purchasing organization agreements that limit pricing flexibility."
    ],
    difficulty: "Intermediate",
    readTimeMin: 8,
    status: "READY"
  }
];

export const jobsData: Job[] = [
  {
    id: "j1",
    title: "QC Analyst II",
    company: "BioGenex Pharma",
    location: "Boston, MA",
    level: "Mid",
    salaryRange: "$75k - $90k",
    requiredSkills: ["HPLC", "GMP", "LIMS"],
    postedAt: "2 days ago",
    domain: "QC"
  },
  {
    id: "j2",
    title: "Senior QA Specialist",
    company: "Vertex Therapeutics",
    location: "San Diego, CA",
    level: "Senior",
    salaryRange: "$110k - $135k",
    requiredSkills: ["FDA Regulations", "CAPA", "Auditing"],
    postedAt: "1 week ago",
    domain: "QA"
  },
  {
    id: "j3",
    title: "Regulatory Affairs Associate",
    company: "Pfizer",
    location: "New York, NY",
    level: "Entry",
    salaryRange: "$65k - $80k",
    requiredSkills: ["Documentation", "Communication", "Science Degree"],
    postedAt: "3 days ago",
    domain: "RA"
  },
  {
    id: "j4",
    title: "Biomanufacturing Technician",
    company: "Moderna",
    location: "Cambridge, MA",
    level: "Entry",
    salaryRange: "$60k - $75k",
    requiredSkills: ["Aseptic Technique", "SOP Adherence", "Bioreactors"],
    postedAt: "Just now",
    domain: "Manufacturing"
  },
  {
    id: "j5",
    title: "Validation Engineer",
    company: "Amgen",
    location: "Thousand Oaks, CA",
    level: "Mid",
    salaryRange: "$95k - $115k",
    requiredSkills: ["IQ/OQ/PQ", "Engineering", "Validation Protocols"],
    postedAt: "5 days ago",
    domain: "Manufacturing"
  },
  {
    id: "j6",
    title: "Clinical Research Coordinator",
    company: "Mass General Hospital",
    location: "Boston, MA",
    level: "Mid",
    salaryRange: "$70k - $85k",
    requiredSkills: ["Patient Recruitment", "IRB", "Data Entry"],
    postedAt: "4 days ago",
    domain: "QA"
  },
  {
    id: "j7",
    title: "QC Microbiologist",
    company: "Genentech",
    location: "South San Francisco, CA",
    level: "Entry",
    salaryRange: "$62k - $78k",
    requiredSkills: ["Environmental Monitoring", "Sterility Testing", "USP Methods"],
    postedAt: "1 day ago",
    domain: "QC"
  },
  {
    id: "j8",
    title: "Senior Regulatory Affairs Manager",
    company: "AbbVie",
    location: "North Chicago, IL",
    level: "Senior",
    salaryRange: "$130k - $160k",
    requiredSkills: ["FDA Submissions", "CTD Format", "Labeling Requirements"],
    postedAt: "2 weeks ago",
    domain: "RA"
  },
  {
    id: "j9",
    title: "Process Development Scientist",
    company: "Regeneron",
    location: "Tarrytown, NY",
    level: "Mid",
    salaryRange: "$90k - $110k",
    requiredSkills: ["Upstream Processing", "CHO Cell Culture", "DOE"],
    postedAt: "3 days ago",
    domain: "Manufacturing"
  },
  {
    id: "j10",
    title: "QA Documentation Specialist",
    company: "Bristol-Myers Squibb",
    location: "New Brunswick, NJ",
    level: "Entry",
    salaryRange: "$55k - $68k",
    requiredSkills: ["Technical Writing", "Document Control", "GMP"],
    postedAt: "6 days ago",
    domain: "QA"
  },
  {
    id: "j11",
    title: "Stability Studies Analyst",
    company: "Merck & Co.",
    location: "Rahway, NJ",
    level: "Mid",
    salaryRange: "$80k - $95k",
    requiredSkills: ["ICH Guidelines", "HPLC", "Stability Chambers"],
    postedAt: "1 week ago",
    domain: "QC"
  },
  {
    id: "j12",
    title: "Senior Manufacturing Engineer",
    company: "Catalent Pharma Solutions",
    location: "Indianapolis, IN",
    level: "Senior",
    salaryRange: "$115k - $140k",
    requiredSkills: ["Process Scale-Up", "Lean Manufacturing", "Equipment Qualification"],
    postedAt: "4 days ago",
    domain: "Manufacturing"
  },
  {
    id: "j13",
    title: "Regulatory CMC Specialist",
    company: "Sarepta Therapeutics",
    location: "Cambridge, MA",
    level: "Mid",
    salaryRange: "$95k - $120k",
    requiredSkills: ["CMC Documentation", "IND/NDA Filings", "Gene Therapy"],
    postedAt: "2 days ago",
    domain: "RA"
  },
  {
    id: "j14",
    title: "QC Analytical Chemist",
    company: "Takeda Pharmaceuticals",
    location: "Lexington, MA",
    level: "Entry",
    salaryRange: "$58k - $72k",
    requiredSkills: ["Dissolution Testing", "GC", "Method Validation"],
    postedAt: "Just now",
    domain: "QC"
  },
  {
    id: "j15",
    title: "Director of Quality Assurance",
    company: "Jazz Pharmaceuticals",
    location: "Palo Alto, CA",
    level: "Senior",
    salaryRange: "$155k - $190k",
    requiredSkills: ["Quality Systems", "Regulatory Inspections", "Leadership"],
    postedAt: "1 week ago",
    domain: "QA"
  },
  {
    id: "j16",
    title: "Downstream Purification Scientist",
    company: "Biogen",
    location: "Research Triangle Park, NC",
    level: "Mid",
    salaryRange: "$85k - $105k",
    requiredSkills: ["Chromatography", "Ultrafiltration", "Protein Purification"],
    postedAt: "5 days ago",
    domain: "Manufacturing"
  },
  {
    id: "j17",
    title: "QC Lab Supervisor",
    company: "Novartis",
    location: "East Hanover, NJ",
    level: "Senior",
    salaryRange: "$100k - $125k",
    requiredSkills: ["Team Leadership", "LIMS", "Batch Release"],
    postedAt: "3 days ago",
    domain: "QC"
  },
  {
    id: "j18",
    title: "Regulatory Affairs Coordinator",
    company: "Eli Lilly",
    location: "Indianapolis, IN",
    level: "Entry",
    salaryRange: "$58k - $70k",
    requiredSkills: ["eCTD Publishing", "Regulatory Databases", "Project Coordination"],
    postedAt: "2 days ago",
    domain: "RA"
  },
  {
    id: "j19",
    title: "Fill-Finish Operator",
    company: "Baxter International",
    location: "Bloomington, IN",
    level: "Entry",
    salaryRange: "$50k - $65k",
    requiredSkills: ["Aseptic Processing", "Clean Room Operations", "SOP Compliance"],
    postedAt: "Just now",
    domain: "Manufacturing"
  },
  {
    id: "j20",
    title: "Senior QA Auditor",
    company: "Johnson & Johnson",
    location: "Horsham, PA",
    level: "Senior",
    salaryRange: "$120k - $145k",
    requiredSkills: ["Internal Auditing", "ISO 13485", "Risk Management"],
    postedAt: "1 week ago",
    domain: "QA"
  }
];

export const solutionsData: Product[] = [
  {
    id: "p1",
    name: "UltraPure Water System",
    tagline: "Type 1 water for critical applications.",
    features: ["18.2 MO resistivity", "Real-time TOC monitoring", "Endotoxin-free output", "Automated sanitization cycles"],
    targetUsers: ["QC Labs", "R&D Teams", "Pharmaceutical Manufacturing"],
    painPoint: "Inconsistent water quality leads to failed assays and unreliable analytical results.",
    salesTalkingPoints: [
      "Eliminates the need for third-party water quality testing.",
      "Reduces consumable costs by 40% compared to bottled reagent-grade water.",
      "Meets USP, EP, and JP purified water and WFI specifications."
    ]
  },
  {
    id: "p2",
    name: "Automated Pipetting Robot",
    tagline: "Increase throughput and reduce RSI.",
    features: ["96-well and 384-well format support", "Sub-microliter precision", "Customizable protocol library", "Barcode tracking integration"],
    targetUsers: ["High-Throughput Screening Labs", "QC Labs", "Clinical Diagnostics"],
    painPoint: "Manual pipetting is slow, error-prone, and causes repetitive strain injuries in high-volume labs.",
    salesTalkingPoints: [
      "Reduces pipetting variability by over 90% compared to manual methods.",
      "Handles up to 10,000 samples per day with walk-away automation.",
      "FDA 21 CFR Part 11 compliant software for regulated environments."
    ]
  },
  {
    id: "p3",
    name: "Next-Gen Sequencer Mini",
    tagline: "Desktop sequencing power.",
    features: ["Rapid turnaround under 24 hours", "Low cost per run", "Simplified library prep workflow", "Cloud-based analysis pipeline"],
    targetUsers: ["Academic Labs", "R&D Teams", "Clinical Genomics"],
    painPoint: "Core facility sequencing queues delay results by weeks, slowing research timelines.",
    salesTalkingPoints: [
      "Generate publication-quality sequencing data without leaving your lab.",
      "Total cost per sample under $50 for targeted panels.",
      "Intuitive software requires no bioinformatics expertise for standard analyses."
    ]
  },
  {
    id: "p4",
    name: "CryoStorage -80C Freezer",
    tagline: "Reliable sample preservation.",
    features: ["Dual compressor redundancy", "Backup CO2 cooling system", "Cloud-based temperature monitoring", "Energy-efficient vacuum insulation", "Inventory management software"],
    targetUsers: ["Biobanks", "R&D Teams", "Clinical Repositories"],
    painPoint: "Freezer failures can destroy irreplaceable biological samples collected over years of research.",
    salesTalkingPoints: [
      "Dual compressor design ensures no single point of failure.",
      "24/7 cloud monitoring sends instant alerts to multiple devices.",
      "30% more energy efficient than leading competitor models."
    ]
  },
  {
    id: "p5",
    name: "Benchtop Centrifuge Pro",
    tagline: "Versatile separation for every protocol.",
    features: ["Maximum speed 25,000 RPM", "Refrigerated to -10C", "Interchangeable rotor system", "Quiet operation below 55 dB"],
    targetUsers: ["R&D Teams", "QC Labs", "Academic Labs"],
    painPoint: "Labs waste time waiting for shared centrifuges or working around rotor incompatibilities.",
    salesTalkingPoints: [
      "Interchangeable rotors support tubes from 0.2 mL to 50 mL without adapters.",
      "Reaches maximum speed in under 30 seconds for faster protocol completion.",
      "Compact footprint fits under standard fume hoods."
    ]
  },
  {
    id: "p6",
    name: "Multi-Mode Plate Reader",
    tagline: "Absorbance, fluorescence, and luminescence in one instrument.",
    features: ["Monochromator and filter-based detection", "Temperature control to 45C", "Automated stacker for up to 50 plates", "21 CFR Part 11 software option"],
    targetUsers: ["Drug Discovery Labs", "QC Labs", "High-Throughput Screening"],
    painPoint: "Multiple single-mode readers consume bench space and budgets while limiting assay flexibility.",
    salesTalkingPoints: [
      "Consolidates three instruments into one, saving bench space and capital.",
      "Read times under 10 seconds per 96-well plate in absorbance mode.",
      "Pre-validated protocols for common assays including ELISA, cell viability, and reporter gene."
    ]
  },
  {
    id: "p7",
    name: "PCR Thermal Cycler X200",
    tagline: "Fast, uniform cycling for reliable results.",
    features: ["Gradient capability across 96 wells", "Ramp rate of 5C per second", "Heated lid with adjustable pressure", "USB and Ethernet connectivity"],
    targetUsers: ["Molecular Biology Labs", "Clinical Diagnostics", "QC Labs"],
    painPoint: "Temperature non-uniformity across the block causes inconsistent amplification and wasted reagents.",
    salesTalkingPoints: [
      "Block uniformity within 0.2C ensures consistent results across all 96 wells.",
      "Gradient feature optimizes annealing temperatures in a single run.",
      "Protocol sharing across networked instruments standardizes methods."
    ]
  },
  {
    id: "p8",
    name: "Biological Safety Cabinet Class II",
    tagline: "Personnel, product, and environmental protection.",
    features: ["HEPA-filtered supply and exhaust air", "Ergonomic 10-inch sash opening", "UV decontamination cycle", "NSF/ANSI 49 certified"],
    targetUsers: ["Cell Culture Labs", "Microbiology Labs", "Pharmaceutical Manufacturing"],
    painPoint: "Contamination events in cell culture destroy months of work and expensive biological materials.",
    salesTalkingPoints: [
      "Provides operator protection equivalent to BSL-2 containment.",
      "Energy-saving ECM blower reduces annual operating costs by 60%.",
      "Low noise level of 58 dB allows comfortable extended use."
    ]
  },
  {
    id: "p9",
    name: "Digital pH Meter Pro",
    tagline: "Precision pH measurement with automatic calibration.",
    features: ["Five-point automatic calibration", "GLP-compliant data logging", "Temperature compensation", "Replaceable electrode design"],
    targetUsers: ["QC Labs", "Buffer Preparation", "Environmental Testing"],
    painPoint: "Inaccurate pH measurements cause buffer preparation errors that cascade through downstream assays.",
    salesTalkingPoints: [
      "Auto-calibration reduces setup time and eliminates user-dependent calibration errors.",
      "Built-in data logging stores up to 5,000 measurements with timestamps.",
      "Electrode diagnostics alert users before measurement accuracy degrades."
    ]
  },
  {
    id: "p10",
    name: "Analytical Balance 0.01mg",
    tagline: "Micro-weighing precision for critical measurements.",
    features: ["Readability to 0.01 mg", "Internal automatic calibration", "Draft shield with anti-static ionizer", "RS-232 and USB data output"],
    targetUsers: ["Analytical Chemistry Labs", "QC Labs", "Formulation Development"],
    painPoint: "Weighing errors in standard and sample preparation propagate through all subsequent analytical results.",
    salesTalkingPoints: [
      "Internal calibration activates automatically with temperature changes, ensuring accuracy.",
      "Ionizer eliminates static charge effects on low-mass samples.",
      "GLP-compliant printouts include date, time, user ID, and calibration status."
    ]
  },
  {
    id: "p11",
    name: "Endotoxin Detection Kit (rFC)",
    tagline: "Recombinant alternative to horseshoe crab-derived LAL.",
    features: ["Recombinant Factor C-based assay", "96-well microplate format", "Sensitivity to 0.005 EU/mL", "Room temperature stable reagents"],
    targetUsers: ["QC Labs", "Pharmaceutical Manufacturing", "Medical Device Testing"],
    painPoint: "Traditional LAL testing relies on horseshoe crab harvesting and is subject to supply chain disruptions.",
    salesTalkingPoints: [
      "Sustainable, animal-free alternative accepted by FDA and EMA.",
      "Eliminates lot-to-lot variability inherent in natural LAL reagents.",
      "Room temperature storage simplifies logistics and reduces cold chain costs."
    ]
  },
  {
    id: "p12",
    name: "LIMS Cloud Platform",
    tagline: "Laboratory information management without the infrastructure.",
    features: ["Sample tracking and chain of custody", "Instrument integration via API", "Configurable workflows and approvals", "21 CFR Part 11 electronic signatures", "Real-time dashboards and reporting"],
    targetUsers: ["QC Labs", "Contract Testing Organizations", "R&D Teams"],
    painPoint: "Paper-based lab records are error-prone, difficult to search, and do not meet modern data integrity expectations.",
    salesTalkingPoints: [
      "Eliminates paper logbooks and reduces data transcription errors by 95%.",
      "Cloud deployment means no on-premises servers or IT infrastructure required.",
      "Configurable to match existing workflows, reducing change management burden."
    ]
  }
];

export const sopsData: SOP[] = [
  {
    id: "s1",
    title: "SOP-001: Gowning Procedure for Cleanrooms",
    summary: "Standard procedure for entering ISO 7 and ISO 8 cleanroom environments.",
    content: "1. Remove all personal items including jewelry, watches, and mobile devices. Store in designated lockers outside the gowning area.\n2. Wash hands and forearms thoroughly with antimicrobial soap for a minimum of 30 seconds. Dry with lint-free towels.\n3. Apply alcohol-based hand sanitizer and allow to air dry completely.\n4. Don hair net ensuring all hair is fully contained. Apply beard cover if applicable.\n5. Put on shoe covers, ensuring they fully cover street shoes and are secured around the ankle.\n6. Enter the gowning room through the first airlock. Stand on the sticky mat with both feet.\n7. Remove the sterile coverall from its packaging without touching the exterior surface.\n8. Step into the coverall one leg at a time, pulling it up and inserting arms into sleeves.\n9. Zip the coverall fully closed and secure the snap at the collar.\n10. Don sterile gloves, tucking the cuffs of the coverall into the glove wrists.\n11. Apply safety goggles and face mask if required by the area classification.\n12. Proceed through the second airlock into the classified area.\n13. Upon exiting, remove gowning items in reverse order and dispose of single-use items in designated bins.",
    isLocked: false
  },
  {
    id: "s2",
    title: "SOP-002: Pipette Calibration and Maintenance",
    summary: "Quarterly calibration requirements and daily verification steps for air-displacement pipettes.",
    content: "1. Verify the pipette is clean and free of visible contamination before starting calibration.\n2. Set the pipette to its nominal volume. For a P200, use 200 uL as the test volume.\n3. Pre-wet the tip by aspirating and dispensing deionized water three times. Discard the tip and attach a new one.\n4. Place a tared analytical balance (readability 0.1 mg or better) in a draft-free location.\n5. Aspirate the test volume, pause for 2 seconds, then dispense into a pre-weighed container on the balance.\n6. Record the mass. Repeat for a total of 10 replicates.\n7. Calculate the mean dispensed volume using the density of water at the ambient temperature.\n8. Calculate the accuracy (systematic error) as the percentage deviation of the mean from the nominal volume.\n9. Calculate the precision (random error) as the coefficient of variation of the 10 measurements.\n10. Acceptance criteria: Accuracy within 1.0% and precision (CV) within 0.5% for volumes above 50 uL.\n11. If the pipette fails, adjust the calibration mechanism per manufacturer instructions and repeat testing.\n12. Record all results in the calibration log with date, analyst initials, and instrument serial number.\n13. Affix a calibration sticker with the calibration date and next due date to the pipette.",
    isLocked: false
  },
  {
    id: "s3",
    title: "SOP-003: Hazardous Waste Disposal",
    summary: "Proper segregation and disposal of biological, chemical, and sharps waste in laboratory settings.",
    content: "LOCKED CONTENT",
    isLocked: false
  },
  {
    id: "s4",
    title: "SOP-004: Emergency Spill Response",
    summary: "Action plan for biological and chemical spills greater than 100 mL outside of a biosafety cabinet.",
    content: "LOCKED CONTENT",
    isLocked: false
  },
  {
    id: "s5",
    title: "SOP-005: Autoclave Operation and Validation",
    summary: "Loading patterns, cycle selection, and biological indicator verification for steam sterilization.",
    content: "LOCKED CONTENT",
    isLocked: false
  },
  {
    id: "s6",
    title: "SOP-006: HPLC System Suitability and Operation",
    summary: "Procedure for performing system suitability testing and routine HPLC analysis of pharmaceutical samples.",
    content: "LOCKED CONTENT",
    isLocked: false
  },
  {
    id: "s7",
    title: "SOP-007: Media Preparation for Microbiology Testing",
    summary: "Preparation, sterilization, and quality control of growth media used in microbiological assays.",
    content: "LOCKED CONTENT",
    isLocked: false
  },
  {
    id: "s8",
    title: "SOP-008: Environmental Monitoring Program",
    summary: "Sampling procedures for viable and non-viable particle monitoring in classified manufacturing areas.",
    content: "LOCKED CONTENT",
    isLocked: false
  },
  {
    id: "s9",
    title: "SOP-009: Out-of-Specification Investigation Procedure",
    summary: "Step-by-step process for conducting Phase I and Phase II OOS investigations in QC laboratories.",
    content: "LOCKED CONTENT",
    isLocked: false
  },
  {
    id: "s10",
    title: "SOP-010: Deviation Reporting and Management",
    summary: "Documentation requirements and investigation workflows for planned and unplanned deviations.",
    content: "LOCKED CONTENT",
    isLocked: false
  },
  {
    id: "s11",
    title: "SOP-011: Change Control Procedure",
    summary: "Formal process for evaluating, approving, and implementing changes to validated systems and processes.",
    content: "LOCKED CONTENT",
    isLocked: false
  },
  {
    id: "s12",
    title: "SOP-012: Analytical Balance Calibration",
    summary: "Daily verification and periodic calibration of analytical and micro-balances used in GMP testing.",
    content: "LOCKED CONTENT",
    isLocked: false
  },
  {
    id: "s13",
    title: "SOP-013: Sample Receipt and Chain of Custody",
    summary: "Procedures for receiving, logging, and storing incoming samples to maintain chain of custody integrity.",
    content: "LOCKED CONTENT",
    isLocked: false
  },
  {
    id: "s14",
    title: "SOP-014: Buffer and Reagent Preparation",
    summary: "Standard procedures for preparing, labeling, and documenting buffers and reagents for laboratory use.",
    content: "LOCKED CONTENT",
    isLocked: false
  },
  {
    id: "s15",
    title: "SOP-015: Equipment Cleaning and Decontamination",
    summary: "Cleaning procedures for shared laboratory equipment to prevent cross-contamination between analyses.",
    content: "LOCKED CONTENT",
    isLocked: false
  },
  {
    id: "s16",
    title: "SOP-016: Batch Record Review and Approval",
    summary: "Quality review checklist and approval workflow for completed manufacturing batch records.",
    content: "LOCKED CONTENT",
    isLocked: false
  },
  {
    id: "s17",
    title: "SOP-017: Bacterial Endotoxin Testing (LAL Method)",
    summary: "Kinetic turbidimetric LAL method for detecting and quantifying bacterial endotoxins in parenteral products.",
    content: "LOCKED CONTENT",
    isLocked: false
  },
  {
    id: "s18",
    title: "SOP-018: Annual Product Quality Review",
    summary: "Compilation and trending of batch data, deviations, CAPAs, and complaints for annual product review.",
    content: "LOCKED CONTENT",
    isLocked: false
  }
];

export const labToolsData: LabTool[] = [
  {
    id: "lt1",
    name: "Molarity Calculator",
    description: "Calculate the molarity of a solution given mass, molecular weight, and volume. Supports common unit conversions for grams, milligrams, liters, and milliliters.",
    icon: "flask",
    category: "Solution Prep",
    tags: ["molarity", "concentration", "solution"],
    difficulty: "Basic",
    timeLabel: "~30 sec",
    audience: ["Student", "QC"],
    isMostUsed: true,
    status: "FREE",
    available: true
  },
  {
    id: "lt2",
    name: "Dilution Calculator",
    description: "Apply the C1V1 = C2V2 equation to determine the volume or concentration needed for serial or simple dilutions of stock solutions.",
    icon: "beaker",
    category: "Solution Prep",
    tags: ["dilution", "C1V1", "stock solution"],
    difficulty: "Basic",
    timeLabel: "~30 sec",
    audience: ["Student", "QC"],
    isMostUsed: true,
    status: "FREE",
    available: true
  },
  {
    id: "lt3",
    name: "Serial Dilution Planner",
    description: "Plan multi-step serial dilution series with configurable dilution factors and volumes. Generates a step-by-step pipetting guide.",
    icon: "test-tubes",
    category: "Solution Prep",
    tags: ["serial dilution", "pipetting", "protocol"],
    difficulty: "Intermediate",
    timeLabel: "~1 min",
    audience: ["Student", "QC"],
    isMostUsed: false,
    status: "COMING_SOON",
    available: false
  },
  {
    id: "lt4",
    name: "Unit Converter",
    description: "Convert between common laboratory units including mass, volume, concentration, temperature, and pressure.",
    icon: "arrow-right-left",
    category: "Analytical & Quantification",
    tags: ["units", "conversion", "mass", "volume"],
    difficulty: "Basic",
    timeLabel: "~15 sec",
    audience: ["Student", "QC"],
    isMostUsed: true,
    status: "COMING_SOON",
    available: false
  },
  {
    id: "lt5",
    name: "Buffer Recipe Tool",
    description: "Calculate the amounts of acid, base, and salt components needed to prepare buffers at a target pH and ionic strength.",
    icon: "flask-round",
    category: "Solution Prep",
    tags: ["buffer", "pH", "recipe"],
    difficulty: "Intermediate",
    timeLabel: "~1 min",
    audience: ["Student", "QC"],
    isMostUsed: false,
    status: "COMING_SOON",
    available: false
  },
  {
    id: "lt6",
    name: "Cell Counting Calculator",
    description: "Calculate cell concentration and viability from hemocytometer or automated cell counter readings, including dilution factor corrections.",
    icon: "grid-3x3",
    category: "Cell & Microbiology",
    tags: ["cell count", "hemocytometer", "viability"],
    difficulty: "Basic",
    timeLabel: "~30 sec",
    audience: ["Student", "QC"],
    isMostUsed: false,
    status: "COMING_SOON",
    available: false
  },
  {
    id: "lt7",
    name: "Endotoxin Calculator",
    description: "Determine the endotoxin limit and maximum valid dilution for bacterial endotoxin testing based on dose, route, and product concentration.",
    icon: "shield-alert",
    category: "Cell & Microbiology",
    tags: ["endotoxin", "LAL", "pyrogen"],
    difficulty: "Intermediate",
    timeLabel: "~1 min",
    audience: ["QC"],
    isMostUsed: false,
    status: "PRO",
    available: true
  },
  {
    id: "lt8",
    name: "Protein Concentration",
    description: "Estimate protein concentration from absorbance data using Beer-Lambert law, BCA standard curves, or Bradford assay readings.",
    icon: "chart-line",
    category: "Analytical & Quantification",
    tags: ["protein", "BCA", "Bradford", "absorbance"],
    difficulty: "Intermediate",
    timeLabel: "~1 min",
    audience: ["Student", "QC"],
    isMostUsed: false,
    status: "COMING_SOON",
    available: false
  },
  {
    id: "lt9",
    name: "OD600 Growth Tracker",
    description: "Log optical density readings at 600 nm over time to track bacterial growth curves and estimate doubling times.",
    icon: "trending-up",
    category: "Cell & Microbiology",
    tags: ["OD600", "growth curve", "bacteria"],
    difficulty: "Intermediate",
    timeLabel: "~2 min",
    audience: ["Student", "QC"],
    isMostUsed: false,
    status: "COMING_SOON",
    available: false
  },
  {
    id: "lt10",
    name: "Centrifuge Speed Converter",
    description: "Convert between RPM and relative centrifugal force (RCF/g-force) using rotor radius, or calculate the required RPM for a target RCF.",
    icon: "refresh-cw",
    category: "Analytical & Quantification",
    tags: ["centrifuge", "RPM", "RCF", "g-force"],
    difficulty: "Basic",
    timeLabel: "~15 sec",
    audience: ["Student", "QC"],
    isMostUsed: false,
    status: "COMING_SOON",
    available: false
  }
];

export const skillsData: Skill[] = [
  {
    id: "sk1",
    name: "Laboratory Safety and Compliance",
    description: "Understanding of biosafety levels, PPE requirements, chemical hygiene plans, and institutional safety regulations required for working in biotech laboratories.",
    audience: "STUDENT"
  },
  {
    id: "sk2",
    name: "Scientific Literature Review",
    description: "Ability to search, read, critically evaluate, and synthesize peer-reviewed publications to inform experimental design and interpret results.",
    audience: "STUDENT"
  },
  {
    id: "sk3",
    name: "Basic Molecular Biology Techniques",
    description: "Proficiency in foundational techniques including PCR, gel electrophoresis, restriction digestion, ligation, and bacterial transformation.",
    audience: "STUDENT"
  },
  {
    id: "sk4",
    name: "Data Analysis and Statistics",
    description: "Competence in statistical methods commonly used in life sciences including t-tests, ANOVA, regression analysis, and proper use of error bars and significance reporting.",
    audience: "STUDENT"
  },
  {
    id: "sk5",
    name: "Laboratory Notebook Documentation",
    description: "Practice of maintaining clear, complete, and contemporaneous laboratory records that meet academic and industry documentation standards.",
    audience: "STUDENT"
  },
  {
    id: "sk6",
    name: "GMP Documentation Practices",
    description: "Ability to write, review, and follow controlled documents including SOPs, batch records, and laboratory notebooks in compliance with cGMP requirements.",
    audience: "QC"
  },
  {
    id: "sk7",
    name: "Analytical Instrument Operation",
    description: "Hands-on proficiency with HPLC, GC, UV-Vis spectrophotometry, dissolution apparatus, and other instruments commonly used in QC testing laboratories.",
    audience: "QC"
  },
  {
    id: "sk8",
    name: "Method Validation and Transfer",
    description: "Knowledge of ICH Q2 validation parameters and the ability to execute method validation and transfer protocols with proper statistical analysis.",
    audience: "QC"
  },
  {
    id: "sk9",
    name: "LIMS and Electronic Data Systems",
    description: "Experience with laboratory information management systems, electronic lab notebooks, and chromatography data systems in regulated environments.",
    audience: "QC"
  },
  {
    id: "sk10",
    name: "Investigation and Root Cause Analysis",
    description: "Skill in conducting structured investigations for OOS results, deviations, and complaints using tools such as fishbone diagrams, 5-Whys, and fault tree analysis.",
    audience: "QC"
  },
  {
    id: "sk11",
    name: "Technical Product Knowledge",
    description: "Deep understanding of the scientific principles, specifications, and applications of the products being sold, enabling credible conversations with technical buyers.",
    audience: "SALES"
  },
  {
    id: "sk12",
    name: "CRM and Pipeline Management",
    description: "Proficiency in using customer relationship management tools to track leads, manage opportunities, forecast revenue, and maintain account histories.",
    audience: "SALES"
  },
  {
    id: "sk13",
    name: "Negotiation and Closing",
    description: "Ability to negotiate pricing, terms, and contracts while maintaining customer relationships and protecting company margin objectives.",
    audience: "SALES"
  },
  {
    id: "sk14",
    name: "Scientific Communication",
    description: "Ability to translate complex scientific concepts into clear, compelling language appropriate for diverse audiences including scientists, procurement, and management.",
    audience: "SALES"
  },
  {
    id: "sk15",
    name: "Market and Competitive Analysis",
    description: "Skill in analyzing market trends, competitor positioning, and customer needs to identify growth opportunities and inform sales strategy.",
    audience: "SALES"
  }
];
