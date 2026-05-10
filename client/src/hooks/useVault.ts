import { useCallback, useEffect, useMemo, useState } from "react";
import type { AuditQuestion, CaseStudy, Lesson } from "@/types/lesson";
import type { InvestigationNote } from "@/types/investigation";

export type VaultItemType = "lesson" | "audit-question" | "case-study" | "investigation-note";

export interface VaultItem {
  id: string;
  type: VaultItemType;
  title: string;
  source?: string;
  summary: string;
  payload: Lesson | AuditQuestion | CaseStudy | InvestigationNote;
  savedAt: string;
}

const VAULT_KEY = "biowiki-vault-lite";

function readVault(): VaultItem[] {
  try {
    const raw = window.localStorage.getItem(VAULT_KEY);
    return raw ? (JSON.parse(raw) as VaultItem[]) : [];
  } catch {
    return [];
  }
}

export function useVault() {
  const [items, setItems] = useState<VaultItem[]>([]);

  useEffect(() => {
    setItems(readVault());
  }, []);

  useEffect(() => {
    window.localStorage.setItem(VAULT_KEY, JSON.stringify(items));
  }, [items]);

  const saveItem = useCallback((item: Omit<VaultItem, "savedAt">) => {
    setItems((current) => {
      const nextItem = { ...item, savedAt: new Date().toISOString() };
      return [nextItem, ...current.filter((existing) => existing.id !== item.id)];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const isSaved = useCallback((id: string) => items.some((item) => item.id === id), [items]);

  const saveLesson = useCallback((lesson: Lesson) => {
    saveItem({
      id: `lesson:${lesson.id}`,
      type: "lesson",
      title: lesson.title,
      source: lesson.category,
      summary: lesson.summary,
      payload: lesson,
    });
  }, [saveItem]);

  const saveAuditQuestion = useCallback((question: AuditQuestion, source: string) => {
    saveItem({
      id: `audit:${source}:${question.question}`,
      type: "audit-question",
      title: question.question,
      source,
      summary: question.strongAnswer,
      payload: question,
    });
  }, [saveItem]);

  const saveCaseStudy = useCallback((caseStudy: CaseStudy, source: string) => {
    saveItem({
      id: `case:${source}`,
      type: "case-study",
      title: caseStudy.scenario,
      source,
      summary: caseStudy.lessonLearned,
      payload: caseStudy,
    });
  }, [saveItem]);

  const saveInvestigationNote = useCallback((note: InvestigationNote) => {
    saveItem({
      id: `note:${note.id}`,
      type: "investigation-note",
      title: note.title,
      source: "Investigation Note",
      summary: note.content,
      payload: note,
    });
  }, [saveItem]);

  return useMemo(() => ({
    items,
    isSaved,
    removeItem,
    saveLesson,
    saveAuditQuestion,
    saveCaseStudy,
    saveInvestigationNote,
  }), [items, isSaved, removeItem, saveLesson, saveAuditQuestion, saveCaseStudy, saveInvestigationNote]);
}
