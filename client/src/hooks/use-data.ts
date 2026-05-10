import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertQuoteRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// ============================================
// DATA HOOKS
// ============================================

// Mock Data Loaders (Simulating API calls for static data)
import { academyData, importedAcademyEntries, jobsData, sopsData, solutionsData, labToolsData, skillsData } from "@/data/mockData";
import { SOP, Job, Product, Term, LabTool, Skill, AcademyEntry } from "@shared/schema";

export function useAcademyTerms() {
  return useQuery({
    queryKey: ["academy-terms"],
    queryFn: async (): Promise<Term[]> => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return academyData;
    },
  });
}

export function useImportedAcademyEntries() {
  return useQuery({
    queryKey: ["imported-academy-entries"],
    queryFn: async (): Promise<AcademyEntry[]> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return importedAcademyEntries;
    },
  });
}

export function useJobs() {
  return useQuery({
    queryKey: ["jobs"],
    queryFn: async (): Promise<Job[]> => {
      await new Promise(resolve => setTimeout(resolve, 600));
      return jobsData;
    },
  });
}

export function useSOPs() {
  return useQuery({
    queryKey: ["sops"],
    queryFn: async (): Promise<SOP[]> => {
      await new Promise(resolve => setTimeout(resolve, 400));
      return sopsData;
    },
  });
}

export function useSolutions() {
  return useQuery({
    queryKey: ["solutions"],
    queryFn: async (): Promise<Product[]> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return solutionsData;
    },
  });
}

export function useLabTools() {
  return useQuery({
    queryKey: ["lab-tools"],
    queryFn: async (): Promise<LabTool[]> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return labToolsData;
    },
  });
}

export function useSkills() {
  return useQuery({
    queryKey: ["skills"],
    queryFn: async (): Promise<Skill[]> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return skillsData;
    },
  });
}

// ============================================
// MUTATIONS
// ============================================

export function useCreateQuoteRequest() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: InsertQuoteRequest) => {
      const res = await fetch(api.quoteRequests.create.path, {
        method: api.quoteRequests.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to submit quote request");
      }
      return api.quoteRequests.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      toast({
        title: "Quote Requested",
        description: "We'll get back to you shortly with pricing.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}
