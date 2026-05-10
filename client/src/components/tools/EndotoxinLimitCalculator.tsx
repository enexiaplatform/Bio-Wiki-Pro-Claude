import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Crown, Lock, Info, CheckCircle2, XCircle, FlaskConical, ArrowRight } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Link } from "wouter";

type RouteOfAdmin = "IV" | "IM" | "SC" | "Intrathecal" | "Inhalation" | "Topical";
type ResultUnit = "EU/mL" | "EU/unit";

const ROUTES: { value: RouteOfAdmin; label: string; k: number }[] = [
  { value: "IV", label: "Intravenous (IV)", k: 5 },
  { value: "IM", label: "Intramuscular (IM)", k: 5 },
  { value: "SC", label: "Subcutaneous (SC)", k: 5 },
  { value: "Intrathecal", label: "Intrathecal", k: 0.2 },
  { value: "Inhalation", label: "Inhalation", k: 5 },
  { value: "Topical", label: "Topical", k: 5 },
];

export default function EndotoxinLimitCalculator() {
  const { isPro } = useUser();

  const [route, setRoute] = useState<RouteOfAdmin>("IV");
  const [maxDose, setMaxDose] = useState("");
  const [doseFrequency, setDoseFrequency] = useState("");
  const [bodyWeight, setBodyWeight] = useState("70");
  const [resultUnit, setResultUnit] = useState<ResultUnit>("EU/mL");
  const [lalTestResult, setLalTestResult] = useState("");
  const [calculated, setCalculated] = useState(false);

  const routeConfig = ROUTES.find((r) => r.value === route)!;
  const K = routeConfig.k;

  const result = useMemo(() => {
    const dose = parseFloat(maxDose);
    const freq = parseFloat(doseFrequency);
    const weight = parseFloat(bodyWeight);

    if (isNaN(dose) || isNaN(freq) || isNaN(weight) || dose <= 0 || freq <= 0 || weight <= 0) {
      return null;
    }

    const M = dose / weight / freq; // mL/kg/hr
    const EL = K / M;

    return { EL, M, K };
  }, [maxDose, doseFrequency, bodyWeight, K]);

  const passFail = useMemo(() => {
    if (!result || !lalTestResult) return null;
    const testVal = parseFloat(lalTestResult);
    if (isNaN(testVal)) return null;
    return testVal <= result.EL ? "PASS" : "FAIL";
  }, [result, lalTestResult]);

  const handleCalculate = () => {
    setCalculated(true);
  };

  const handleReset = () => {
    setRoute("IV");
    setMaxDose("");
    setDoseFrequency("");
    setBodyWeight("70");
    setResultUnit("EU/mL");
    setLalTestResult("");
    setCalculated(false);
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Endotoxin Limit Calculator</h2>
            <Badge className="bg-primary text-white text-[10px]">PRO</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            USP &lt;85&gt; &amp; EP 2.6.14 — Calculate EL = K / M
          </p>
        </div>
      </div>

      {/* PRO gate overlay */}
      {!isPro && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md rounded-2xl" />
          <div className="relative z-10 text-center px-8 max-w-sm">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold mb-2">PRO Feature</h3>
            <p className="text-sm text-muted-foreground mb-6">
              The Endotoxin Limit Calculator is available exclusively for BioWiki Pro members.
            </p>
            <Button asChild size="lg" className="font-bold text-sm w-full">
              <Link href="/upgrade">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to PRO
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Calculator content */}
      <div className={!isPro ? "pointer-events-none select-none" : ""}>
        <div className="space-y-5">
          {/* Route of Administration */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground ml-1">
              Route of Administration
            </label>
            <Select value={route} onValueChange={(v) => setRoute(v as RouteOfAdmin)}>
              <SelectTrigger
                className="w-full bg-background/50 border-white/10 rounded-xl h-11"
                data-testid="select-route"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROUTES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}{" "}
                    <span className="text-muted-foreground text-xs ml-1">
                      (K = {r.k} EU/kg/hr)
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Max single dose */}
            <InputField
              label="Maximum Single Dose (mL)"
              value={maxDose}
              onChange={setMaxDose}
              placeholder="e.g. 10"
              testId="input-max-dose"
            />

            {/* Dose frequency */}
            <InputField
              label="Dose Frequency (hours between doses)"
              value={doseFrequency}
              onChange={setDoseFrequency}
              placeholder="e.g. 1"
              testId="input-dose-frequency"
            />

            {/* Body weight */}
            <InputField
              label="Patient Body Weight (kg)"
              value={bodyWeight}
              onChange={setBodyWeight}
              placeholder="70"
              testId="input-body-weight"
            />

            {/* LAL test result (optional) */}
            <InputField
              label={`LAL Test Result (${resultUnit}) — optional`}
              value={lalTestResult}
              onChange={setLalTestResult}
              placeholder="e.g. 0.5"
              testId="input-lal-result"
            />
          </div>

          {/* Result unit toggle */}
          <div className="flex items-center justify-between bg-secondary/30 rounded-xl px-4 py-3 border border-white/5">
            <span className="text-xs font-medium text-muted-foreground">Result Unit</span>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold ${
                  resultUnit === "EU/mL" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                EU/mL
              </span>
              <Switch
                checked={resultUnit === "EU/unit"}
                onCheckedChange={(checked) => setResultUnit(checked ? "EU/unit" : "EU/mL")}
                data-testid="switch-result-unit"
              />
              <span
                className={`text-xs font-bold ${
                  resultUnit === "EU/unit" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                EU/unit
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleCalculate}
              data-testid="button-calculate-endotoxin"
              className="flex-1 font-bold"
              size="lg"
              disabled={!maxDose || !doseFrequency || !bodyWeight}
            >
              <FlaskConical className="w-4 h-4 mr-2" />
              Calculate EL
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              size="lg"
              className="font-medium border-white/10"
              data-testid="button-reset-endotoxin"
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Results */}
        <AnimatePresence>
          {calculated && result && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="mt-8 space-y-4"
            >
              {/* Main result */}
              <div className="bg-secondary/50 rounded-2xl p-6 text-center border border-white/5">
                <p className="text-sm text-muted-foreground mb-1">Endotoxin Limit (EL)</p>
                <p
                  className="text-4xl font-bold font-mono text-primary"
                  data-testid="text-result-el"
                >
                  {result.EL < 0.001
                    ? result.EL.toExponential(3)
                    : result.EL < 1
                    ? result.EL.toFixed(4)
                    : result.EL.toFixed(2)}{" "}
                  <span className="text-lg font-semibold">{resultUnit}</span>
                </p>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary/30 rounded-xl p-4 border border-white/5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">
                    K Value
                  </p>
                  <p className="text-lg font-bold font-mono" data-testid="text-k-value">
                    {K} <span className="text-xs text-muted-foreground">EU/kg/hr</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {route === "Intrathecal" ? "Intrathecal route" : "Non-intrathecal route"}
                  </p>
                </div>

                <div className="bg-secondary/30 rounded-xl p-4 border border-white/5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">
                    M (Dose/kg/hr)
                  </p>
                  <p className="text-lg font-bold font-mono" data-testid="text-m-value">
                    {result.M < 0.001
                      ? result.M.toExponential(3)
                      : result.M.toFixed(4)}{" "}
                    <span className="text-xs text-muted-foreground">mL/kg/hr</span>
                  </p>
                </div>
              </div>

              {/* Pass / Fail indicator */}
              {passFail && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`rounded-xl p-4 border flex items-center gap-3 ${
                    passFail === "PASS"
                      ? "bg-green-500/10 border-green-500/20"
                      : "bg-red-500/10 border-red-500/20"
                  }`}
                  data-testid="indicator-pass-fail"
                >
                  {passFail === "PASS" ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500 shrink-0" />
                  )}
                  <div>
                    <p
                      className={`font-bold text-sm ${
                        passFail === "PASS" ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {passFail === "PASS" ? "PASS" : "FAIL"} — LAL Test Result
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {passFail === "PASS"
                        ? `${lalTestResult} ${resultUnit} ≤ ${
                            result.EL < 1 ? result.EL.toFixed(4) : result.EL.toFixed(2)
                          } ${resultUnit} (EL)`
                        : `${lalTestResult} ${resultUnit} > ${
                            result.EL < 1 ? result.EL.toFixed(4) : result.EL.toFixed(2)
                          } ${resultUnit} (EL) — exceeds limit`}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Formula breakdown */}
              <div className="bg-secondary/20 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Formula Breakdown
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 font-mono text-sm flex-wrap">
                  <span className="text-muted-foreground">EL</span>
                  <span className="text-muted-foreground">=</span>
                  <span className="text-primary font-bold">K</span>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-primary font-bold">M</span>
                  <span className="text-muted-foreground">=</span>
                  <span>{K}</span>
                  <span className="text-muted-foreground">/</span>
                  <span>({maxDose}/{bodyWeight}/{doseFrequency})</span>
                  <span className="text-muted-foreground">=</span>
                  <span className="text-primary font-bold">
                    {result.EL < 1 ? result.EL.toFixed(4) : result.EL.toFixed(2)}
                  </span>
                  <span className="text-xs text-muted-foreground">{resultUnit}</span>
                </div>
              </div>

              {/* Regulatory references */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-[10px] border-white/10 text-muted-foreground">
                  USP &lt;85&gt;
                </Badge>
                <Badge variant="outline" className="text-[10px] border-white/10 text-muted-foreground">
                  EP 2.6.14
                </Badge>
                <Badge variant="outline" className="text-[10px] border-white/10 text-muted-foreground">
                  ICH Q4B Annex 14
                </Badge>
                <Badge variant="outline" className="text-[10px] border-white/10 text-muted-foreground">
                  K = {K} EU/kg/hr ({route})
                </Badge>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  testId,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  testId?: string;
}) {
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
        step="any"
        min="0"
      />
    </div>
  );
}
