import { Link } from "wouter";
import { ArrowRight, BookOpen, FileQuestion, FileSearch, NotebookPen, SearchX, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { VaultItem, VaultItemType } from "@/hooks/useVault";

const icons: Record<VaultItemType, typeof BookOpen> = {
  lesson: BookOpen,
  "audit-question": FileQuestion,
  "case-study": FileSearch,
  "investigation-note": NotebookPen,
};

export function SavedItems({
  items,
  totalCount,
  onRemove,
  onResetFilters,
}: {
  items: VaultItem[];
  totalCount: number;
  onRemove: (id: string) => void;
  onResetFilters: () => void;
}) {
  if (totalCount === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/[0.035] p-10 text-center shadow-lg shadow-black/10">
        <NotebookPen className="mx-auto mb-4 h-10 w-10 text-teal-300" />
        <h2 className="text-xl font-bold">Your Vault is empty</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          Save lessons, audit questions, case studies, and investigation notes as you work through Life Science Atlas.
        </p>
        <Link
          href="/academy"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-teal-400 px-4 py-2 text-sm font-bold text-teal-950 transition-colors hover:bg-teal-300"
        >
          <BookOpen className="h-4 w-4" />
          Browse Academy
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.035] p-10 text-center">
        <SearchX className="mx-auto mb-4 h-10 w-10 text-muted-foreground/50" />
        <h2 className="text-xl font-bold">No saved items match this view</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          Try another item type or search for a broader phrase.
        </p>
        <button
          onClick={onResetFilters}
          className="mt-5 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold transition-colors hover:border-teal-400/40"
        >
          Reset filters
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => {
        const Icon = icons[item.type];
        return (
          <article key={item.id} className="rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-lg shadow-black/10 transition-colors hover:border-teal-400/35">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-teal-300">
                <Icon className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-[0.16em]">{item.type.replace("-", " ")}</span>
              </div>
              <Button size="icon" variant="ghost" onClick={() => onRemove(item.id)} aria-label="Remove from vault">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <h3 className="mb-2 leading-snug font-bold">{item.title}</h3>
            {item.source && <p className="mb-2 text-xs font-semibold text-teal-300">{item.source}</p>}
            <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">{item.summary}</p>
            <p className="mt-4 text-[11px] text-muted-foreground">Saved {new Date(item.savedAt).toLocaleDateString()}</p>
          </article>
        );
      })}
    </div>
  );
}
