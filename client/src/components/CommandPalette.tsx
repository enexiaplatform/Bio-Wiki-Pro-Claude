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
import { TOOL_CATALOG } from "@/data/tools/catalog";

const PAGES: { label: string; path: string }[] = [
  { label: "Workflows", path: "/workflows" },
  { label: "Learn", path: "/academy" },
  { label: "Tools", path: "/tools" },
  { label: "Toolkits", path: "/toolkits" },
  { label: "Compliance", path: "/compliance" },
  { label: "Career", path: "/career" },
  { label: "Glossary", path: "/glossary" },
  { label: "Blog", path: "/blog" },
  { label: "About", path: "/about" },
  { label: "GMP Audit Kit", path: "/toolkits/gmp-audit-kit" },
  { label: "Pricing", path: "/pricing" },
  { label: "Upgrade to Pro", path: "/upgrade" },
  { label: "Pro Monthly Quality Review", path: "/pro/monthly-review" },
  { label: "My Learning", path: "/my-learning" },
  { label: "My Downloads", path: "/my-downloads" },
  { label: "Vault", path: "/vault" },
  { label: "Settings", path: "/settings" },
];

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Global search palette (Cmd/Ctrl+K, or the header search button). */
export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [, navigate] = useLocation();

  const academy = listContent({ collection: "academy", lang: "en" });
  const blog = listContent({ collection: "blog", lang: "en" });

  const go = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
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

        <CommandGroup heading="Tools">
          {TOOL_CATALOG.map((tool) => (
            <CommandItem
              key={tool.slug}
              value={`tool ${tool.title} ${tool.category} ${tool.blurb}`}
              onSelect={() => go(`/tools/${tool.slug}`)}
            >
              <Compass className="w-4 h-4 mr-2 text-teal-400" />
              {tool.title}
            </CommandItem>
          ))}
        </CommandGroup>

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
