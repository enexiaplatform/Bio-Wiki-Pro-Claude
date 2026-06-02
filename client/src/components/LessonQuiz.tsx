import { useState } from "react";
import { CheckCircle2, XCircle, RotateCcw, GraduationCap } from "lucide-react";
import clsx from "clsx";
import type { QuizQuestion } from "@/lib/content";

/** End-of-lesson multiple-choice comprehension check. */
export function LessonQuiz({ quiz }: { quiz: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!quiz?.length) return null;

  const score = quiz.reduce((n, q, i) => (answers[i] === q.answer ? n + 1 : n), 0);
  const allAnswered = quiz.every((_, i) => answers[i] !== undefined);

  function reset() {
    setAnswers({});
    setSubmitted(false);
  }

  return (
    <section className="mt-10 rounded-2xl border border-white/10 bg-card p-6 print:hidden">
      <div className="flex items-center gap-2 mb-1">
        <GraduationCap className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold">Quick check</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        {submitted ? `You scored ${score} / ${quiz.length}.` : "Test what you learned."}
      </p>

      <ol className="space-y-6">
        {quiz.map((q, qi) => (
          <li key={qi}>
            <p className="text-sm font-semibold mb-2">{qi + 1}. {q.q}</p>
            <div className="space-y-2">
              {q.options.map((opt, oi) => {
                const selected = answers[qi] === oi;
                const isCorrect = oi === q.answer;
                const showState = submitted && (selected || isCorrect);
                return (
                  <button
                    key={oi}
                    type="button"
                    disabled={submitted}
                    onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                    className={clsx(
                      "w-full text-left text-sm rounded-lg border px-3 py-2 transition-colors flex items-center justify-between gap-2",
                      !submitted && selected && "border-primary bg-primary/10",
                      !submitted && !selected && "border-white/10 hover:border-white/30",
                      submitted && isCorrect && "border-emerald-500/40 bg-emerald-500/10",
                      submitted && selected && !isCorrect && "border-red-500/40 bg-red-500/10",
                      submitted && !showState && "border-white/10 opacity-60"
                    )}
                  >
                    <span>{opt}</span>
                    {submitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {submitted && selected && !isCorrect && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6">
        {submitted ? (
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold hover:border-white/30 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Try again
          </button>
        ) : (
          <button
            onClick={() => setSubmitted(true)}
            disabled={!allAnswered}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            Check answers
          </button>
        )}
      </div>
    </section>
  );
}
