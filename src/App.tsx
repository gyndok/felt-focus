import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth, AuthProvider } from "@/hooks/useAuth";
import { useTermsOfService } from "@/hooks/useTermsOfService";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import UserGuide from "./components/UserGuide";
import LandingPage from "./components/LandingPage";
import EmailPreview from "./components/EmailPreview";
import TermsOfService from "./components/TermsOfService";

import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading: authLoading } = useAuth();
  const { tosAccepted, loading: tosLoading, acceptTerms } = useTermsOfService();

  // Show loading while checking auth or ToS status
  if (authLoading || tosLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If user is authenticated but hasn't accepted ToS, show ToS page
  if (user && tosAccepted === false) {
    const handleAccept = async () => {
      const success = await acceptTerms();
      if (success) {
        // Force a reload to update the ToS state and proceed to dashboard
        window.location.reload();
      }
    };
    return <TermsOfService onAccept={handleAccept} userEmail={user.email} />;
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={user ? <Index /> : <LandingPage />} 
      />
      <Route 
        path="/app" 
        element={user && tosAccepted ? <Index /> : <Navigate to="/auth" replace />} 
      />
      <Route 
        path="/auth" 
        element={!user ? <Auth /> : <Navigate to="/app" replace />} 
      />
      <Route 
        path="/guide" 
        element={<UserGuide />} 
      />
      <Route 
        path="/email-preview" 
        element={<EmailPreview />} 
      />
      <Route 
        path="/terms-preview" 
        element={<TermsOfService onAccept={() => window.location.href = '/app'} userEmail={user?.email} />} 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
