import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { analytics } from "@/hooks/use-analytics";

const capabilityCoverage = [
  { name: "Covered", value: 62, color: "#0f8f83" },
  { name: "Partial", value: 23, color: "#f1b84b" },
  { name: "Gap", value: 15, color: "#e86d5a" },
];

const workloadScenarios = [
  { name: "Current", value: 58 },
  { name: "Expected", value: 72 },
  { name: "Peak", value: 84 },
];

const openQuestions = [
  "Incubator capacity at peak demand",
  "Environmental monitoring scope",
  "Media preparation cadence",
];

export function HomepageModelPreview() {
  return (
    <div className="grid overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,35,50,0.09)] lg:grid-cols-[0.64fr_1.36fr]">
      <div className="border-b border-slate-200 bg-[#ecf5f2] p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-800">Inside your initial model</p>
        <h3 className="mt-3 text-2xl font-bold leading-tight text-slate-950 sm:text-3xl">Reveal what you know—and what still needs a decision.</h3>
        <p className="mt-4 text-sm leading-7 text-slate-600">Atlas turns your inputs into a readable first view of coverage, workload pressure, equipment gaps, and unresolved assumptions.</p>
        <Link href="/quality-lab/planner" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-teal-800 transition hover:text-teal-950" onClick={() => analytics.blueprintCtaClicked("home_model_preview", "planner")}>
          Build your free model <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold text-slate-950">Illustrative initial concept</p>
          <p className="text-xs leading-5 text-slate-500">Values change with your inputs and require site verification.</p>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4">
          <article className="border-b border-slate-200 p-4 sm:border-r xl:border-b-0">
            <p className="text-xs font-bold text-slate-950">Capability coverage</p>
            <div className="relative mt-3 h-32" role="img" aria-label="Illustrative capability coverage: 62 percent covered, 23 percent partial, and 15 percent gap.">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={capabilityCoverage} dataKey="value" nameKey="name" innerRadius={34} outerRadius={52} paddingAngle={1} stroke="none" isAnimationActive={false}>
                    {capabilityCoverage.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center"><span className="text-lg font-bold text-slate-950">62%</span></div>
            </div>
            <div className="space-y-1.5">
              {capabilityCoverage.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-3 text-[11px] text-slate-600">
                  <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</span>
                  <strong className="text-slate-900">{item.value}%</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="border-b border-slate-200 p-4 xl:border-b-0 xl:border-r">
            <p className="text-xs font-bold text-slate-950">Analyst workload</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">84% <span className="text-xs font-medium text-slate-500">peak</span></p>
            <div className="mt-3 h-36" role="img" aria-label="Illustrative analyst utilization: current 58 percent, expected 72 percent, and peak 84 percent, with an 80 percent planning threshold.">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workloadScenarios} layout="vertical" margin={{ top: 2, right: 4, bottom: 2, left: 0 }}>
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis type="category" dataKey="name" width={54} tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <ReferenceLine x={80} stroke="#e86d5a" strokeDasharray="3 3" />
                  <Bar dataKey="value" fill="#0f8f83" radius={[0, 4, 4, 0]} barSize={13} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] leading-4 text-slate-500"><span className="font-bold text-[#c94f3d]">Dashed line:</span> example planning threshold</p>
          </article>

          <article className="border-b border-slate-200 p-4 sm:border-r sm:border-b-0 xl:border-r">
            <p className="text-xs font-bold text-slate-950">Equipment fit</p>
            <p className="mt-5 text-[11px] uppercase tracking-[0.12em] text-slate-500">Items to confirm</p>
            <p className="mt-1 text-5xl font-bold tracking-tight text-slate-950">7</p>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden="true"><div className="h-full w-[68%] rounded-full bg-amber-400" /></div>
            <p className="mt-3 text-xs leading-5 text-slate-600">Capacity, redundancy, utilities, or qualification basis may still need evidence.</p>
          </article>

          <article className="p-4">
            <p className="text-xs font-bold text-slate-950">Top open questions</p>
            <ol className="mt-4 space-y-3">
              {openQuestions.map((question, index) => (
                <li key={question} className="grid grid-cols-[1.35rem_1fr] gap-2 text-xs leading-5 text-slate-600">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-800">{index + 1}</span>
                  <span>{question}</span>
                </li>
              ))}
            </ol>
          </article>
        </div>
      </div>
    </div>
  );
}
