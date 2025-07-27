import { useEffect, useRef, useState } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeStart?: (direction: 'left' | 'right' | 'up' | 'down') => void;
  onSwipeMove?: (deltaX: number, deltaY: number) => void;
  onSwipeEnd?: () => void;
}

interface SwipeOptions {
  threshold?: number; // Minimum distance for a swipe
  preventDefaultTouchmoveEvent?: boolean;
  trackMouse?: boolean;
  enableHaptics?: boolean;
}

export function useSwipe(
  handlers: SwipeHandlers,
  options: SwipeOptions = {}
) {
  const {
    threshold = 50,
    preventDefaultTouchmoveEvent = false,
    trackMouse = false,
    enableHaptics = true
  } = options;

  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  // Haptic feedback helper
  const triggerHaptics = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!enableHaptics) return;
    
    try {
      if (navigator.vibrate) {
        const patterns = {
          light: 10,
          medium: 50,
          heavy: 100
        };
        navigator.vibrate(patterns[type]);
      }
    } catch (error) {
      // Silently fail if haptics not supported
    }
  };

  // Handle touch start
  const handleTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setIsTracking(true);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
    triggerHaptics('light');
  };

  // Handle touch move
  const handleTouchMove = (e: TouchEvent) => {
    if (!touchStart || !isTracking) return;
    
    const currentTouch = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    };
    
    const deltaX = currentTouch.x - touchStart.x;
    const deltaY = currentTouch.y - touchStart.y;
    
    // Call move handler for real-time feedback
    handlers.onSwipeMove?.(deltaX, deltaY);
    
    // Detect direction and trigger start handler
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    
    if (absX > 20 || absY > 20) { // Start threshold
      let direction: 'left' | 'right' | 'up' | 'down';
      
      if (absX > absY) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }
      
      handlers.onSwipeStart?.(direction);
    }
    
    if (preventDefaultTouchmoveEvent && absX > absY) {
      // Only prevent default for horizontal swipes to allow vertical scrolling
      e.preventDefault();
    }
  };

  // Handle touch end
  const handleTouchEnd = (e: TouchEvent) => {
    if (!touchStart || !isTracking) return;
    
    setIsTracking(false);
    setTouchEnd({
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    });
    
    handlers.onSwipeEnd?.();
  };

  // Handle mouse events (optional)
  const [mouseStart, setMouseStart] = useState<{ x: number; y: number } | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const handleMouseDown = (e: MouseEvent) => {
    if (!trackMouse) return;
    setIsMouseDown(true);
    setMouseStart({
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!trackMouse || !isMouseDown || !mouseStart) return;
    
    const deltaX = e.clientX - mouseStart.x;
    const deltaY = e.clientY - mouseStart.y;
    
    handlers.onSwipeMove?.(deltaX, deltaY);
    
    if (preventDefaultTouchmoveEvent && Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault();
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (!trackMouse || !isMouseDown || !mouseStart) return;
    setIsMouseDown(false);
    
    const deltaX = e.clientX - mouseStart.x;
    const deltaY = e.clientY - mouseStart.y;
    
    processSwipe(deltaX, deltaY);
    setMouseStart(null);
    handlers.onSwipeEnd?.();
  };

  // Process swipe gesture
  const processSwipe = (deltaX: number, deltaY: number) => {
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Determine if it's a horizontal or vertical swipe
    if (absX > absY && absX > threshold) {
      // Horizontal swipe
      triggerHaptics('medium');
      if (deltaX > 0) {
        handlers.onSwipeRight?.();
      } else {
        handlers.onSwipeLeft?.();
      }
    } else if (absY > absX && absY > threshold) {
      // Vertical swipe
      triggerHaptics('medium');
      if (deltaY > 0) {
        handlers.onSwipeDown?.();
      } else {
        handlers.onSwipeUp?.();
      }
    }
  };

  // Effect to handle touch end processing
  useEffect(() => {
    if (!touchStart || !touchEnd) return;

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    
    processSwipe(deltaX, deltaY);
  }, [touchStart, touchEnd, handlers, threshold]);

  // Attach event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Touch events
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventDefaultTouchmoveEvent });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Mouse events (if enabled)
    if (trackMouse) {
      element.addEventListener('mousedown', handleMouseDown);
      element.addEventListener('mousemove', handleMouseMove, { passive: !preventDefaultTouchmoveEvent });
      element.addEventListener('mouseup', handleMouseUp);
      element.addEventListener('mouseleave', handleMouseUp); // Handle mouse leave as mouse up
    }

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      
      if (trackMouse) {
        element.removeEventListener('mousedown', handleMouseDown);
        element.removeEventListener('mousemove', handleMouseMove);
        element.removeEventListener('mouseup', handleMouseUp);
        element.removeEventListener('mouseleave', handleMouseUp);
      }
    };
  }, [preventDefaultTouchmoveEvent, trackMouse]);

  return elementRef;
}

// Hook for tab navigation swipes with enhanced feedback
export function useTabSwipe(
  tabs: string[],
  activeTab: string,
  setActiveTab: (tab: string) => void,
  options: SwipeOptions = {}
) {
  const currentIndex = tabs.indexOf(activeTab);
  const [swipeProgress, setSwipeProgress] = useState(0);

  const swipeHandlers = {
    onSwipeLeft: () => {
      // Swipe left = next tab
      const nextIndex = (currentIndex + 1) % tabs.length;
      setActiveTab(tabs[nextIndex]);
    },
    onSwipeRight: () => {
      // Swipe right = previous tab
      const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
      setActiveTab(tabs[prevIndex]);
    },
    onSwipeMove: (deltaX: number) => {
      // Update progress for visual feedback
      const progress = Math.min(Math.abs(deltaX) / (options.threshold || 50), 1);
      setSwipeProgress(progress);
    },
    onSwipeEnd: () => {
      // Reset progress
      setSwipeProgress(0);
    }
  };

  const swipeRef = useSwipe(swipeHandlers, options);
  
  return { swipeRef, swipeProgress };
}