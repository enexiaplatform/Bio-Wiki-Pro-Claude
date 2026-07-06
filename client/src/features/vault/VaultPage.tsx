import { useMemo, useState } from "react";
import { Filter, NotebookPen, Save, Search } from "lucide-react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useVault, type VaultItemType } from "@/hooks/useVault";
import { SavedItems } from "./SavedItems";

const all = "All";
const typeLabels: Record<VaultItemType, string> = {
  lesson: "Lessons",
  "audit-question": "Audit questions",
  "case-study": "Case studies",
  "investigation-note": "Notes",
};

export default function VaultPage() {
  const { t } = useTranslation("sections");
  const { items, removeItem, saveInvestigationNote } = useVault();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [query, setQuery] = useState("");
  const [type, setType] = useState<typeof all | VaultItemType>(all);

  const counts = useMemo(() => {
    const next: Record<VaultItemType, number> = {
      lesson: 0,
      "audit-question": 0,
      "case-study": 0,
      "investigation-note": 0,
    };
    items.forEach((item) => {
      next[item.type] += 1;
    });
    return next;
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesType = type === all || item.type === type;
      const matchesQuery =
        !q ||
        [item.title, item.summary, item.source ?? "", item.type]
          .some((value) => value.toLowerCase().includes(q));
      return matchesType && matchesQuery;
    });
  }, [items, query, type]);

  const saveNote = () => {
    if (!title.trim() || !content.trim()) return;
    saveInvestigationNote({
      id: `manual:${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      createdAt: new Date().toISOString(),
    });
    setTitle("");
    setContent("");
    setType("investigation-note");
  };

  const resetFilters = () => {
    setQuery("");
    setType(all);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-4 md:pt-8">
      <section className="mb-6 overflow-hidden rounded-lg border border-teal-400/20 bg-gradient-to-br from-teal-500/12 via-white/[0.045] to-emerald-500/10 p-6 shadow-xl shadow-black/15 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/25 bg-teal-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">
              <NotebookPen className="h-3.5 w-3.5" />
              {t("vault.eyebrow")}
            </span>
            <h1 className="mt-5 max-w-3xl font-display text-3xl font-bold leading-tight md:text-5xl">
              {t("vault.title")}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {t("vault.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-white/10 bg-background/35 p-4">
              <p className="text-2xl font-bold text-teal-200">{items.length}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">Saved</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-background/35 p-4">
              <p className="text-2xl font-bold text-teal-200">{counts["audit-question"]}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">Audit Qs</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-background/35 p-4">
              <p className="text-2xl font-bold text-teal-200">{counts["investigation-note"]}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">Notes</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-6 rounded-lg border border-white/10 bg-white/[0.035] p-5 shadow-lg shadow-black/10 md:p-6">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">Quick capture</p>
            <h2 className="mt-2 text-xl font-bold">{t("vault.saveHeading")}</h2>
          </div>
          <p className="max-w-xl text-sm text-muted-foreground">
            Capture an investigation thought, then filter it with saved lessons and audit prompts.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-[280px_1fr_auto] md:items-start">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={t("vault.noteTitle")}
            className="rounded-lg border border-white/10 bg-background/65 px-3 py-3 text-sm outline-none transition focus:border-teal-400/45 focus:ring-2 focus:ring-teal-400/20"
          />
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={t("vault.notePlaceholder")}
            className="min-h-24 rounded-lg border border-white/10 bg-background/65 px-3 py-3 text-sm outline-none transition focus:border-teal-400/45 focus:ring-2 focus:ring-teal-400/20"
          />
          <Button onClick={saveNote} disabled={!title.trim() || !content.trim()} className="md:mt-0">
            <Save className="h-4 w-4" />
            {t("vault.save")}
          </Button>
        </div>
      </section>

      <section className="mb-6 rounded-lg border border-white/10 bg-white/[0.035] p-3 shadow-lg shadow-black/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search saved items..."
            className="w-full rounded-lg border border-white/10 bg-background/65 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-teal-400/45 focus:ring-2 focus:ring-teal-400/20"
          />
        </div>

        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-muted-foreground sm:inline-flex">
            <Filter className="h-3.5 w-3.5" />
            Type
          </span>
          {[all, ...Object.keys(typeLabels)].map((item) => (
            <button
              key={item}
              onClick={() => setType(item as typeof all | VaultItemType)}
              className={clsx(
                "shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors",
                item === type
                  ? "border-teal-400 bg-teal-400 text-teal-950"
                  : "border-white/10 bg-white/5 text-muted-foreground hover:border-teal-400/40 hover:text-foreground",
              )}
            >
              {item === all ? all : typeLabels[item as VaultItemType]}
              {item !== all && <span className="ml-1 opacity-70">({counts[item as VaultItemType]})</span>}
            </button>
          ))}
        </div>
      </section>

      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{filteredItems.length} of {items.length} saved items shown</p>
        {(query || type !== all) && (
          <button
            onClick={resetFilters}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold transition-colors hover:border-teal-400/40"
          >
            Reset
          </button>
        )}
      </div>

      <SavedItems items={filteredItems} totalCount={items.length} onRemove={removeItem} onResetFilters={resetFilters} />
    </div>
  );
}
