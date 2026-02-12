import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, FlaskConical, Beaker, FlaskRound, Pipette, Gauge, Scale, TestTubes, Microscope, Activity, RotateCcw, ArrowRightLeft, Grid3x3, ShieldAlert, ChartLine, TrendingUp, RefreshCw, Search, Clock, Zap, SlidersHorizontal, ChevronRight, Bell } from "lucide-react";
import clsx from "clsx";
import { useLabTools } from "@/hooks/use-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { LabTool, ToolSection } from "@shared/schema";

type CalculatorType = "molarity" | "dilution";
type FilterChip = "All" | "Most Used" | "Beginner Friendly" | "QC Lab" | "Student" | "Coming Soon";
type SortOption = "Most Used" | "A-Z" | "Newest";

const filterChips: FilterChip[] = ["All", "Most Used", "Beginner Friendly", "QC Lab", "Student", "Coming Soon"];
const sortOptions: SortOption[] = ["Most Used", "A-Z", "Newest"];
const sections: ToolSection[] = ["Solution Prep", "Cell & Microbiology", "Analytical & Quantification"];

const quickAccessIds = ["lt1", "lt2", "lt4"];

export default function LabTools() {
  const { data: tools } = useLabTools();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterChip>("All");
  const [sort, setSort] = useState<SortOption>("Most Used");
  const [activeCalc, setActiveCalc] = useState<CalculatorType | null>(null);

  const filteredTools = useMemo(() => {
    if (!tools) return [];

    let result = tools.filter(t => {
      const q = search.toLowerCase();
      const matchesSearch = !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.tags.some(tag => tag.toLowerCase().includes(q));
      if (!matchesSearch) return false;

      switch (activeFilter) {
        case "Most Used": return t.isMostUsed;
        case "Beginner Friendly": return t.difficulty === "Basic";
        case "QC Lab": return t.audience.includes("QC");
        case "Student": return t.audience.includes("Student");
        case "Coming Soon": return t.status === "COMING_SOON";
        default: return true;
      }
    });

    switch (sort) {
      case "A-Z": result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "Newest": result.sort((a, b) => parseInt(b.id.replace("lt", "")) - parseInt(a.id.replace("lt", ""))); break;
      default: result.sort((a, b) => (b.isMostUsed ? 1 : 0) - (a.isMostUsed ? 1 : 0)); break;
    }

    return result;
  }, [tools, search, activeFilter, sort]);

  const quickAccessTools = tools?.filter(t => quickAccessIds.includes(t.id)) || [];

  const freeCount = tools?.filter(t => t.status === "FREE").length || 0;
  const comingSoonCount = tools?.filter(t => t.status === "COMING_SOON").length || 0;

  return (
    <div className="pb-24 pt-4 md:pt-8 max-w-5xl mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2" data-testid="text-tools-heading">Lab Tools</h1>
        <p className="text-muted-foreground">Essential calculators for your daily experiments. All tools are free.</p>
        <div className="flex gap-3 mt-3">
          <span className="text-[11px] bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-muted-foreground" data-testid="stat-free">{freeCount} Free</span>
          <span className="text-[11px] bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-muted-foreground" data-testid="stat-coming-soon">{comingSoonCount} Coming Soon</span>
        </div>
      </div>

      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold">Quick Access</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {quickAccessTools.map(tool => (
            <button
              key={tool.id}
              onClick={() => {
                if (tool.id === "lt1") setActiveCalc("molarity");
                else if (tool.id === "lt2") setActiveCalc("dilution");
              }}
              disabled={!tool.available}
              data-testid={`button-quick-access-${tool.id}`}
              className={clsx(
                "flex items-center gap-3 bg-card border rounded-xl px-4 py-3 shrink-0 transition-colors",
                tool.available
                  ? "border-primary/20 hover:border-primary/50 cursor-pointer"
                  : "border-white/5 opacity-60 cursor-not-allowed"
              )}
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                {getIconComponent(tool.icon)}
              </div>
              <div className="text-left">
                <p className="text-sm font-bold whitespace-nowrap">{tool.name}</p>
                <p className="text-[10px] text-muted-foreground">{tool.timeLabel}</p>
              </div>
              {tool.available && <ChevronRight className="w-4 h-4 text-muted-foreground ml-2" />}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 mb-8 sticky top-[60px] md:top-24 z-30 bg-background/95 backdrop-blur-xl py-2 -mx-4 px-4 border-b border-white/5 md:border-none md:bg-transparent md:static md:p-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tools..."
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-tools"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1">
            {filterChips.map(chip => (
              <button
                key={chip}
                onClick={() => setActiveFilter(chip)}
                data-testid={`button-filter-${chip.toLowerCase().replace(/\s+/g, '-')}`}
                className={clsx(
                  "px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border",
                  activeFilter === chip
                    ? "bg-primary text-white border-primary"
                    : "bg-card text-muted-foreground border-border hover:border-primary/50"
                )}
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="relative shrink-0">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              data-testid="select-sort-tools"
              className="appearance-none bg-card border border-border rounded-lg pl-3 pr-8 py-1.5 text-xs font-medium text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
            >
              {sortOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <SlidersHorizontal className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {sections.map(section => {
        const sectionTools = filteredTools.filter(t => t.category === section);
        if (sectionTools.length === 0) return null;
        return (
          <div key={section} className="mb-10">
            <h2 className="text-lg font-bold mb-4" data-testid={`text-section-${section.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`}>{section}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {sectionTools.map(tool => (
                <ToolCard key={tool.id} tool={tool} onOpenCalc={setActiveCalc} />
              ))}
            </div>
          </div>
        );
      })}

      {filteredTools.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Calculator className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No tools found</p>
          <p className="text-sm mt-1">Try adjusting your search or filter.</p>
        </div>
      )}

      <Dialog open={activeCalc !== null} onOpenChange={(open) => !open && setActiveCalc(null)}>
        <DialogContent className="max-w-2xl bg-card border-white/10 text-foreground p-0 overflow-hidden sm:rounded-2xl">
          <DialogTitle className="sr-only">
            {activeCalc === "molarity" ? "Molarity Calculator" : "Dilution Calculator"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {activeCalc === "molarity" ? "Calculate the mass required for a solution." : "Apply the C1V1 = C2V2 equation."}
          </DialogDescription>
          <div className="max-h-[85vh] overflow-y-auto p-6 md:p-8">
            <AnimatePresence mode="wait">
              {activeCalc && (
                <motion.div
                  key={activeCalc}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeCalc === "molarity" ? <MolarityCalculator /> : <DilutionCalculator />}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MolarityCalculator() {
  const [mw, setMw] = useState<string>("");
  const [vol, setVol] = useState<string>("");
  const [conc, setConc] = useState<string>("");
  const [mass, setMass] = useState<string>("");

  const calculate = () => {
    const m = parseFloat(mw);
    const v = parseFloat(vol);
    const c = parseFloat(conc);
    if (!isNaN(m) && !isNaN(v) && !isNaN(c)) {
      setMass((m * c * v).toFixed(4));
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
          <FlaskConical className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Molarity Calculator</h2>
          <p className="text-xs text-muted-foreground">Calculate mass required for a solution.</p>
        </div>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputGroup label="Molecular Weight (g/mol)" value={mw} onChange={setMw} placeholder="e.g. 58.44" testId="input-mw" />
          <InputGroup label="Concentration (M)" value={conc} onChange={setConc} placeholder="e.g. 0.5" testId="input-conc" />
          <InputGroup label="Volume (L)" value={vol} onChange={setVol} placeholder="e.g. 0.1" testId="input-vol" />
        </div>
        <div className="pt-6 mt-6 border-t border-white/10">
          <Button
            onClick={calculate}
            data-testid="button-calculate-molarity"
            className="w-full font-bold"
            size="lg"
          >
            Calculate Mass
          </Button>
        </div>
        {mass && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 bg-secondary/50 rounded-xl p-6 text-center border border-white/5"
          >
            <p className="text-sm text-muted-foreground mb-1">Required Mass</p>
            <p className="text-3xl font-bold font-mono text-primary" data-testid="text-result-mass">{mass} g</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function DilutionCalculator() {
  const [c1, setC1] = useState("");
  const [v1, setV1] = useState("");
  const [c2, setC2] = useState("");
  const [v2, setV2] = useState("");

  const calculate = () => {
    const _c1 = parseFloat(c1);
    const _v1 = parseFloat(v1);
    const _c2 = parseFloat(c2);
    const _v2 = parseFloat(v2);

    if (isNaN(_v1) && !isNaN(_c1) && !isNaN(_c2) && !isNaN(_v2)) {
      setV1(((_c2 * _v2) / _c1).toFixed(4));
    } else if (isNaN(_v2) && !isNaN(_c1) && !isNaN(_v1) && !isNaN(_c2)) {
      setV2(((_c1 * _v1) / _c2).toFixed(4));
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
          <Beaker className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Dilution Calculator</h2>
          <p className="text-xs text-muted-foreground">C1V1 = C2V2. Leave one field empty to solve.</p>
        </div>
      </div>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6 relative">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Stock (1)</h3>
            <InputGroup label="Concentration (C1)" value={c1} onChange={setC1} placeholder="Start Conc." testId="input-c1" />
            <InputGroup label="Volume (V1)" value={v1} onChange={setV1} placeholder="Start Vol." testId="input-v1" />
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground font-display text-2xl font-bold opacity-30">=</div>
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Target (2)</h3>
            <InputGroup label="Concentration (C2)" value={c2} onChange={setC2} placeholder="End Conc." testId="input-c2" />
            <InputGroup label="Volume (V2)" value={v2} onChange={setV2} placeholder="End Vol." testId="input-v2" />
          </div>
        </div>
        <Button
          onClick={calculate}
          data-testid="button-calculate-dilution"
          className="w-full font-bold"
          size="lg"
        >
          Calculate
        </Button>
      </div>
    </div>
  );
}

function InputGroup({ label, value, onChange, placeholder, testId }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; testId?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground ml-1">{label}</label>
      <input
        type="number"
        className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid={testId}
      />
    </div>
  );
}

function getIconComponent(iconName: string | undefined) {
  const iconMap: Record<string, React.ReactNode> = {
    "flask": <FlaskConical className="w-5 h-5" />,
    "beaker": <Beaker className="w-5 h-5" />,
    "test-tubes": <TestTubes className="w-5 h-5" />,
    "arrow-right-left": <ArrowRightLeft className="w-5 h-5" />,
    "flask-round": <FlaskRound className="w-5 h-5" />,
    "grid-3x3": <Grid3x3 className="w-5 h-5" />,
    "shield-alert": <ShieldAlert className="w-5 h-5" />,
    "chart-line": <ChartLine className="w-5 h-5" />,
    "trending-up": <TrendingUp className="w-5 h-5" />,
    "refresh-cw": <RefreshCw className="w-5 h-5" />,
  };
  return iconMap[iconName || ""] || <Calculator className="w-5 h-5" />;
}

interface ToolCardProps {
  tool: LabTool;
  onOpenCalc: (calc: CalculatorType) => void;
}

function ToolCard({ tool, onOpenCalc }: ToolCardProps) {
  const isComingSoon = tool.status === "COMING_SOON";

  const handleOpen = () => {
    if (tool.id === "lt1") onOpenCalc("molarity");
    else if (tool.id === "lt2") onOpenCalc("dilution");
  };

  return (
    <div
      data-testid={`card-tool-${tool.id}`}
      className={clsx(
        "bg-card border border-white/5 rounded-2xl p-4 transition-all flex flex-col",
        isComingSoon && "opacity-70"
      )}
    >
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
          {getIconComponent(tool.icon)}
        </div>
        <Badge
          variant={isComingSoon ? "outline" : "default"}
          className={clsx(
            "text-[10px] shrink-0",
            isComingSoon ? "text-muted-foreground border-muted-foreground/20" : "bg-green-600 text-white border-green-600"
          )}
        >
          {isComingSoon ? "Coming Soon" : "Free"}
        </Badge>
      </div>

      <h3 className="font-bold text-sm mb-1.5">{tool.name}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed mb-3 flex-grow line-clamp-2">
        {tool.description}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-md font-medium">{tool.category}</span>
        <span className="text-[10px] bg-white/5 text-muted-foreground px-2 py-0.5 rounded-md">{tool.difficulty}</span>
        <span className="text-[10px] bg-white/5 text-muted-foreground px-2 py-0.5 rounded-md flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" />{tool.timeLabel}
        </span>
      </div>

      {tool.available ? (
        <Button
          onClick={handleOpen}
          data-testid={`button-open-tool-${tool.id}`}
          className="w-full text-xs font-bold"
          size="sm"
        >
          Open Tool
        </Button>
      ) : (
        <Button
          disabled
          variant="outline"
          data-testid={`button-notify-${tool.id}`}
          className="w-full text-xs font-medium"
          size="sm"
        >
          <Bell className="w-3 h-3" />
          Notify Me
        </Button>
      )}
    </div>
  );
}
