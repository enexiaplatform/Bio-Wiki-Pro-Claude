import { BookmarkPlus, ChevronLeft, Clock, Target } from "lucide-react";
import { Link, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { getLessonById } from "@/data/lessons/microbiologyLessons";
import { useVault } from "@/hooks/useVault";
import { AuditQuestionCard } from "./AuditQuestionCard";
import { CaseStudyBlock } from "./CaseStudyBlock";
import { DirectorLensCard } from "./DirectorLensCard";
import { useSEO } from "@/hooks/use-seo";

export default function LessonDetailPage() {
  const [, params] = useRoute("/academy/:lessonId");
  const lesson = params?.lessonId ? getLessonById(params.lessonId) : undefined;
  const { saveLesson, saveAuditQuestion, saveCaseStudy } = useVault();
  useSEO({
    title: lesson ? `${lesson.title} — Academy BioWikiPro` : "Academy — BioWikiPro",
    description: lesson ? lesson.summary : "In-depth GMP microbiology lessons for QC/QA Pharma professionals.",
  });

  if (!lesson) {
    return (
      <div className="pb-24 pt-16 max-w-3xl mx-auto px-4 text-center">
        <h1 className="text-2xl font-bold mb-3">Lesson not found</h1>
        <p className="text-muted-foreground mb-6">This Academy lesson does not exist in the Microbiology Intelligence library yet.</p>
        <Button asChild>
          <Link href="/academy">Back to Academy</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-4 md:pt-8 max-w-5xl mx-auto px-4">
      <Button asChild variant="ghost" size="sm" className="mb-5 -ml-2">
        <Link href="/academy">
          <ChevronLeft className="w-4 h-4" />
          Back to Academy
        </Link>
      </Button>

      <section className="rounded-2xl border border-white/10 bg-card p-5 md:p-8 shadow-xl shadow-black/10 mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{lesson.category}</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground">{lesson.level}</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {lesson.estimatedMinutes} min
          </span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-display font-bold mb-4">{lesson.title}</h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">{lesson.subtitle}</p>
          </div>
          <Button variant="outline" onClick={() => saveLesson(lesson)} className="hidden sm:inline-flex">
            <BookmarkPlus className="w-4 h-4" />
            Save
          </Button>
        </div>
        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{lesson.summary}</p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-card p-5 md:p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Learning Goals</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {lesson.learningGoals.map((goal) => (
            <div key={goal} className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
              {goal}
            </div>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold mb-4">Key Concepts</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {lesson.keyConcepts.map((concept) => (
            <article key={concept.title} className="rounded-2xl border border-white/10 bg-card p-5">
              <h3 className="font-bold mb-2">{concept.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{concept.explanation}</p>
              <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 mb-3">
                <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Why It Matters</p>
                <p className="text-sm">{concept.whyItMatters}</p>
              </div>
              <div className="rounded-xl bg-red-500/5 border border-red-500/15 p-3">
                <p className="text-xs font-bold uppercase tracking-wider text-red-300 mb-1">Common Mistake</p>
                <p className="text-sm text-muted-foreground">{concept.commonMistake}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="space-y-6">
        <DirectorLensCard lens={lesson.directorLens} />
        <CaseStudyBlock caseStudy={lesson.caseStudy} onSave={() => saveCaseStudy(lesson.caseStudy, lesson.title)} />

        <section>
          <h2 className="text-xl font-bold mb-4">Audit Questions</h2>
          <div className="space-y-4">
            {lesson.auditQuestions.map((question) => (
              <AuditQuestionCard key={question.question} question={question} onSave={() => saveAuditQuestion(question, lesson.title)} />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-card p-5">
          <h2 className="text-xl font-bold mb-4">Related Tools</h2>
          <div className="flex flex-wrap gap-2">
            {lesson.relatedTools.map((tool) => (
              <Link key={tool} href="/tools" className="rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground">
                {tool}
              </Link>
            ))}
          </div>
        </section>

        {/* GMP Kit upsell CTA */}
        <section className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 mt-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Level up your knowledge</p>
              <h3 className="text-lg font-bold mb-1">GMP Audit Survival Kit — $59</h3>
              <p className="text-sm text-muted-foreground">Full 40-page guide, 10 CAPA templates, 50+ audit Q&amp;A scripts, SOP Gap Analysis Excel. Ready to use in your next audit.</p>
            </div>
            <Link href="/toolkits/gmp-audit-kit" className="shrink-0 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition-colors whitespace-nowrap">
              View details →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
