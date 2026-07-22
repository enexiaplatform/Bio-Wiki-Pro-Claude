import { lazy, Suspense, type ComponentType } from "react";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "@/context/UserContext";
import { BottomNav, DesktopNav, MobileHeader } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { LazyCommandPalette } from "@/components/LazyCommandPalette";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { usePageTracking } from "@/hooks/use-analytics";
import { useUser } from "@/context/UserContext";
import LandingPage from "@/pages/LandingPage";

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
const HowItWorksPage = lazy(() => import("@/pages/HowItWorksPage"));
const PlatformHowItWorksPage = lazy(() => import("@/pages/PlatformHowItWorksPage"));
const DeliverablesPage = lazy(() => import("@/pages/DeliverablesPage"));
const ProductsPage = lazy(() => import("@/pages/ProductsPage"));
const ProPage = lazy(() => import("@/pages/ProPage"));
const AtlasProMonthlyReviewPage = lazy(() => import("@/pages/AtlasProMonthlyReviewPage"));
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
const QualityLabSamplePage = lazy(() => import("@/pages/QualityLabSamplePage"));
const QualityLabEngagementPage = lazy(() => import("@/pages/QualityLabEngagementPage"));
const QualityLabDiscoveryPackPage = lazy(() => import("@/pages/QualityLabDiscoveryPackPage"));
const QualityLabCasebookPage = lazy(() => import("@/pages/QualityLabCasebookPage"));
const QualityLabEvidenceGraphPage = lazy(() => import("@/pages/QualityLabEvidenceGraphPage"));
const QualityLabCalibrationQueuePage = lazy(() => import("@/pages/QualityLabCalibrationQueuePage"));
const QualityLabPilotPortfolioPage = lazy(() => import("@/pages/QualityLabPilotPortfolioPage"));
const QualityLabDomainReadinessPage = lazy(() => import("@/pages/QualityLabDomainReadinessPage"));
const QualityLabExpertOwnershipPage = lazy(() => import("@/pages/QualityLabExpertOwnershipPage"));
const QualityLabValidationCasesPage = lazy(() => import("@/pages/QualityLabValidationCasesPage"));
const QualityLabGate2ReleasePage = lazy(() => import("@/pages/QualityLabGate2ReleasePage"));
const QualityLabGovernanceHistoryPage = lazy(() => import("@/pages/QualityLabGovernanceHistoryPage"));
const QualityLabRuleChangesPage = lazy(() => import("@/pages/QualityLabRuleChangesPage"));
const QualityLabMethodApplicationsPage = lazy(() => import("@/pages/QualityLabMethodApplicationsPage"));
const QualityLabScenarioComparePage = lazy(() => import("@/pages/QualityLabScenarioComparePage"));
const QualityLabTurnaroundPage = lazy(() => import("@/pages/QualityLabTurnaroundPage"));
const QualityLabSensitivityPage = lazy(() => import("@/pages/QualityLabSensitivityPage"));
const QualityLabEquipmentResiliencePage = lazy(() => import("@/pages/QualityLabEquipmentResiliencePage"));
const QualityLabNonRoutineLoadPage = lazy(() => import("@/pages/QualityLabNonRoutineLoadPage"));
const QualityLabSkillShiftCoveragePage = lazy(() => import("@/pages/QualityLabSkillShiftCoveragePage"));
const AdminDashboardPage = lazy(() => import("@/pages/AdminDashboardPage"));

function PageFallback() {
  return (
    <div className="flex items-center justify-center py-32 text-muted-foreground">
      <Loader2 className="w-6 h-6 animate-spin" />
    </div>
  );
}

