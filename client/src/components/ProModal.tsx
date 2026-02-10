import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Sparkles } from "lucide-react";
import { useUser } from "@/context/UserContext";

interface ProModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProModal({ isOpen, onClose }: ProModalProps) {
  const { togglePro } = useUser();

  const handleUpgrade = () => {
    togglePro();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-4 right-4 top-1/2 -translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:w-[500px] z-[70] bg-card border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px]" />

            <div className="relative">
              <button onClick={onClose} className="absolute top-0 right-0 text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-primary/25">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold font-display mb-2">Upgrade to Pro</h2>
                <p className="text-muted-foreground">Unlock the full scientific potential with premium access.</p>
              </div>

              <div className="space-y-4 mb-8">
                {[
                  "Unlimited access to all SOPs",
                  "Advanced calculators & tools",
                  "Detailed job insights & salary data",
                  "Priority support",
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleUpgrade}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Unlock Pro Access ($9.99/mo)
              </button>
              
              <p className="text-center text-xs text-muted-foreground mt-4">
                Mock payment - clicking this will toggle Pro mode immediately.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
