import { Link } from "wouter";
import { ArrowUpRight, FlaskConical } from "lucide-react";

const footerGroups = [
  {
    title: "Products",
    links: [
      { label: "All products", href: "/products" },
      { label: "Quality Lab Blueprint", href: "/quality-lab" },
      { label: "Atlas Pro", href: "/pro" },
      { label: "Career Blueprint", href: "/career" },
    ],
  },
  {
    title: "Quality Lab",
    links: [
      { label: "How the project works", href: "/quality-lab/how-it-works" },
      { label: "Blueprint deliverables", href: "/quality-lab/deliverables" },
      { label: "Sample Blueprint", href: "/quality-lab/sample" },
      { label: "Build the free model", href: "/quality-lab/planner" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Evidence library", href: "/academy" },
      { label: "Workflows", href: "/workflows" },
      { label: "Decision tools", href: "/tools" },
      { label: "Toolkits", href: "/toolkits" },
      { label: "Compliance", href: "/compliance" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "How Atlas works", href: "/how-it-works" },
      { label: "Pricing", href: "/pricing" },
      { label: "About", href: "/about" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "mailto:support@lifescienceatlas.com", external: true },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[#071426] text-slate-100">
      <div className="mx-auto max-w-7xl px-5 pb-28 pt-12 md:px-6 md:pb-10 md:pt-14">
        <div className="grid gap-10 border-b border-white/10 pb-10 lg:grid-cols-[1.1fr_1.9fr] lg:gap-16">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-3 transition hover:opacity-85">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal-300/20 bg-teal-300/[0.08]">
                <FlaskConical className="h-5 w-5 text-teal-300" />
              </span>
              <span className="font-display text-lg font-bold">Life Science <span className="text-teal-300">Atlas</span></span>
            </Link>
            <p className="mt-5 text-sm leading-7 text-slate-400">Decision intelligence for quality laboratories serving regulated manufacturing.</p>
            <a href="mailto:support@lifescienceatlas.com" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-200 transition hover:text-teal-100">
              support@lifescienceatlas.com <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>

          <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-4">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-200">{group.title}</h2>
                <ul className="mt-4 space-y-3">
                  {group.links.map((item) => (
                    <li key={item.label}>
                      {item.external ? (
                        <a href={item.href} className="text-sm text-slate-400 transition hover:text-teal-200">{item.label}</a>
                      ) : (
                        <Link href={item.href} className="text-sm text-slate-400 transition hover:text-teal-200">{item.label}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-4 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Life Science Atlas. Planning support, not regulatory approval.</p>
          <div className="flex items-center gap-5">
            <Link href="/terms" className="transition hover:text-slate-300">Terms</Link>
            <Link href="/privacy" className="transition hover:text-slate-300">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
