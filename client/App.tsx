import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar, MobileMenuButton } from "./components/Sidebar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { OptionalFaceLock } from "./components/FaceLockGuard";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import EmailAnalyzer from "./pages/EmailAnalyzer";
import SMSAnalyzer from "./pages/SMSAnalyzer";
import ScanHistory from "./pages/ScanHistory";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import FaceLock from "./pages/FaceLock";
import FaceLockTest from "./pages/FaceLockTest";
import PhoneOTP from "./pages/PhoneOTP";
import NotFound from "./pages/NotFound";

// Advanced Threat Automation Components
import ThreatAutomation from "./pages/ThreatAutomation";
import LiveAnalysis from "./pages/LiveAnalysis";
import PhishingProtection from "./pages/PhishingProtection";
import ThreatMapping from "./pages/ThreatMapping";
import AlertsManagement from "./pages/AlertsManagement";
import FilteringManagement from "./pages/FilteringManagement";
import AdvancedAnalytics from "./pages/AdvancedAnalytics";
import IntegrationSettings from "./pages/IntegrationSettings";
import SpamExtension from "./pages/SpamExtension";
import SocialMediaAnalyzer from "./pages/SocialMediaAnalyzer";

const queryClient = new QueryClient();

// Layout component that includes the responsive sidebar
const Layout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="flex h-screen bg-background">
      <MobileMenuButton onClick={() => setSidebarOpen(true)} />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="flex-1 overflow-auto md:ml-0 custom-scrollbar">
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <div className="dark">
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/phone-otp" element={<PhoneOTP />} />

                {/* Face Lock Routes */}
                <Route path="/face-lock" element={
                  <ProtectedRoute>
                    <FaceLock />
                  </ProtectedRoute>
                } />
                <Route path="/face-lock-setup" element={
                  <ProtectedRoute>
                    <FaceLock />
                  </ProtectedRoute>
                } />
                <Route path="/face-lock-verify" element={
                  <ProtectedRoute>
                    <FaceLock />
                  </ProtectedRoute>
                } />
                <Route path="/face-lock-test" element={<FaceLockTest />} />

                {/* Protected Routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout><Dashboard /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Layout><Dashboard /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/email-analyzer" element={
                  <ProtectedRoute>
                    <Layout><EmailAnalyzer /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/sms-analyzer" element={
                  <ProtectedRoute>
                    <Layout><SMSAnalyzer /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/scan-history" element={
                  <ProtectedRoute>
                    <Layout><ScanHistory /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/analytics" element={
                  <ProtectedRoute>
                    <OptionalFaceLock>
                      <Layout><Analytics /></Layout>
                    </OptionalFaceLock>
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <OptionalFaceLock>
                      <Layout><Settings /></Layout>
                    </OptionalFaceLock>
                  </ProtectedRoute>
                } />
                <Route path="/help" element={
                  <ProtectedRoute>
                    <Layout><Help /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Layout><Profile /></Layout>
                  </ProtectedRoute>
                } />

                {/* Advanced Threat Automation Routes */}
                <Route path="/threat-automation" element={
                  <ProtectedRoute>
                    <OptionalFaceLock>
                      <Layout><ThreatAutomation /></Layout>
                    </OptionalFaceLock>
                  </ProtectedRoute>
                } />
                <Route path="/live-analysis" element={
                  <ProtectedRoute>
                    <OptionalFaceLock>
                      <Layout><LiveAnalysis /></Layout>
                    </OptionalFaceLock>
                  </ProtectedRoute>
                } />
                <Route path="/phishing-protection" element={
                  <ProtectedRoute>
                    <OptionalFaceLock>
                      <Layout><PhishingProtection /></Layout>
                    </OptionalFaceLock>
                  </ProtectedRoute>
                } />
                <Route path="/threat-mapping" element={
                  <ProtectedRoute>
                    <OptionalFaceLock>
                      <Layout><ThreatMapping /></Layout>
                    </OptionalFaceLock>
                  </ProtectedRoute>
                } />
                <Route path="/alerts-management" element={
                  <ProtectedRoute>
                    <OptionalFaceLock>
                      <Layout><AlertsManagement /></Layout>
                    </OptionalFaceLock>
                  </ProtectedRoute>
                } />
                <Route path="/filtering-management" element={
                  <ProtectedRoute>
                    <OptionalFaceLock>
                      <Layout><FilteringManagement /></Layout>
                    </OptionalFaceLock>
                  </ProtectedRoute>
                } />
                <Route path="/advanced-analytics" element={
                  <ProtectedRoute>
                    <OptionalFaceLock>
                      <Layout><AdvancedAnalytics /></Layout>
                    </OptionalFaceLock>
                  </ProtectedRoute>
                } />
                <Route path="/integration-settings" element={
                  <ProtectedRoute>
                    <OptionalFaceLock>
                      <Layout><IntegrationSettings /></Layout>
                    </OptionalFaceLock>
                  </ProtectedRoute>
                } />
                <Route path="/spam-extension" element={
                  <ProtectedRoute>
                    <OptionalFaceLock>
                      <Layout><SpamExtension /></Layout>
                    </OptionalFaceLock>
                  </ProtectedRoute>
                } />
                <Route path="/social-media-analyzer" element={
                  <ProtectedRoute>
                    <OptionalFaceLock>
                      <Layout><SocialMediaAnalyzer /></Layout>
                    </OptionalFaceLock>
                  </ProtectedRoute>
                } />

                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </div>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
