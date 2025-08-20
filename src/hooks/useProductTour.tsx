import { useState, useEffect, createContext, useContext } from 'react';

export interface TourStep {
  id: string;
  title: string;
  content: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Felt Focus!',
    content: 'Let\'s take a quick tour of your poker bankroll tracker.',
    target: '[data-tour="main-header"]',
    position: 'bottom'
  },
  {
    id: 'add-session',
    title: 'Track Your Sessions',
    content: 'Click here to add your poker sessions and track your progress.',
    target: '[data-tour="add-session"]',
    position: 'bottom'
  },
  {
    id: 'stats',
    title: 'View Your Stats',
    content: 'See your total profit, session count, and win rate at a glance.',
    target: '[data-tour="stats-cards"]',
    position: 'top'
  },
  {
    id: 'chart',
    title: 'Track Performance',
    content: 'Monitor your bankroll growth with this interactive chart.',
    target: '[data-tour="profit-chart"]',
    position: 'top'
  },
  {
    id: 'sessions-list',
    title: 'Session History',
    content: 'Review, edit, or delete your past sessions here.',
    target: '[data-tour="sessions-list"]',
    position: 'top'
  }
];

interface ProductTourContextType {
  isActive: boolean;
  currentStep: number;
  hasCompletedTour: boolean;
  totalSteps: number;
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
  resetTour: () => void;
  getCurrentStep: () => TourStep | undefined;
}

const ProductTourContext = createContext<ProductTourContextType | undefined>(undefined);

export const ProductTourProvider = ({ children }: { children: React.ReactNode }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompletedTour, setHasCompletedTour] = useState(false);

  useEffect(() => {
    // Check if user has completed tour before
    const completed = localStorage.getItem('felt-focus-tour-completed');
    if (completed) {
      setHasCompletedTour(true);
    }
  }, []);

  const startTour = () => {
    console.log('Starting tour...');
    // Small delay to ensure DOM elements are ready
    setTimeout(() => {
      console.log('Setting tour active');
      setIsActive(true);
      setCurrentStep(0);
    }, 100);
  };

  const nextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    completeTour();
  };

  const completeTour = () => {
    setIsActive(false);
    setHasCompletedTour(true);
    localStorage.setItem('felt-focus-tour-completed', 'true');
  };

  const resetTour = () => {
    localStorage.removeItem('felt-focus-tour-completed');
    setHasCompletedTour(false);
    setCurrentStep(0);
  };

  const getCurrentStep = () => TOUR_STEPS[currentStep];

  const value = {
    isActive,
    currentStep,
    hasCompletedTour,
    totalSteps: TOUR_STEPS.length,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
    resetTour,
    getCurrentStep
  };

  return (
    <ProductTourContext.Provider value={value}>
      {children}
    </ProductTourContext.Provider>
  );
};

export const useProductTour = () => {
  const context = useContext(ProductTourContext);
  if (context === undefined) {
    throw new Error('useProductTour must be used within a ProductTourProvider');
  }
  return context;
};