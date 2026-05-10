import { BookOpen, FileQuestion, FileSearch, NotebookPen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { VaultItem } from "@/hooks/useVault";

const icons = {
  lesson: BookOpen,
  "audit-question": FileQuestion,
  "case-study": FileSearch,
  "investigation-note": NotebookPen,
};

export function SavedItems({ items, onRemove }: { items: VaultItem[]; onRemove: (id: string) => void }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-card p-10 text-center">
        <NotebookPen className="w-10 h-10 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Your Vault is empty</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Save lessons, audit questions, case studies, and investigation notes as you work through the Microbiology Intelligence OS.
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {items.map((item) => {
        const Icon = icons[item.type];
        return (
          <article key={item.id} className="rounded-2xl border border-white/10 bg-card p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 text-primary">
                <Icon className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">{item.type.replace("-", " ")}</span>
              </div>
              <Button size="icon" variant="ghost" onClick={() => onRemove(item.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <h3 className="font-bold mb-2 leading-snug">{item.title}</h3>
            {item.source && <p className="text-xs text-primary mb-2">{item.source}</p>}
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">{item.summary}</p>
            <p className="mt-4 text-[11px] text-muted-foreground">Saved {new Date(item.savedAt).toLocaleDateString()}</p>
          </article>
        );
      })}
    </div>
  );
}