function AdminOnlyRoute({ component: Component }: { component: ComponentType }) {
  const { isAdmin, isAuthenticated, isLoading } = useUser();
  if (isLoading) return <PageFallback />;
  if (!isAuthenticated) return <Redirect to="/login?next=/admin" replace />;
  if (!isAdmin) return <Redirect to="/quality-lab/projects" replace />;
  return <Component />;
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

      <main id="main">
        <Suspense fallback={<PageFallback />}>
        <Switch>
          {/* Backward-compat: old /en|/vi prefixed URLs → clean English-only URLs */}
          <Route path="/en/:rest*" component={LegacyLangRedirect} />
          <Route path="/vi/:rest*" component={LegacyLangRedirect} />
          <Route path="/workflows" component={WorkflowsPage} />
          <Route path="/workflows/:slug" component={WorkflowDetailPage} />
          <Route path="/products" component={ProductsPage} />
          <Route path="/pro" component={ProPage} />
          <Route path="/pro/monthly-review" component={AtlasProMonthlyReviewPage} />
          <Route path="/how-it-works" component={PlatformHowItWorksPage} />
          <Route path="/deliverables"><Redirect to="/quality-lab/deliverables" replace /></Route>
          <Route path="/quality-lab" component={QualityLabLandingPage} />
          <Route path="/quality-lab/how-it-works" component={HowItWorksPage} />
          <Route path="/quality-lab/deliverables" component={DeliverablesPage} />
          <Route path="/quality-lab/planner" component={QualityLabPlannerPage} />
          <Route path="/quality-lab/projects" component={QualityLabProjectsPage} />
          <Route path="/quality-lab/compare" component={QualityLabScenarioComparePage} />
          <Route path="/quality-lab/turnaround" component={QualityLabTurnaroundPage} />
          <Route path="/quality-lab/sensitivity" component={QualityLabSensitivityPage} />
          <Route path="/quality-lab/equipment-resilience" component={QualityLabEquipmentResiliencePage} />
          <Route path="/quality-lab/non-routine-load" component={QualityLabNonRoutineLoadPage} />
          <Route path="/quality-lab/skill-shift-coverage" component={QualityLabSkillShiftCoveragePage} />
          <Route path="/quality-lab/projects/:id" component={QualityLabPlannerPage} />
          <Route path="/quality-lab/review" component={QualityLabReviewPage} />
          <Route path="/quality-lab/sample" component={QualityLabSamplePage} />
          <Route path="/quality-lab/discovery-pack" component={QualityLabDiscoveryPackPage} />
          <Route path="/quality-lab/casebook" component={QualityLabCasebookPage} />
          <Route path="/quality-lab/evidence" component={QualityLabEvidenceGraphPage} />
          <Route path="/quality-lab/calibration">{() => <AdminOnlyRoute component={QualityLabCalibrationQueuePage} />}</Route>
          <Route path="/quality-lab/pilots">{() => <AdminOnlyRoute component={QualityLabPilotPortfolioPage} />}</Route>
          <Route path="/quality-lab/domain-readiness">{() => <AdminOnlyRoute component={QualityLabDomainReadinessPage} />}</Route>
          <Route path="/quality-lab/domain-ownership">{() => <AdminOnlyRoute component={QualityLabExpertOwnershipPage} />}</Route>
          <Route path="/quality-lab/validation-cases">{() => <AdminOnlyRoute component={QualityLabValidationCasesPage} />}</Route>
          <Route path="/quality-lab/gate-2-release">{() => <AdminOnlyRoute component={QualityLabGate2ReleasePage} />}</Route>
          <Route path="/quality-lab/governance-history">{() => <AdminOnlyRoute component={QualityLabGovernanceHistoryPage} />}</Route>
          <Route path="/quality-lab/rule-changes">{() => <AdminOnlyRoute component={QualityLabRuleChangesPage} />}</Route>
          <Route path="/quality-lab/method-applications">{() => <AdminOnlyRoute component={QualityLabMethodApplicationsPage} />}</Route>
          <Route path="/quality-lab/engagements/:id">{() => <AdminOnlyRoute component={QualityLabEngagementPage} />}</Route>
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
          <Route path="/admin" component={AdminDashboardPage} />
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
