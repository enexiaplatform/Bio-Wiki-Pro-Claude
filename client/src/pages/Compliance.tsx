import { useSOPs } from "@/hooks/use-data";
import { useUser } from "@/context/UserContext";
import { Lock, FileText, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ProModal } from "@/components/ProModal";
import clsx from "clsx";

export default function Compliance() {
  const { data: sops, isLoading } = useSOPs();
  const { isPro } = useUser();
  const [showProModal, setShowProModal] = useState(false);
  const [expandedSop, setExpandedSop] = useState<string | null>(null);

  const toggleSop = (id: string, isLocked: boolean) => {
    if (isLocked && !isPro) {
      setShowProModal(true);
      return;
    }
    setExpandedSop(expandedSop === id ? null : id);
  };

  return (
    <div className="pb-24 pt-4 md:pt-8 max-w-4xl mx-auto px-4">
       <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Compliance</h1>
          <p className="text-muted-foreground">Standard Operating Procedures & Guidelines.</p>
        </div>
        {!isPro && (
          <button 
            onClick={() => setShowProModal(true)}
            className="hidden md:flex text-sm font-bold text-primary hover:text-primary/80 transition-colors"
          >
            Unlock All SOPs
          </button>
        )}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [1, 2, 3].map(i => <div key={i} className="h-24 bg-card/50 animate-pulse rounded-2xl" />)
        ) : (
          sops?.map((sop) => {
            const isLocked = sop.isLocked && !isPro;
            const isExpanded = expandedSop === sop.id;

            return (
              <motion.div
                key={sop.id}
                layout
                onClick={() => toggleSop(sop.id, isLocked)}
                className={clsx(
                  "bg-card border rounded-2xl overflow-hidden cursor-pointer transition-colors relative group",
                  isLocked ? "border-white/5 opacity-80" : "border-white/10 hover:border-primary/30"
                )}
              >
                <div className="p-5 flex items-start gap-4">
                  <div className={clsx(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    isLocked ? "bg-white/5 text-muted-foreground" : "bg-primary/10 text-primary"
                  )}>
                    {isLocked ? <Lock className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className={clsx("font-bold text-lg truncate pr-4", isLocked && "text-muted-foreground")}>
                        {sop.title}
                      </h3>
                      {isLocked && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-white/5 px-2 py-1 rounded text-muted-foreground">
                          Pro
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{sop.summary}</p>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && !isLocked && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/5"
                    >
                      <div className="p-6 bg-black/20">
                        <div className="prose prose-invert max-w-none prose-sm">
                          <p className="whitespace-pre-wrap">{sop.content}</p>
                        </div>
                        <div className="mt-6 flex justify-end">
                           <button className="flex items-center gap-2 text-sm text-green-400 bg-green-400/10 px-4 py-2 rounded-lg hover:bg-green-400/20 transition-colors">
                            <CheckCircle className="w-4 h-4" />
                            Mark as Read
                           </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Locked State UI */}
                {isLocked && (
                  <div className="absolute inset-0 bg-background/60 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                      <Lock className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="font-bold text-lg mb-1">Premium Content</h4>
                    <p className="text-sm text-muted-foreground mb-4">Upgrade to BioWiki Pro to unlock full SOP guidelines and compliance tools.</p>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowProModal(true);
                      }}
                      className="bg-primary text-primary-foreground px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                    >
                      Unlock Now
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      <ProModal isOpen={showProModal} onClose={() => setShowProModal(false)} />
    </div>
  );
}
