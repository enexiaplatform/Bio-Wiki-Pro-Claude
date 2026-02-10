import { useJobs } from "@/hooks/use-data";
import { useUser } from "@/context/UserContext";
import { MapPin, Building, DollarSign, Clock, Filter, Lock } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { ProModal } from "@/components/ProModal";

export default function Career() {
  const { data: jobs, isLoading } = useJobs();
  const { isPro } = useUser();
  const [filter, setFilter] = useState("All");
  const [showProModal, setShowProModal] = useState(false);

  const filteredJobs = filter === "All" ? jobs : jobs?.filter(j => j.domain === filter);
  const domains = ["All", "QC", "QA", "RA", "Manufacturing"];

  return (
    <div className="pb-24 pt-4 md:pt-8 max-w-4xl mx-auto px-4">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Career Hub</h1>
          <p className="text-muted-foreground">Find your next role in biotech.</p>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide md:pb-0">
          {domains.map(d => (
            <button
              key={d}
              onClick={() => setFilter(d)}
              className={clsx(
                "px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap border transition-all",
                filter === d
                  ? "bg-white text-background border-white font-bold"
                  : "bg-card text-muted-foreground border-border hover:border-white/20"
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        {/* Vertical Timeline Line (Desktop only) */}
        <div className="hidden md:block absolute left-8 top-0 bottom-0 w-px bg-white/10" />

        <div className="space-y-6">
          {isLoading ? (
            [1, 2, 3].map(i => <div key={i} className="h-32 bg-card/50 animate-pulse rounded-2xl" />)
          ) : (
            filteredJobs?.map((job, idx) => {
              // Hide salary for non-pro users on certain jobs to upsell
              const isSalaryLocked = !isPro && idx % 2 !== 0; 

              return (
                <div key={job.id} className="relative md:pl-20">
                   {/* Timeline Dot */}
                   <div className="hidden md:flex absolute left-6 top-6 w-4 h-4 rounded-full bg-background border-2 border-white/20 z-10 items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                   </div>

                  <div className="bg-card border border-white/10 rounded-2xl p-6 hover:border-primary/30 transition-all group">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{job.title}</h3>
                          <span className="text-[10px] uppercase font-bold tracking-wider bg-white/5 px-2 py-0.5 rounded text-muted-foreground">
                            {job.level}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Building className="w-3.5 h-3.5" />
                            {job.company}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {job.location}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-sm font-medium bg-secondary/50 px-3 py-1.5 rounded-lg border border-white/5 self-start">
                        <DollarSign className="w-3.5 h-3.5 text-green-400" />
                        {isSalaryLocked ? (
                          <button onClick={() => setShowProModal(true)} className="flex items-center gap-1 text-muted-foreground hover:text-white">
                            <span className="blur-sm select-none">$100k - $120k</span>
                            <Lock className="w-3 h-3 ml-1" />
                          </button>
                        ) : (
                          <span className="text-green-400">{job.salaryRange}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.requiredSkills.map(skill => (
                        <span key={skill} className="text-xs bg-white/5 px-2.5 py-1 rounded-md text-muted-foreground border border-white/5">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        Posted {job.postedAt}
                      </div>
                      <button className="text-sm font-bold text-primary hover:underline">
                        Apply Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <ProModal isOpen={showProModal} onClose={() => setShowProModal(false)} />
    </div>
  );
}
