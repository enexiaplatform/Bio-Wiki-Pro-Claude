import { useMemo, useState } from "react";
import { Filter, Search } from "lucide-react";
import { auditQuestionBank } from "@/data/compliance/auditBank";
import { useVault } from "@/hooks/useVault";
import { StrongAnswerCard } from "./StrongAnswerCard";

const all = "All";

export function AuditQuestionBank() {
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState(all);
  const { saveAuditQuestion } = useVault();

  const topics = useMemo(() => [all, ...Array.from(new Set(auditQuestionBank.map((question) => question.topic)))], []);
  const filtered = auditQuestionBank.filter((question) => {
    const query = search.trim().toLowerCase();
    const matchesTopic = topic === all || question.topic === topic;
    const matchesSearch = !query || [question.question, question.strongAnswer, question.weakAnswer, question.topic].some((value) => value.toLowerCase().includes(query));
    return matchesTopic && matchesSearch;
  });

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5 shadow-lg shadow-black/10 md:p-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">Practice bank</p>
          <h2 className="mt-2 text-2xl font-bold">Audit Question Bank</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Practice weak-versus-strong answers with evidence needed for GMP inspection readiness.
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-background/45 px-4 py-3">
          <p className="text-sm font-bold">{filtered.length} shown</p>
          <p className="mt-1 text-xs text-muted-foreground">{auditQuestionBank.length} total questions</p>
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-white/10 bg-background/35 p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search audit questions..."
            className="w-full rounded-lg border border-white/10 bg-background/65 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-teal-400/45 focus:ring-2 focus:ring-teal-400/20"
          />
        </div>

        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-muted-foreground sm:inline-flex">
            <Filter className="h-3.5 w-3.5" />
            Topic
          </span>
          {topics.map((item) => (
            <button
              key={item}
              onClick={() => setTopic(item)}
              className={
                item === topic
                  ? "shrink-0 rounded-full border border-teal-400 bg-teal-400 px-4 py-1.5 text-xs font-bold text-teal-950"
                  : "shrink-0 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-teal-400/40 hover:text-foreground"
              }
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((question) => (
            <StrongAnswerCard key={question.id} question={question} onSave={() => saveAuditQuestion(question, question.topic)} />
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-white/15 bg-background/35 p-8 text-center">
            <p className="font-semibold">No audit questions match this search.</p>
            <p className="mt-2 text-sm text-muted-foreground">Clear the filters or try a broader evidence term.</p>
            <button
              onClick={() => {
                setSearch("");
                setTopic(all);
              }}
              className="mt-4 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold transition-colors hover:border-teal-400/40"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
