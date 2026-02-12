import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "@/context/UserContext";
import { BottomNav, DesktopNav, MobileHeader } from "@/components/Navigation";
import NotFound from "@/pages/not-found";

import QCHub from "@/pages/QCHub";
import Academy from "@/pages/Academy";
import Insights from "@/pages/Insights";
import LabTools from "@/pages/LabTools";
import Compliance from "@/pages/Compliance";
import Career from "@/pages/Career";
import Solutions from "@/pages/Solutions";
import Settings from "@/pages/Settings";

function Router() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0 md:pt-16">
      <DesktopNav />
      <MobileHeader />
      
      <main className="animate-in fade-in duration-500">
        <Switch>
          <Route path="/qc-hub" component={QCHub} />
          <Route path="/academy" component={Academy} />
          <Route path="/insights" component={Insights} />
          <Route path="/tools" component={LabTools} />
          <Route path="/compliance" component={Compliance} />
          <Route path="/career" component={Career} />
          <Route path="/solutions" component={Solutions} />
          <Route path="/settings" component={Settings} />
          
          <Route path="/">
            <Redirect to="/qc-hub" />
          </Route>
          
          <Route component={NotFound} />
        </Switch>
      </main>

      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <Router />
        <Toaster />
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
