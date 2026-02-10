import { useUser } from "@/context/UserContext";
import { User, Shield, CreditCard, Bell, ChevronRight, LogOut } from "lucide-react";

export default function Settings() {
  const { isPro, togglePro } = useUser();

  return (
    <div className="pb-24 pt-4 md:pt-8 max-w-2xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="bg-card border border-white/10 rounded-2xl overflow-hidden mb-8">
        <div className="p-6 border-b border-white/5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-2xl font-bold font-display">
            JS
          </div>
          <div>
            <h2 className="text-xl font-bold">John Scientist</h2>
            <p className="text-sm text-muted-foreground">john.doe@science.edu</p>
          </div>
        </div>
        
        <div className="p-6 bg-gradient-to-r from-primary/10 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-primary/20 p-2 rounded-lg text-primary">
               <Shield className="w-5 h-5" />
             </div>
             <div>
               <p className="font-bold text-sm">Plan Status</p>
               <p className="text-xs text-muted-foreground">{isPro ? "Pro Member" : "Free Tier"}</p>
             </div>
          </div>
          <button 
            onClick={togglePro}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold border border-white/10 transition-colors"
          >
            {isPro ? "Manage Plan" : "Upgrade to Pro"}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-2">Preferences</h3>
        
        <div className="bg-card border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5">
          <SettingItem icon={Bell} label="Notifications" value="On" />
          <SettingItem icon={CreditCard} label="Billing" />
          <div className="p-4 flex items-center gap-4 hover:bg-white/5 cursor-pointer transition-colors group">
             <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
               <LogOut className="w-4 h-4" />
             </div>
             <span className="flex-1 font-medium text-red-500">Sign Out</span>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-12">
        BioWiki Pro v1.0.0 • Build 2024.10.25
      </p>
    </div>
  );
}

function SettingItem({ icon: Icon, label, value }: { icon: any, label: string, value?: string }) {
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
