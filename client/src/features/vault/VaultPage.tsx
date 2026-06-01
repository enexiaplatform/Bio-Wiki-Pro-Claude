import { useState } from "react";
import { NotebookPen, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useVault } from "@/hooks/useVault";
import { SavedItems } from "./SavedItems";

export default function VaultPage() {
  const { t } = useTranslation("sections");
  const { items, removeItem, saveInvestigationNote } = useVault();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

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
  };

  return (
    <div className="pb-24 pt-4 md:pt-8 max-w-6xl mx-auto px-4">
      <section className="mb-8 rounded-2xl border border-white/10 bg-card p-5 md:p-7 shadow-xl shadow-black/10">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-primary/10 text-primary items-center justify-center">
            <NotebookPen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">{t("vault.eyebrow")}</p>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{t("vault.title")}</h1>
            <p className="text-muted-foreground max-w-3xl leading-relaxed">
              {t("vault.subtitle")}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-card p-5 md:p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">{t("vault.saveHeading")}</h2>
        <div className="grid md:grid-cols-[280px_1fr_auto] gap-3 items-start">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={t("vault.noteTitle")}
            className="rounded-xl border border-white/10 bg-background/50 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={t("vault.notePlaceholder")}
            className="min-h-24 rounded-xl border border-white/10 bg-background/50 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
          <Button onClick={saveNote} disabled={!title.trim() || !content.trim()} className="md:mt-0">
            <Save className="w-4 h-4" />
            {t("vault.save")}
          </Button>
        </div>
      </section>

      <SavedItems items={items} onRemove={removeItem} />
    </div>
  );
}
