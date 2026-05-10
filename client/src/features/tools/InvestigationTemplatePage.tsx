import { useState } from "react";
import { FileText, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { investigationTemplates } from "@/data/tools/investigationTemplates";
import { useVault } from "@/hooks/useVault";

const sectionLabels: Record<string, string> = {
  eventSummary: "Event summary",
  immediateContainment: "Immediate containment",
  sampleIntegrityCheck: "Sample integrity check",
  labErrorAssessment: "Lab error assessment",
  processFacilityAssessment: "Process/facility assessment",
  organismSignificance: "Organism significance",
  rootCauseHypothesis: "Root cause hypothesis",
  capa: "CAPA",
  effectivenessCheck: "Effectiveness check",
};

export function InvestigationTemplatePage() {
  const [templateId, setTemplateId] = useState(investigationTemplates[0].id);
  const [note, setNote] = useState("");
  const template = investigationTemplates.find((item) => item.id === templateId) ?? investigationTemplates[0];
  const { saveInvestigationNote } = useVault();

  const saveNote = () => {
    if (!note.trim()) return;
    saveInvestigationNote({
      id: `${template.id}:${Date.now()}`,
      title: `${template.title} note`,
      content: note.trim(),
      createdAt: new Date().toISOString(),
    });
    setNote("");
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-card p-5 md:p-6">
      <div className="flex items-center gap-2 mb-5">
        <FileText className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">Investigation Template Viewer</h2>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-5">
        <div className="space-y-2">
          {investigationTemplates.map((item) => (
            <button
              key={item.id}
              onClick={() => setTemplateId(item.id)}
              className={item.id === templateId ? "w-full text-left rounded-xl border border-primary/40 bg-primary/10 p-3 text-sm font-medium" : "w-full text-left rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-muted-foreground hover:border-primary/30"}
            >
              {item.title}
            </button>
          ))}
        </div>

        <div>
          <div className="rounded-xl border border-primary/20 bg-primary/10 p-4 mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Trigger</p>
            <p className="text-sm leading-relaxed">{template.trigger}</p>
          </div>

          <div className="space-y-3">
            {Object.entries(template.sections).map(([key, items]) => (
              <div key={key} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-bold mb-2">{sectionLabels[key] ?? key}</p>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-white/10 bg-background/40 p-4">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Investigation note</label>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Capture a quick hypothesis, risk concern, or follow-up question..."
              className="mt-2 min-h-28 w-full rounded-xl border border-white/10 bg-card p-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
            <Button onClick={saveNote} disabled={!note.trim()} className="mt-3">
              <Save className="w-4 h-4" />
              Save note to Vault
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
