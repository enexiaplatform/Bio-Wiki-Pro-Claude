import { useEffect, lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "@/context/UserContext";
import { BottomNav, DesktopNav, MobileHeader } from "@/components/Navigation";
import i18n from "@/i18n";
import { isSupportedLng, type Lng } from "@/i18n";
import { detectInitialLang, writeLangCookie } from "@/i18n/locale-routing";
import { Footer } from "@/components/Footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { usePageTracking } from "@/hooks/use-analytics";

// Route components are code-split: each becomes its own chunk, loaded on demand.
const NotFound = lazy(() => import("@/pages/not-found"));
const QCHub = lazy(() => import("@/pages/QCHub"));
const Academy = lazy(() => import("@/pages/Academy"));
const AcademyEntryPage = lazy(() => import("@/pages/AcademyEntryPage"));
const Insights = lazy(() => import("@/pages/Insights"));
const LabTools = lazy(() => import("@/pages/LabTools"));
const Compliance = lazy(() => import("@/pages/Compliance"));
const Career = lazy(() => import("@/pages/Career"));
const Solutions = lazy(() => import("@/pages/Solutions"));
const Settings = lazy(() => import("@/pages/Settings"));
const UpgradePage = lazy(() => import("@/pages/UpgradePage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const PricingPage = lazy(() => import("@/pages/PricingPage"));
const PaymentSuccessPage = lazy(() => import("@/pages/PaymentSuccessPage"));
const Vault = lazy(() => import("@/pages/Vault"));
const GMPAuditKit = lazy(() => import("@/pages/GMPAuditKit"));
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogPost = lazy(() => import("@/pages/BlogPost"));
const Welcome = lazy(() => import("@/pages/Welcome"));
const LibraryEntry = lazy(() => import("@/pages/LibraryEntry"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const RefundPage = lazy(() => import("@/pages/RefundPage"));

function PageFallback() {
  return (
    <div className="flex items-center justify-center py-32 text-muted-foreground">
      <Loader2 className="w-6 h-6 animate-spin" />
    </div>
  );
}

function Layout() {
  usePageTracking();
  return (
    <div className="min-h-screen bg-background text-foreground pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0 md:pt-16">
      <DesktopNav />
      <MobileHeader />

      <main className="animate-in fade-in duration-500">
        <Suspense fallback={<PageFallback />}>
        <Switch>
          <Route path="/qc-hub" component={QCHub} />
          <Route path="/academy" component={Academy} />
          <Route path="/academy/:slug" component={AcademyEntryPage} />
          <Route path="/library/:slug" component={LibraryEntry} />
          <Route path="/insights" component={Insights} />
          <Route path="/blog" component={Blog} />
          <Route path="/blog/:slug" component={BlogPost} />
          <Route path="/tools" component={LabTools} />
          <Route path="/compliance" component={Compliance} />
          <Route path="/vault" component={Vault} />
          <Route path="/career" component={Career} />
          <Route path="/solutions" component={Solutions} />
          <Route path="/settings" component={Settings} />
          <Route path="/welcome" component={Welcome} />
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
        </Suspense>
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
