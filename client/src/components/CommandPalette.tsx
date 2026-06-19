import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { BookOpen, FileText, Compass, Crown } from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { listContent } from "@/lib/content";

const PAGES: { label: string; path: string }[] = [
  { label: "Workflows", path: "/workflows" },
  { label: "QC Hub", path: "/qc-hub" },
  { label: "Academy", path: "/academy" },
  { label: "Library", path: "/library" },
  { label: "Tools", path: "/tools" },
  { label: "Toolkits", path: "/toolkits" },
  { label: "Compliance", path: "/compliance" },
  { label: "Career", path: "/career" },
  { label: "Solutions", path: "/solutions" },
  { label: "Insights", path: "/insights" },
  { label: "Glossary", path: "/glossary" },
  { label: "Blog", path: "/blog" },
  { label: "About", path: "/about" },
  { label: "GMP Audit Kit", path: "/toolkits/gmp-audit-kit" },
  { label: "Pricing", path: "/pricing" },
  { label: "Upgrade to Pro", path: "/upgrade" },
  { label: "My Learning", path: "/my-learning" },
  { label: "My Downloads", path: "/my-downloads" },
  { label: "Vault", path: "/vault" },
  { label: "Settings", path: "/settings" },
];

/** Global search palette (Cmd/Ctrl+K, or the header search button). */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    document.addEventListener("keydown", onKey);
    window.addEventListener("bwp:open-search", onOpen);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("bwp:open-search", onOpen);
    };
  }, []);

  const academy = listContent({ collection: "academy", lang: "en" });
  const blog = listContent({ collection: "blog", lang: "en" });

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages, lessons, articles…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Pages">
          {PAGES.map((p) => (
            <CommandItem key={p.path} value={`page ${p.label}`} onSelect={() => go(p.path)}>
              <Compass className="w-4 h-4 mr-2 text-muted-foreground" />
              {p.label}
            </CommandItem>
          ))}
        </CommandGroup>

        {academy.length > 0 && (
          <CommandGroup heading="Academy lessons">
            {academy.map((e) => (
              <CommandItem key={e.slug} value={`academy ${e.title} ${e.category}`} onSelect={() => go(`/library/${e.slug}`)}>
                {e.tier === "free" ? (
                  <BookOpen className="w-4 h-4 mr-2 text-emerald-400" />
                ) : (
                  <Crown className="w-4 h-4 mr-2 text-amber-400" />
                )}
                {e.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {blog.length > 0 && (
          <CommandGroup heading="Blog">
            {blog.map((e) => (
              <CommandItem key={e.slug} value={`blog ${e.title} ${e.category}`} onSelect={() => go(`/blog/${e.slug}`)}>
                <FileText className="w-4 h-4 mr-2 text-muted-foreground" />
                {e.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
