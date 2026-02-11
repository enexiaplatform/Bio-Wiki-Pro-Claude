import { useSolutions, useCreateQuoteRequest } from "@/hooks/use-data";
import { Zap, ArrowRight, X } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertQuoteRequestSchema, type InsertQuoteRequest } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Solutions() {
  const { data: products, isLoading } = useSolutions();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  return (
    <div className="pb-24 pt-4 md:pt-8 max-w-6xl mx-auto px-4">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Lab Solutions</h1>
        <p className="text-lg text-muted-foreground">Premium equipment and reagents to accelerate your research.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3].map(i => <div key={i} className="h-64 bg-card/50 animate-pulse rounded-2xl" />)
        ) : (
          products?.map((product) => (
            <div key={product.id} className="bg-card border border-white/10 rounded-2xl p-6 flex flex-col hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="text-xl font-bold mb-2">{product.name}</h3>
              <p className="text-muted-foreground text-sm mb-6">{product.tagline}</p>

              <ul className="space-y-2 mb-8 flex-1">
                {product.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                    <span className="text-primary mt-1">•</span>
                    {feature}
                  </li>
                ))}
              </ul>

              {product.painPoint && (
                <div 
                  className="mb-6 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200"
                  data-testid="callout-pain-point"
                >
                  {product.painPoint}
                </div>
              )}

              {product.targetUsers && product.targetUsers.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6" data-testid="badge-container-target-users">
                  {product.targetUsers.map((user, i) => (
                    <span 
                      key={i} 
                      className="px-2.5 py-1 rounded-full bg-white/5 text-white/80 text-[10px] font-medium border border-white/10"
                      data-testid={`badge-target-user-${i}`}
                    >
                      {user}
                    </span>
                  ))}
                </div>
              )}

              <QuoteDialog productName={product.name} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function QuoteDialog({ productName }: { productName: string }) {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useCreateQuoteRequest();
  
  const form = useForm<InsertQuoteRequest>({
    resolver: zodResolver(insertQuoteRequestSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      need: "",
      productOfInterest: productName
    }
  });

  const onSubmit = (data: InsertQuoteRequest) => {
    mutate(data, {
      onSuccess: () => setOpen(false)
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all font-bold text-sm flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-white group-hover:border-primary">
          Request Quote
          <ArrowRight className="w-4 h-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card border border-white/10 text-foreground p-0 gap-0 overflow-hidden rounded-2xl">
        <div className="p-6 bg-secondary/30 border-b border-white/5">
           <h2 className="text-xl font-bold">Request Quote</h2>
           <p className="text-sm text-muted-foreground mt-1">For {productName}</p>
        </div>
        
        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Dr. Jane Doe" {...field} className="bg-background/50 border-white/10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="jane@biolab.com" {...field} className="bg-background/50 border-white/10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution / Company</FormLabel>
                    <FormControl>
                      <Input placeholder="BioLab Inc." {...field} className="bg-background/50 border-white/10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="need"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requirements</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Please describe your specific needs or questions..." 
                        {...field} 
                        className="bg-background/50 border-white/10 min-h-[100px]" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <button
                type="submit"
                disabled={isPending}
                className="w-full mt-4 bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {isPending ? "Sending..." : "Submit Request"}
              </button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
