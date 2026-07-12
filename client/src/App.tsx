import { lazy, Suspense } from "react";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "@/context/UserContext";
import { BottomNav, DesktopNav, MobileHeader } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { LazyCommandPalette } from "@/components/LazyCommandPalette";
import { ExitIntentLeadModal } from "@/components/ExitIntentLeadModal";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { usePageTracking } from "@/hooks/use-analytics";

// Route components are code-split: each becomes its own chunk, loaded on demand.
const NotFound = lazy(() => import("@/pages/not-found"));
const Academy = lazy(() => import("@/pages/Academy"));
const AcademyEntryPage = lazy(() => import("@/pages/AcademyEntryPage"));
const LabTools = lazy(() => import("@/pages/LabTools"));
const ToolDetailPage = lazy(() => import("@/pages/ToolDetailPage"));
const Compliance = lazy(() => import("@/pages/Compliance"));
const Career = lazy(() => import("@/pages/Career"));
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
const WorkflowsPage = lazy(() => import("@/pages/WorkflowsPage"));
const WorkflowDetailPage = lazy(() => import("@/pages/WorkflowDetailPage"));
const ToolkitsPage = lazy(() => import("@/pages/ToolkitsPage"));
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogPost = lazy(() => import("@/pages/BlogPost"));
const Welcome = lazy(() => import("@/pages/Welcome"));
const LibraryEntry = lazy(() => import("@/pages/LibraryEntry"));
const PathPage = lazy(() => import("@/pages/PathPage"));
const CertificatePage = lazy(() => import("@/pages/CertificatePage"));
const MyLearningPage = lazy(() => import("@/pages/MyLearningPage"));
const MyDownloadsPage = lazy(() => import("@/pages/MyDownloadsPage"));
const Glossary = lazy(() => import("@/pages/Glossary"));
const About = lazy(() => import("@/pages/About"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const FaqPage = lazy(() => import("@/pages/FaqPage"));
const QualityLabLandingPage = lazy(() => import("@/pages/QualityLabLandingPage"));
const QualityLabPlannerPage = lazy(() => import("@/pages/QualityLabPlannerPage"));
const QualityLabProjectsPage = lazy(() => import("@/pages/QualityLabProjectsPage"));
const QualityLabReviewPage = lazy(() => import("@/pages/QualityLabReviewPage"));
const QualityLabEngagementPage = lazy(() => import("@/pages/QualityLabEngagementPage"));
const QualityLabDiscoveryPackPage = lazy(() => import("@/pages/QualityLabDiscoveryPackPage"));
const QualityLabCasebookPage = lazy(() => import("@/pages/QualityLabCasebookPage"));
const QualityLabEvidenceGraphPage = lazy(() => import("@/pages/QualityLabEvidenceGraphPage"));
const QualityLabCalibrationQueuePage = lazy(() => import("@/pages/QualityLabCalibrationQueuePage"));
const QualityLabDomainReadinessPage = lazy(() => import("@/pages/QualityLabDomainReadinessPage"));
const QualityLabMethodApplicationsPage = lazy(() => import("@/pages/QualityLabMethodApplicationsPage"));

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
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <DesktopNav />
      <MobileHeader />

      <main id="main" className="animate-in fade-in duration-500">
        <Suspense fallback={<PageFallback />}>
        <Switch>
          {/* Backward-compat: old /en|/vi prefixed URLs → clean English-only URLs */}
          <Route path="/en/:rest*" component={LegacyLangRedirect} />
          <Route path="/vi/:rest*" component={LegacyLangRedirect} />
          <Route path="/workflows" component={WorkflowsPage} />
          <Route path="/workflows/:slug" component={WorkflowDetailPage} />
          <Route path="/quality-lab" component={QualityLabLandingPage} />
          <Route path="/quality-lab/planner" component={QualityLabPlannerPage} />
          <Route path="/quality-lab/projects" component={QualityLabProjectsPage} />
          <Route path="/quality-lab/projects/:id" component={QualityLabPlannerPage} />
          <Route path="/quality-lab/review" component={QualityLabReviewPage} />
          <Route path="/quality-lab/discovery-pack" component={QualityLabDiscoveryPackPage} />
          <Route path="/quality-lab/casebook" component={QualityLabCasebookPage} />
          <Route path="/quality-lab/evidence" component={QualityLabEvidenceGraphPage} />
          <Route path="/quality-lab/calibration" component={QualityLabCalibrationQueuePage} />
          <Route path="/quality-lab/domain-readiness" component={QualityLabDomainReadinessPage} />
          <Route path="/quality-lab/method-applications" component={QualityLabMethodApplicationsPage} />
          <Route path="/quality-lab/engagements/:id" component={QualityLabEngagementPage} />
          <Route path="/academy" component={Academy} />
          <Route path="/academy/:slug" component={AcademyEntryPage} />
          <Route path="/library/:slug" component={LibraryEntry} />
          {/* Consolidated (2026-07): QC Hub + the Library index folded into the
              unified Academy "Learn" hub; the reader routes above stay canonical. */}
          <Route path="/qc-hub"><Redirect to="/academy" replace /></Route>
          <Route path="/library"><Redirect to="/academy" replace /></Route>
          <Route path="/paths/:slug" component={PathPage} />
          <Route path="/certificate/:slug" component={CertificatePage} />
          <Route path="/my-learning" component={MyLearningPage} />
          <Route path="/my-downloads" component={MyDownloadsPage} />
          <Route path="/glossary" component={Glossary} />
          <Route path="/about" component={About} />
          <Route path="/blog" component={Blog} />
          <Route path="/blog/:slug" component={BlogPost} />
          <Route path="/tools" component={LabTools} />
          <Route path="/tools/:slug" component={ToolDetailPage} />
          <Route path="/compliance" component={Compliance} />
          <Route path="/vault" component={Vault} />
          <Route path="/career" component={Career} />
          <Route path="/settings" component={Settings} />
          {/* Retired 2026-07 (off-strategy): Insights (Technical-Sales leftover)
              and Solutions (equipment quote-requests) → home. */}
          <Route path="/insights"><Redirect to="/" replace /></Route>
          <Route path="/solutions"><Redirect to="/" replace /></Route>
          <Route path="/welcome" component={Welcome} />
          <Route path="/upgrade" component={UpgradePage} />
          <Route path="/toolkits/gmp-audit-kit" component={GMPAuditKit} />
          <Route path="/toolkits" component={ToolkitsPage} />
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
      <LazyCommandPalette />
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
