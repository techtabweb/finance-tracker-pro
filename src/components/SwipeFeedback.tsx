import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface SwipeFeedbackProps {
  isActive: boolean;
  direction: 'left' | 'right' | null;
  currentTab: string;
  nextTab: string;
  previousTab: string;
}

export function SwipeFeedback({ 
  isActive, 
  direction, 
  currentTab, 
  nextTab, 
  previousTab 
}: SwipeFeedbackProps) {
  const isMobile = useIsMobile();
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (isActive && direction && isMobile) {
      setShowFeedback(true);
      const timer = setTimeout(() => setShowFeedback(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isActive, direction, isMobile]);

  if (!isMobile || !showFeedback) return null;

  const targetTab = direction === 'left' ? nextTab : previousTab;
  const icon = direction === 'left' ? '👉' : '👈';
  const text = direction === 'left' ? 'Next' : 'Previous';

  return (
    <AnimatePresence>
      {showFeedback && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
        >
          <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl px-6 py-4 shadow-xl">
            <div className="flex items-center gap-3">
              <motion.span
                className="text-2xl"
                animate={{ x: direction === 'left' ? [0, 10, 0] : [0, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                {icon}
              </motion.span>
              <div>
                <div className="text-sm font-medium text-foreground">
                  {text} Tab
                </div>
                <div className="text-xs text-muted-foreground capitalize">
                  {targetTab}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to manage swipe feedback
export function useSwipeFeedback(
  tabs: Array<{ value: string; label: string }>,
  activeTab: string
) {
  const [swipeState, setSwipeState] = useState<{
    isActive: boolean;
    direction: 'left' | 'right' | null;
  }>({
    isActive: false,
    direction: null
  });

  const currentIndex = tabs.findIndex(tab => tab.value === activeTab);
  const nextIndex = (currentIndex + 1) % tabs.length;
  const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;

  const showSwipeFeedback = (direction: 'left' | 'right') => {
    setSwipeState({ isActive: true, direction });
    setTimeout(() => {
      setSwipeState({ isActive: false, direction: null });
    }, 1500);
  };

  return {
    swipeState,
    showSwipeFeedback,
    currentTab: tabs[currentIndex]?.value || '',
    nextTab: tabs[nextIndex]?.value || '',
    previousTab: tabs[prevIndex]?.value || ''
  };
}