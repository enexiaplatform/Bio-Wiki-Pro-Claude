import { lazy, Suspense } from "react";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "@/context/UserContext";
import { BottomNav, DesktopNav, MobileHeader } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { CommandPalette } from "@/components/CommandPalette";
import { ExitIntentLeadModal } from "@/components/ExitIntentLeadModal";
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
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));
const VerifyEmailPage = lazy(() => import("@/pages/VerifyEmailPage"));
const PricingPage = lazy(() => import("@/pages/PricingPage"));
const PaymentSuccessPage = lazy(() => import("@/pages/PaymentSuccessPage"));
const Vault = lazy(() => import("@/pages/Vault"));
const GMPAuditKit = lazy(() => import("@/pages/GMPAuditKit"));
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogPost = lazy(() => import("@/pages/BlogPost"));
const Welcome = lazy(() => import("@/pages/Welcome"));
const LibraryEntry = lazy(() => import("@/pages/LibraryEntry"));
const LibraryIndex = lazy(() => import("@/pages/LibraryIndex"));
const PathPage = lazy(() => import("@/pages/PathPage"));
const CertificatePage = lazy(() => import("@/pages/CertificatePage"));
const MyLearningPage = lazy(() => import("@/pages/MyLearningPage"));
const MyDownloadsPage = lazy(() => import("@/pages/MyDownloadsPage"));
const Glossary = lazy(() => import("@/pages/Glossary"));
const About = lazy(() => import("@/pages/About"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const FaqPage = lazy(() => import("@/pages/FaqPage"));

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
          {/* Backward-compat: old /en|/vi prefixed URLs → clean English-only URLs */}
          <Route path="/en/:rest*" component={LegacyLangRedirect} />
          <Route path="/vi/:rest*" component={LegacyLangRedirect} />
          <Route path="/qc-hub" component={QCHub} />
          <Route path="/academy" component={Academy} />
          <Route path="/academy/:slug" component={AcademyEntryPage} />
          <Route path="/library" component={LibraryIndex} />
          <Route path="/library/:slug" component={LibraryEntry} />
          <Route path="/paths/:slug" component={PathPage} />
          <Route path="/certificate/:slug" component={CertificatePage} />
          <Route path="/my-learning" component={MyLearningPage} />
          <Route path="/my-downloads" component={MyDownloadsPage} />
          <Route path="/insights" component={Insights} />
          <Route path="/glossary" component={Glossary} />
          <Route path="/about" component={About} />
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
          <Route path="/forgot-password" component={ForgotPasswordPage} />
          <Route path="/reset-password" component={ResetPasswordPage} />
          <Route path="/verify-email" component={VerifyEmailPage} />
          <Route path="/pricing" component={PricingPage} />
          <Route path="/payment/success" component={PaymentSuccessPage} />
          <Route path="/terms" component={TermsPage} />
          <Route path="/privacy" component={PrivacyPage} />
          <Route path="/faq" component={FaqPage} />
          <Route path="/" component={LandingPage} />
          <Route component={NotFound} />
        </Switch>
        </Suspense>
      </main>

      <BottomNav />
      <Footer />
      <CommandPalette />
      <ExitIntentLeadModal />
    </div>
  );
}

/** Redirect legacy /en/* and /vi/* URLs to the clean English-only path. */
function LegacyLangRedirect() {
  const rest = window.location.pathname.replace(/^\/(en|vi)(?=\/|$)/, "") || "/";
  return <Redirect to={rest} replace />;
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <Layout />
          <Toaster />
        </UserProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
