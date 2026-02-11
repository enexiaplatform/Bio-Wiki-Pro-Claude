import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, FlaskConical, Beaker, FlaskRound, Pipette, Gauge, Scale, TestTubes, Microscope, Activity, RotateCcw, Lock, ArrowRightLeft, Grid3x3, ShieldAlert, ChartLine, TrendingUp, RefreshCw } from "lucide-react";
import clsx from "clsx";
import { useLabTools } from "@/hooks/use-data";
import { Badge } from "@/components/ui/badge";

type CalculatorType = "molarity" | "dilution";

export default function LabTools() {
  const [activeTab, setActiveTab] = useState<CalculatorType>("molarity");
  const { data: tools } = useLabTools();

  return (
    <div className="pb-24 pt-4 md:pt-8 max-w-5xl mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Lab Tools</h1>
        <p className="text-muted-foreground">Essential calculators for your daily experiments.</p>
      </div>

      <div className="flex p-1 bg-card rounded-xl mb-8 border border-white/5">
        <button
          onClick={() => setActiveTab("molarity")}
          className={clsx(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all",
            activeTab === "molarity" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <FlaskConical className="w-4 h-4" />
          Molarity
        </button>
        <button
          onClick={() => setActiveTab("dilution")}
          className={clsx(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all",
            activeTab === "dilution" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Beaker className="w-4 h-4" />
          Dilution
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "molarity" ? <MolarityCalculator /> : <DilutionCalculator />}
        </motion.div>
      </AnimatePresence>

      <div className="mt-16">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Tool Catalog</h2>
          <p className="text-muted-foreground">Explore our growing collection of lab tools.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {tools?.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MolarityCalculator() {
  const [mw, setMw] = useState<string>("");
  const [vol, setVol] = useState<string>("");
  const [conc, setConc] = useState<string>("");
  const [mass, setMass] = useState<string>("");

  // Simple reactivity: calculate mass if others are present
  const calculate = () => {
    const m = parseFloat(mw);
    const v = parseFloat(vol);
    const c = parseFloat(conc);
    if (!isNaN(m) && !isNaN(v) && !isNaN(c)) {
      setMass((m * c * v).toFixed(4));
    }
  };

  return (
    <div className="bg-card border border-white/10 rounded-2xl p-6 md:p-8">
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
          <InputGroup label="Molecular Weight (g/mol)" value={mw} onChange={setMw} placeholder="e.g. 58.44" />
          <InputGroup label="Concentration (M)" value={conc} onChange={setConc} placeholder="e.g. 0.5" />
          <InputGroup label="Volume (L)" value={vol} onChange={setVol} placeholder="e.g. 0.1" />
        </div>

        <div className="pt-6 mt-6 border-t border-white/10">
          <button
            onClick={calculate}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/20"
          >
            Calculate Mass
          </button>
        </div>

        {mass && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 bg-secondary/50 rounded-xl p-6 text-center border border-white/5"
          >
            <p className="text-sm text-muted-foreground mb-1">Required Mass</p>
            <p className="text-3xl font-bold font-mono text-primary">{mass} g</p>
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
    // C1V1 = C2V2 logic: solve for the empty one
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
    <div className="bg-card border border-white/10 rounded-2xl p-6 md:p-8">
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
            <InputGroup label="Concentration (C1)" value={c1} onChange={setC1} placeholder="Start Conc." />
            <InputGroup label="Volume (V1)" value={v1} onChange={setV1} placeholder="Start Vol." />
          </div>
          
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground font-display text-2xl font-bold opacity-30">=</div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Target (2)</h3>
            <InputGroup label="Concentration (C2)" value={c2} onChange={setC2} placeholder="End Conc." />
            <InputGroup label="Volume (V2)" value={v2} onChange={setV2} placeholder="End Vol." />
          </div>
        </div>

        <button
          onClick={calculate}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20"
        >
          Calculate
        </button>
      </div>
    </div>
  );
}

function InputGroup({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground ml-1">{label}</label>
      <input
        type="number"
        className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
  tool: {
    id: string;
    name: string;
    description: string;
    icon: string;
    status: "READY" | "COMING_SOON";
  };
}

function ToolCard({ tool }: ToolCardProps) {
  const isComingSoon = tool.status === "COMING_SOON";

  return (
    <div
      data-testid={`card-tool-${tool.id}`}
      className={clsx(
        "bg-card border border-white/5 rounded-2xl p-4 transition-all",
        isComingSoon && "opacity-60"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
            {getIconComponent(tool.icon)}
          </div>
          <Badge
            variant={isComingSoon ? "outline" : "default"}
            className={clsx(
              "text-xs",
              isComingSoon && "text-muted-foreground border-muted-foreground/20"
            )}
          >
            {isComingSoon ? "Coming Soon" : "Available"}
          </Badge>
        </div>

        <h3 className="font-bold text-sm mb-2 flex-shrink-0">{tool.name}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed flex-grow">
          {tool.description}
        </p>
      </div>
    </div>
  );
}
