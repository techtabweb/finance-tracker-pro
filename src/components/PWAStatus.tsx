import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DeviceMobile, 
  Monitor, 
  WifiHigh, 
  WifiOff, 
  Download, 
  Share, 
  Bell,
  ArrowClockwise,
  CheckCircle,
  Warning,
  Info,
  Gear
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePWA, usePWAStatus } from '@/hooks/use-pwa';
import { toast } from 'sonner';

export function PWAStatus() {
  const { 
    isInstalled, 
    isOnline, 
    canInstall, 
    isInstalling, 
    updateAvailable,
    installApp,
    shareApp,
    updateApp,
    requestNotifications
  } = usePWA();
  
  const pwaStatus = usePWAStatus();
  const [showDetails, setShowDetails] = useState(false);

  const getConnectionQuality = () => {
    if (!isOnline) return { quality: 'offline', color: 'destructive', text: 'Offline' };
    
    // Check connection quality if available
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      const { effectiveType, downlink } = connection;
      
      if (effectiveType === '4g' || downlink > 5) {
        return { quality: 'excellent', color: 'success', text: 'Excellent' };
      } else if (effectiveType === '3g' || downlink > 1) {
        return { quality: 'good', color: 'warning', text: 'Good' };
      } else {
        return { quality: 'slow', color: 'destructive', text: 'Slow' };
      }
    }
    
    return { quality: 'online', color: 'success', text: 'Online' };
  };

  const connectionStatus = getConnectionQuality();

  const getInstallationProgress = () => {
    if (isInstalled) return 100;
    if (isInstalling) return 50;
    if (canInstall) return 25;
    return 0;
  };

  const getDeviceInfo = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/android/.test(userAgent)) {
      return { type: 'Android', icon: DeviceMobile, platform: 'mobile' };
    } else if (/iphone|ipad|ipod/.test(userAgent)) {
      return { type: 'iOS', icon: DeviceMobile, platform: 'mobile' };
    } else if (/windows/.test(userAgent)) {
      return { type: 'Windows', icon: Monitor, platform: 'desktop' };
    } else if (/mac/.test(userAgent)) {
      return { type: 'macOS', icon: Monitor, platform: 'desktop' };
    } else {
      return { type: 'Desktop', icon: Monitor, platform: 'desktop' };
    }
  };

  const deviceInfo = getDeviceInfo();
  const DeviceIcon = deviceInfo.icon;

  return (
    <div className="space-y-4">
      {/* Main Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className={`${isInstalled ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 'border-blue-200 bg-blue-50 dark:bg-blue-900/20'}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <DeviceIcon className="h-5 w-5" />
                PWA Status - {deviceInfo.type}
              </CardTitle>
              <Badge variant={isInstalled ? "success" : canInstall ? "warning" : "secondary"}>
                {isInstalled ? 'Installed' : canInstall ? 'Ready to Install' : 'Available'}
              </Badge>
            </div>
            <CardDescription>
              Progressive Web App features and installation status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Installation Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Installation Progress</span>
                <span>{getInstallationProgress()}%</span>
              </div>
              <Progress value={getInstallationProgress()} className="h-2" />
            </div>

            {/* Status Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <WifiHigh className="h-4 w-4 text-green-600" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-600" />
                )}
                <span>Connection: {connectionStatus.text}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {isInstalled ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Download className="h-4 w-4 text-blue-600" />
                )}
                <span>{isInstalled ? 'App Installed' : 'Browser Only'}</span>
              </div>

              <div className="flex items-center gap-2">
                {pwaStatus.hasServiceWorker ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Warning className="h-4 w-4 text-orange-600" />
                )}
                <span>Service Worker</span>
              </div>

              <div className="flex items-center gap-2">
                {Notification.permission === 'granted' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Bell className="h-4 w-4 text-gray-600" />
                )}
                <span>Notifications</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {!isInstalled && canInstall && (
                <Button
                  onClick={installApp}
                  disabled={isInstalling}
                  size="sm"
                  className="flex-1"
                >
                  {isInstalling ? (
                    <>
                      <ArrowClockwise className="h-4 w-4 mr-2 animate-spin" />
                      Installing...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Install App
                    </>
                  )}
                </Button>
              )}
              
              <Button
                onClick={shareApp}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>

              {Notification.permission !== 'granted' && (
                <Button
                  onClick={requestNotifications}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
              )}
            </div>

            {/* Update Available Alert */}
            <AnimatePresence>
              {updateAvailable && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                    <ArrowClockwise className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                      <span>App update available</span>
                      <Button onClick={updateApp} size="sm" variant="outline">
                        Update Now
                      </Button>
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toggle Details */}
            <Button
              onClick={() => setShowDetails(!showDetails)}
              variant="ghost"
              size="sm"
              className="w-full"
            >
              <Gear className="h-4 w-4 mr-2" />
              {showDetails ? 'Hide' : 'Show'} Technical Details
            </Button>

            {/* Technical Details */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 text-xs text-muted-foreground border-t pt-4"
                >
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex justify-between">
                      <span>Display Mode:</span>
                      <span className="font-mono">{pwaStatus.displayMode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Standalone:</span>
                      <span className={pwaStatus.isStandalone ? 'text-green-600' : 'text-red-600'}>
                        {pwaStatus.isStandalone ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>User Agent:</span>
                      <span className="font-mono text-right max-w-[200px] truncate">
                        {navigator.userAgent.split(' ')[0]}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform:</span>
                      <span className="font-mono">{navigator.platform}</span>
                    </div>
                    {(navigator as any).connection && (
                      <div className="flex justify-between">
                        <span>Connection:</span>
                        <span className="font-mono">
                          {(navigator as any).connection.effectiveType || 'Unknown'}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Feature Benefits */}
      {!isInstalled && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Why Install the App?</CardTitle>
              <CardDescription>
                Get the best Finance Tracker experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Offline Access</p>
                    <p className="text-muted-foreground">Use the app even without internet</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Instant Loading</p>
                    <p className="text-muted-foreground">Lightning-fast startup times</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-muted-foreground">Budget alerts and reminders</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Native Experience</p>
                    <p className="text-muted-foreground">Feels like a native app</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}