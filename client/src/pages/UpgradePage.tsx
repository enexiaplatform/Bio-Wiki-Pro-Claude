import { useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, FlaskConical, BookOpen, ShieldCheck, Sparkles, TrendingUp, Briefcase } from "lucide-react";
import { useLocation } from "wouter";

const benefits = [
  { icon: ShieldCheck, title: "Full Compliance Library", desc: "Access all 18 SOPs with detailed procedures and regulatory references." },
  { icon: FlaskConical, title: "Advanced QC Workflows", desc: "Deep-dive into sterility testing, environmental monitoring, and bioburden protocols." },
  { icon: BookOpen, title: "Complete Academy", desc: "Unlock all learning paths with advanced and expert-level content." },
  { icon: TrendingUp, title: "Industry Insights", desc: "Sales intelligence, market trends, and competitive analysis reports." },
  { icon: Briefcase, title: "Career Toolkit", desc: "Priority job alerts, resume templates, and interview prep guides." },
  { icon: Sparkles, title: "Early Access", desc: "Be the first to try new lab tools and calculators as they launch." },
];

export default function UpgradePage() {
  const { isAuthenticated, isPro, togglePro, isTogglingPro } = useUser();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isPro) {
      setLocation("/qc-hub");
    }
  }, [isPro, setLocation]);

  return (
    <div className="pb-24 pt-4 md:pt-8 max-w-4xl mx-auto px-4">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
          <Crown className="w-4 h-4" />
          <span className="text-sm font-bold uppercase tracking-wider">Upgrade Required</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          Unlock the Full Power of<br />
          <span className="text-primary">BioWiki Pro</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Get unlimited access to premium content, advanced workflows, and professional tools designed for biotech and pharma professionals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {benefits.map((b) => (
          <Card key={b.title} className="p-5 border-white/5">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
              <b.icon className="w-5 h-5" />
            </div>
            <h3 className="font-bold mb-1.5">{b.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
          </Card>
        ))}
      </div>

      <Card className="p-8 text-center border-primary/20 bg-primary/5">
        <Badge className="mb-4 bg-primary text-white">Most Popular</Badge>
        <h2 className="text-2xl font-bold mb-2">BioWiki Pro</h2>
        <p className="text-muted-foreground mb-6">Everything you need to accelerate your biotech career.</p>

        <div className="space-y-3 max-w-sm mx-auto mb-8 text-left">
          {["All premium content unlocked", "Full SOP library access", "Advanced lab tools", "Priority support", "New features first"].map((item) => (
            <div key={item} className="flex items-center gap-3 text-sm">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-primary" />
              </div>
              <span>{item}</span>
            </div>
          ))}
        </div>

        {isAuthenticated ? (
          <Button
            size="lg"
            className="w-full max-w-sm font-bold text-base"
            onClick={togglePro}
            disabled={isTogglingPro}
            data-testid="button-upgrade-now"
          >
            <Crown className="w-5 h-5 mr-2" />
            {isTogglingPro ? "Upgrading..." : "Upgrade Now"}
          </Button>
        ) : (
          <Button
            size="lg"
            className="w-full max-w-sm font-bold text-base"
            asChild
            data-testid="button-login-to-upgrade"
          >
            <a href="/api/login">
              Sign In to Upgrade
            </a>
          </Button>
        )}
      </Card>
    </div>
  );
}
