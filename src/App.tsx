import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth, AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import UserGuide from "./components/UserGuide";
import LandingPage from "./components/LandingPage";
import EmailPreview from "./components/EmailPreview";
import { useProductTour } from "./hooks/useProductTour";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading } = useAuth();
  const { hasCompletedTour, startTour } = useProductTour();
  
  // Auto-start tour for new users when they reach the dashboard
  React.useEffect(() => {
    if (user && !hasCompletedTour) {
      const timer = setTimeout(() => {
        startTour();
      }, 2000); // Wait 2 seconds for the page to fully load
      return () => clearTimeout(timer);
    }
  }, [user, hasCompletedTour, startTour]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={user ? <Index /> : <LandingPage />} 
      />
      <Route 
        path="/app" 
        element={user ? <Index /> : <Navigate to="/auth" replace />} 
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
