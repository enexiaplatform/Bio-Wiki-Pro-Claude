import { useUser } from "@/context/UserContext";
import { Shield, CreditCard, Bell, ChevronRight, LogOut, LogIn, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

export default function Settings() {
  const { user, isAuthenticated, isPro, togglePro, isTogglingPro, logout } = useUser();
  const [, setLocation] = useLocation();

  return (
    <div className="pb-24 pt-4 md:pt-8 max-w-2xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="bg-card border border-white/10 rounded-2xl overflow-hidden mb-8">
        {isAuthenticated && user ? (
          <div className="p-6 border-b border-white/5 flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.profileImageUrl ?? undefined} alt={user.firstName ?? "User"} />
              <AvatarFallback className="text-2xl font-bold font-display bg-primary/10 text-primary">
                {user.firstName?.[0] ?? user.email?.[0]?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold" data-testid="text-settings-name">
                  {[user.firstName, user.lastName].filter(Boolean).join(" ") || "User"}
                </h2>
                {isPro && (
                  <Badge className="bg-primary/10 text-primary border-primary/20" data-testid="badge-settings-pro">
                    <Crown className="w-3 h-3 mr-1" /> Pro
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground" data-testid="text-settings-email">{user.email ?? "No email"}</p>
            </div>
          </div>
        ) : (
          <div className="p-6 border-b border-white/5 text-center">
            <p className="text-muted-foreground mb-4">Sign in to access your account settings.</p>
            <Button asChild data-testid="button-settings-login">
              <a href="/api/login">
                <LogIn className="w-4 h-4 mr-1.5" />
                Sign In
              </a>
            </Button>
          </div>
        )}
        
        <div className="p-6 bg-gradient-to-r from-primary/10 to-transparent flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-lg text-primary">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">Plan Status</p>
              <p className="text-xs text-muted-foreground">{isPro ? "Pro Member" : "Free Tier"}</p>
            </div>
          </div>
          {isAuthenticated ? (
            <Button
              variant="outline"
              size="sm"
              onClick={isPro ? () => togglePro() : () => setLocation("/upgrade")}
              disabled={isTogglingPro}
              data-testid="button-settings-plan"
            >
              {isPro ? "Manage Plan" : "Upgrade to Pro"}
            </Button>
          ) : (
            <Button variant="outline" size="sm" asChild data-testid="button-settings-upgrade-login">
              <a href="/api/login">Sign In to Upgrade</a>
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-2">Preferences</h3>
        
        <div className="bg-card border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5">
          <SettingItem icon={Bell} label="Notifications" value="On" />
          <SettingItem icon={CreditCard} label="Billing" />
          {isAuthenticated && (
            <div
              onClick={logout}
              className="p-4 flex items-center gap-4 hover:bg-white/5 cursor-pointer transition-colors group"
              data-testid="button-settings-logout"
            >
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="flex-1 font-medium text-red-500">Sign Out</span>
            </div>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-12">
        BioWiki Pro v1.0.0
      </p>
    </div>
  );
}

function SettingItem({ icon: Icon, label, value }: { icon: any; label: string; value?: string }) {
  return (
    <div className="p-4 flex items-center gap-4 hover:bg-white/5 cursor-pointer transition-colors group">
      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
        <Icon className="w-4 h-4" />
      </div>
      <span className="flex-1 font-medium">{label}</span>
      {value && <span className="text-sm text-muted-foreground mr-2">{value}</span>}
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </div>
  );
}
