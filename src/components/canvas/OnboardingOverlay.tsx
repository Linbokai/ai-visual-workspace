import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, MessageSquare, Layers, Move, Sparkles } from 'lucide-react';

const ONBOARDING_KEY = 'canvas_onboarding_seen';

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  position: string; // Tailwind positioning
}

const steps: OnboardingStep[] = [
  {
    title: 'Add Nodes',
    description: 'Click the + button in the left sidebar to add image, video, text, or audio nodes to your canvas.',
    icon: Plus,
    position: 'left-20 top-1/3',
  },
  {
    title: 'Connect & Process',
    description: 'Drag from node handles to create connections. Edges represent data flow between nodes.',
    icon: Layers,
    position: 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
  },
  {
    title: 'AI Chat',
    description: 'Open the AI Chat panel to get intelligent suggestions and generate content for your nodes.',
    icon: MessageSquare,
    position: 'right-20 bottom-1/3',
  },
  {
    title: 'Navigate Canvas',
    description: 'Scroll to zoom, drag to pan. Use Ctrl+Z to undo, Ctrl+C/V to copy/paste nodes.',
    icon: Move,
    position: 'left-1/2 bottom-20 -translate-x-1/2',
  },
];

export function OnboardingOverlay() {
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem(ONBOARDING_KEY);
    if (!seen) {
      // Show after a short delay so the canvas loads first
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(ONBOARDING_KEY, 'true');
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleDismiss();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!visible) return null;

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center"
        onClick={handleDismiss}
        role="dialog"
        aria-modal="true"
        aria-label="Canvas onboarding guide"
      >
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-0">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[var(--primary)]" />
              <h2 className="text-base font-semibold text-[var(--foreground)]">Getting Started</h2>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--hover-overlay)] transition-colors cursor-pointer bg-transparent border-none"
              aria-label="Close onboarding"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Step content */}
          <div className="p-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-4"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-[var(--primary)]" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[var(--foreground)] mb-1">{step.title}</h3>
                  <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 pb-5">
            {/* Step dots */}
            <div className="flex items-center gap-1.5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentStep ? 'w-5 bg-[var(--primary)]' : 'w-1.5 bg-[var(--border)]'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="h-8 px-3 rounded-lg border border-[var(--border)] bg-transparent text-sm text-[var(--foreground)] hover:bg-[var(--hover-overlay)] transition-colors cursor-pointer"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="h-8 px-4 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer border-none"
              >
                {currentStep < steps.length - 1 ? 'Next' : 'Get Started'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
