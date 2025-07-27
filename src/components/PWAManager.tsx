import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Smartphone, 
  Monitor, 
  Download, 
  Share2, 
  Bell,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Wifi,
  WifiOff,
  Settings,
  Zap,
  Globe
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { PWAInstaller } from '@/components/PWAInstaller';
import { PWAStatus } from '@/components/PWAStatus';
import { usePWA } from '@/hooks/use-pwa';
import { toast } from 'sonner';

export function PWAManager() {
  const { 
    isInstalled, 
    isOnline, 
    canInstall, 
    updateAvailable,
    shareApp,
    updateApp,
    requestNotifications
  } = usePWA();

  const [activeTab, setActiveTab] = useState('install');
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);

  useEffect(() => {
    // Update notification permission state
    const checkPermission = () => {
      setNotificationPermission(Notification.permission);
    };

    // Check immediately and on focus
    checkPermission();
    window.addEventListener('focus', checkPermission);

    return () => {
      window.removeEventListener('focus', checkPermission);
    };
  }, []);

  const handleEnableNotifications = async () => {
    try {
      const permission = await requestNotifications();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        toast.success('Notifications enabled! You\'ll receive important finance updates.');
      }
    } catch (error) {
      toast.error('Failed to enable notifications');
    }
  };

  const handleShare = async () => {
    try {
      await shareApp();
    } catch (error) {
      toast.error('Failed to share app');
    }
  };

  const getFeatureStatus = (feature: string) => {
    switch (feature) {
      case 'offline':
        return isInstalled ? 'enabled' : 'available';
      case 'notifications':
        return notificationPermission === 'granted' ? 'enabled' : 'available';
      case 'install':
        return isInstalled ? 'enabled' : canInstall ? 'available' : 'unavailable';
      case 'sharing':
        return 'available';
      default:
        return 'unavailable';
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const variant = status === 'enabled' ? 'success' : status === 'available' ? 'warning' : 'secondary';
    return <Badge variant={variant}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  Progressive Web App
                </CardTitle>
                <CardDescription>
                  Transform Finance Tracker into a native app experience
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Wifi className="h-5 w-5 text-green-600" />
                ) : (
                  <WifiOff className="h-5 w-5 text-red-600" />
                )}
                <Badge variant={isInstalled ? "success" : "secondary"}>
                  {isInstalled ? 'Installed' : 'Browser'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Quick Actions */}
            <div className="flex gap-2 mb-4">
              <Button
                onClick={handleShare}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share App
              </Button>
              
              {notificationPermission !== 'granted' && (
                <Button
                  onClick={handleEnableNotifications}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Enable Notifications
                </Button>
              )}

              {updateAvailable && (
                <Button
                  onClick={updateApp}
                  variant="default"
                  size="sm"
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Update Available
                </Button>
              )}
            </div>

            {/* Feature Status Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Install
                </span>
                <StatusBadge status={getFeatureStatus('install')} />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Offline
                </span>
                <StatusBadge status={getFeatureStatus('offline')} />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                </span>
                <StatusBadge status={getFeatureStatus('notifications')} />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Sharing
                </span>
                <StatusBadge status={getFeatureStatus('sharing')} />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="install" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Installation
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Status & Details
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Features
          </TabsTrigger>
        </TabsList>

        <TabsContent value="install" className="space-y-4">
          <PWAInstaller />
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <PWAStatus />
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>PWA Features</CardTitle>
                <CardDescription>
                  Progressive Web App capabilities for Finance Tracker
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Offline Capabilities */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Offline Capabilities
                  </h3>
                  <div className="grid gap-3 text-sm">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">Cache Management</p>
                        <p className="text-muted-foreground">Store app data for offline access</p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">Background Sync</p>
                        <p className="text-muted-foreground">Sync data when connection returns</p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">Offline Fallbacks</p>
                        <p className="text-muted-foreground">Graceful degradation without internet</p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </div>

                {/* Installation Features */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Installation Features
                  </h3>
                  <div className="grid gap-3 text-sm">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">Add to Home Screen</p>
                        <p className="text-muted-foreground">Install like a native app</p>
                      </div>
                      <StatusBadge status={canInstall ? 'available' : isInstalled ? 'enabled' : 'unavailable'} />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">App Shortcuts</p>
                        <p className="text-muted-foreground">Quick actions from home screen</p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">Share Target</p>
                        <p className="text-muted-foreground">Receive shared content from other apps</p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </div>

                {/* Notification Features */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Push Notifications
                  </h3>
                  <div className="grid gap-3 text-sm">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">Budget Alerts</p>
                        <p className="text-muted-foreground">Get notified when approaching budget limits</p>
                      </div>
                      <StatusBadge status={getFeatureStatus('notifications')} />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">Weekly Reports</p>
                        <p className="text-muted-foreground">Automatic spending summaries</p>
                      </div>
                      <StatusBadge status={getFeatureStatus('notifications')} />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">Goal Reminders</p>
                        <p className="text-muted-foreground">Stay on track with savings goals</p>
                      </div>
                      <StatusBadge status={getFeatureStatus('notifications')} />
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                {notificationPermission !== 'granted' && (
                  <Alert>
                    <Bell className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                      <span>Enable notifications to get the full PWA experience</span>
                      <Button onClick={handleEnableNotifications} size="sm">
                        Enable Now
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}