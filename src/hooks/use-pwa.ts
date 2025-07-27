import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface PWAHook {
  isInstalled: boolean;
  isOnline: boolean;
  canInstall: boolean;
  isInstalling: boolean;
  updateAvailable: boolean;
  installApp: () => Promise<void>;
  shareApp: () => Promise<void>;
  updateApp: () => Promise<void>;
  requestNotifications: () => Promise<NotificationPermission>;
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePWA(): PWAHook {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Check if app is installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isInWebAppiOS);
    };

    checkInstalled();

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      toast.success("App Installed Successfully! 🎉", {
        description: "Finance Tracker is now available on your device",
      });
    };

    // Listen for online/offline
    const handleOnline = () => {
      setIsOnline(true);
      if (isInstalled) {
        toast.success("Back Online 🌐", {
          description: "All features are now available",
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (isInstalled) {
        toast.error("Offline Mode 📴", {
          description: "App continues to work offline",
        });
      }
    };

    // Service Worker registration and updates
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          });

          console.log('Service Worker registered:', registration);

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                  toast.success("Update Available! 🚀", {
                    description: "A new version of the app is ready",
                  });
                }
              });
            }
          });

          // Check for waiting worker
          if (registration.waiting) {
            setUpdateAvailable(true);
          }

        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      }
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register service worker
    registerServiceWorker();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isInstalled]);

  const installApp = async (): Promise<void> => {
    if (!deferredPrompt) {
      toast.error("Installation Not Available", {
        description: "Use your browser's install option from the menu",
      });
      return;
    }

    setIsInstalling(true);

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        toast.success("Installing App... 📲", {
          description: "Finance Tracker will be added to your device",
        });
      } else {
        toast.info("Installation Cancelled", {
          description: "You can install later from the browser menu",
        });
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error('Installation failed:', error);
      toast.error("Installation Failed", {
        description: "Please try installing from your browser menu",
      });
    } finally {
      setIsInstalling(false);
    }
  };

  const shareApp = async (): Promise<void> => {
    const shareData = {
      title: 'Finance Tracker - Smart Money Management',
      text: 'Check out this amazing AI-powered finance tracker for India! 🇮🇳',
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success("Shared Successfully! 📤", {
          description: "Thanks for sharing Finance Tracker",
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        toast.success("Link Copied! 📋", {
          description: "Share this link with friends and family",
        });
      }
    } catch (error) {
      console.error('Sharing failed:', error);
      toast.error("Sharing Failed", {
        description: "Unable to share, please copy the URL manually",
      });
    }
  };

  const updateApp = async (): Promise<void> => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration?.waiting) {
          // Send message to waiting service worker to skip waiting
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          
          // Reload the page to apply update
          window.location.reload();
        }
      } catch (error) {
        console.error('Update failed:', error);
        toast.error("Update Failed", {
          description: "Please refresh the page manually",
        });
      }
    }
  };

  const requestNotifications = async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      toast.error("Notifications Not Supported", {
        description: "Your browser doesn't support notifications",
      });
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        toast.success("Notifications Enabled! 🔔", {
          description: "You'll receive important updates about your finances",
        });

        // Show a test notification
        if (isInstalled) {
          new Notification('Finance Tracker', {
            body: 'Notifications are now enabled!',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
          });
        }
      } else if (permission === 'denied') {
        toast.error("Notifications Blocked", {
          description: "Enable notifications in browser settings for better experience",
        });
      }

      return permission;
    } catch (error) {
      console.error('Notification permission failed:', error);
      toast.error("Permission Failed", {
        description: "Unable to enable notifications",
      });
      return 'denied';
    }
  };

  return {
    isInstalled,
    isOnline,
    canInstall: !!deferredPrompt,
    isInstalling,
    updateAvailable,
    installApp,
    shareApp,
    updateApp,
    requestNotifications,
  };
}

// PWA Status Hook for checking various PWA states
export function usePWAStatus() {
  const [status, setStatus] = useState({
    isStandalone: false,
    isFullscreen: false,
    displayMode: 'browser',
    canInstall: false,
    hasServiceWorker: false,
    isOnline: navigator.onLine,
  });

  useEffect(() => {
    const updateStatus = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
      
      let displayMode = 'browser';
      if (isFullscreen) displayMode = 'fullscreen';
      else if (isStandalone) displayMode = 'standalone';
      else if (window.matchMedia('(display-mode: minimal-ui)').matches) displayMode = 'minimal-ui';

      setStatus(prev => ({
        ...prev,
        isStandalone,
        isFullscreen,
        displayMode,
        hasServiceWorker: 'serviceWorker' in navigator,
        isOnline: navigator.onLine,
      }));
    };

    const handleBeforeInstallPrompt = () => {
      setStatus(prev => ({ ...prev, canInstall: true }));
    };

    const handleAppInstalled = () => {
      setStatus(prev => ({ ...prev, canInstall: false }));
    };

    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOnline: false }));
    };

    // Initial check
    updateStatus();

    // Add listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return status;
}