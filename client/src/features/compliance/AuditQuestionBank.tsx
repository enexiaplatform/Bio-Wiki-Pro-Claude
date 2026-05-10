import { useMemo, useState } from "react";
import { Search } from "lucide-react";
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
    <section className="rounded-2xl border border-white/10 bg-card p-5 md:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-bold mb-2">Audit Question Bank</h2>
        <p className="text-sm text-muted-foreground">Practice weak-versus-strong answers with evidence needed for GMP inspection readiness.</p>
      </div>

      <div className="space-y-3 mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search audit questions..."
            className="w-full rounded-xl border border-white/10 bg-background/50 py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {topics.map((item) => (
            <button
              key={item}
              onClick={() => setTopic(item)}
              className={item === topic ? "shrink-0 rounded-full border border-primary bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground" : "shrink-0 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary/40"}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((question) => (
          <StrongAnswerCard key={question.id} question={question} onSave={() => saveAuditQuestion(question, question.topic)} />
        ))}
      </div>
    </section>
  );
}
