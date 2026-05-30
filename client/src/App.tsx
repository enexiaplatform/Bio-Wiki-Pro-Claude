import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "@/context/UserContext";
import { BottomNav, DesktopNav, MobileHeader } from "@/components/Navigation";
import i18n from "@/i18n";
import { isSupportedLng, type Lng } from "@/i18n";
import { detectInitialLang, writeLangCookie } from "@/i18n/locale-routing";
import NotFound from "@/pages/not-found";

import QCHub from "@/pages/QCHub";
import Academy from "@/pages/Academy";
import AcademyEntryPage from "@/pages/AcademyEntryPage";
import Insights from "@/pages/Insights";
import LabTools from "@/pages/LabTools";
import Compliance from "@/pages/Compliance";
import Career from "@/pages/Career";
import Solutions from "@/pages/Solutions";
import Settings from "@/pages/Settings";
import UpgradePage from "@/pages/UpgradePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import PricingPage from "@/pages/PricingPage";
import PaymentSuccessPage from "@/pages/PaymentSuccessPage";
import Vault from "@/pages/Vault";
import GMPAuditKit from "@/pages/GMPAuditKit";
import LandingPage from "@/pages/LandingPage";
import TermsPage from "@/pages/TermsPage";
import PrivacyPage from "@/pages/PrivacyPage";
import RefundPage from "@/pages/RefundPage";
import { Footer } from "@/components/Footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { usePageTracking } from "@/hooks/use-analytics";

function Layout() {
  usePageTracking();
  return (
    <div className="min-h-screen bg-background text-foreground pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0 md:pt-16">
      <DesktopNav />
      <MobileHeader />

      <main className="animate-in fade-in duration-500">
        <Switch>
          <Route path="/qc-hub" component={QCHub} />
          <Route path="/academy" component={Academy} />
          <Route path="/academy/:slug" component={AcademyEntryPage} />
          <Route path="/insights" component={Insights} />
          <Route path="/tools" component={LabTools} />
          <Route path="/compliance" component={Compliance} />
          <Route path="/vault" component={Vault} />
          <Route path="/career" component={Career} />
          <Route path="/solutions" component={Solutions} />
          <Route path="/settings" component={Settings} />
          <Route path="/upgrade" component={UpgradePage} />
          <Route path="/toolkits/gmp-audit-kit" component={GMPAuditKit} />
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
          <Route path="/signup" component={RegisterPage} />
          <Route path="/pricing" component={PricingPage} />
          <Route path="/payment/success" component={PaymentSuccessPage} />
          <Route path="/terms" component={TermsPage} />
          <Route path="/privacy" component={PrivacyPage} />
          <Route path="/refund" component={RefundPage} />
          <Route path="/" component={LandingPage} />
          <Route component={NotFound} />
        </Switch>
      </main>

      <BottomNav />
      <Footer />
    </div>
  );
}

/**
 * Locale routing: every page lives under a /vi or /en prefix. A path without a
 * valid prefix redirects to the detected language (cookie → navigator → vi).
 * The URL segment is the source of truth — i18n.language + cookie + <html lang>
 * are synced to it. All <Link>/navigate inside the based <Router> auto-prefix.
 */
function LocalizedRouter() {
  const [location] = useLocation();
  const segment = location.split("/")[1];

  useEffect(() => {
    if (!isSupportedLng(segment)) return;
    const lng = segment as Lng;
    if (i18n.language !== lng) i18n.changeLanguage(lng);
    writeLangCookie(lng);
    document.documentElement.lang = lng;
  }, [segment]);

  if (!isSupportedLng(segment)) {
    const lng = detectInitialLang();
    const rest = location === "/" ? "" : location;
    return <Redirect to={`/${lng}${rest}`} replace />;
  }

  return (
    <WouterRouter base={`/${segment}`}>
      <Layout />
    </WouterRouter>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <LocalizedRouter />
          <Toaster />
        </UserProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
