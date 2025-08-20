import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ArrowLeft, ArrowRight, Play } from 'lucide-react';
import { useProductTour } from '@/hooks/useProductTour';

interface TourOverlayProps {
  target: string;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  currentStep: number;
  totalSteps: number;
  isFirst: boolean;
  isLast: boolean;
}

const TourOverlay = ({ 
  target, 
  onNext, 
  onPrev, 
  onSkip, 
  title, 
  content, 
  position,
  currentStep,
  totalSteps,
  isFirst,
  isLast
}: TourOverlayProps) => {
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [overlayStyle, setOverlayStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    console.log('Looking for target:', target);
    const element = document.querySelector(target) as HTMLElement;
    console.log('Found element:', element);
    if (element) {
      setTargetElement(element);
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Calculate position for the overlay
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      let top = 0;
      let left = 0;
      
      switch (position) {
        case 'bottom':
          top = rect.bottom + scrollTop + 10;
          left = rect.left + scrollLeft + (rect.width / 2) - 150;
          break;
        case 'top':
          top = rect.top + scrollTop - 10;
          left = rect.left + scrollLeft + (rect.width / 2) - 150;
          break;
        case 'left':
          top = rect.top + scrollTop + (rect.height / 2) - 75;
          left = rect.left + scrollLeft - 310;
          break;
        case 'right':
          top = rect.top + scrollTop + (rect.height / 2) - 75;
          left = rect.right + scrollLeft + 10;
          break;
      }
      
      setOverlayStyle({
        position: 'absolute',
        top: Math.max(10, top),
        left: Math.max(10, Math.min(left, window.innerWidth - 320)),
        zIndex: 1000,
        width: '300px'
      });
      
      // Add highlight to target element
      element.style.position = 'relative';
      element.style.zIndex = '999';
      element.style.boxShadow = '0 0 0 4px hsl(var(--primary) / 0.3), 0 0 0 8px hsl(var(--primary) / 0.1)';
      element.style.borderRadius = '8px';
    }
    
    return () => {
      if (element) {
        element.style.position = '';
        element.style.zIndex = '';
        element.style.boxShadow = '';
        element.style.borderRadius = '';
      }
    };
  }, [target, position]);

  if (!targetElement) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[998]"
        onClick={onSkip}
      />
      
      {/* Tour Card */}
      <Card style={overlayStyle} className="border-2 border-primary shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {currentStep + 1} of {totalSteps}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{content}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrev}
              disabled={isFirst}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              Back
            </Button>
            <Button
              onClick={onNext}
              size="sm"
              className="flex items-center gap-1"
            >
              {isLast ? 'Finish' : 'Next'}
              {!isLast && <ArrowRight className="h-3 w-3" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export const ProductTour = () => {
  const {
    isActive,
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    skipTour,
    getCurrentStep
  } = useProductTour();

  console.log('ProductTour render - isActive:', isActive, 'currentStep:', currentStep);

  if (!isActive) {
    console.log('Tour not active, returning null');
    return null;
  }

  const step = getCurrentStep();
  console.log('Current step:', step);
  if (!step) {
    console.log('No step found, returning null');
    return null;
  }

  return (
    <TourOverlay
      target={step.target}
      title={step.title}
      content={step.content}
      position={step.position}
      currentStep={currentStep}
      totalSteps={totalSteps}
      onNext={nextStep}
      onPrev={prevStep}
      onSkip={skipTour}
      isFirst={currentStep === 0}
      isLast={currentStep === totalSteps - 1}
    />
  );
};

export const TourStartButton = () => {
  const { hasCompletedTour, startTour } = useProductTour();

  if (hasCompletedTour) return null;

  return (
    <Button
      onClick={startTour}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <Play className="h-4 w-4" />
      Take Tour
    </Button>
  );
};