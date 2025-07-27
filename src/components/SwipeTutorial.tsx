import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { useKV } from '@github/spark/hooks';

export function SwipeTutorial() {
  const isMobile = useIsMobile();
  const [hasSeenTutorial, setHasSeenTutorial] = useKV('swipe-tutorial-seen', 'false');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show tutorial only on mobile and if user hasn't seen it
    if (isMobile && hasSeenTutorial !== 'true') {
      const timer = setTimeout(() => setIsVisible(true), 2000); // Show after 2 seconds
      return () => clearTimeout(timer);
    }
  }, [isMobile, hasSeenTutorial]);

  const handleDismiss = () => {
    setIsVisible(false);
    setHasSeenTutorial('true'); // Store as string to match KV pattern
  };

  if (!isMobile || hasSeenTutorial === 'true' || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleDismiss}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="p-6 max-w-sm bg-card/95 backdrop-blur-xl border border-border">
            <div className="text-center space-y-4">
              <div className="text-3xl mb-2">✨</div>
              
              <h3 className="text-lg font-bold text-foreground">
                New! Swipe Gestures
              </h3>
              
              <p className="text-sm text-muted-foreground leading-relaxed">
                Navigate between tabs by swiping left or right anywhere on the screen
              </p>
              
              <div className="flex items-center justify-center gap-4 py-4">
                <motion.div
                  className="flex items-center gap-2 text-sm"
                  animate={{ x: [0, -5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <span className="text-lg">👈</span>
                  <span className="text-muted-foreground">Previous</span>
                </motion.div>
                
                <div className="w-px h-8 bg-border" />
                
                <motion.div
                  className="flex items-center gap-2 text-sm"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.75 }}
                >
                  <span className="text-muted-foreground">Next</span>
                  <span className="text-lg">👉</span>
                </motion.div>
              </div>
              
              <div className="space-y-2">
                <Button 
                  onClick={handleDismiss}
                  className="w-full"
                  size="sm"
                >
                  Got it! 🚀
                </Button>
                
                <button
                  onClick={handleDismiss}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Don't show again
                </button>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}