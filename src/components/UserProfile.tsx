import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Bell, 
  Palette, 
  Moon, 
  Sun, 
  Monitor,
  IndianRupee, 
  Edit3, 
  Save, 
  X, 
  Globe,
  Calculator,
  Database,
  Download,
  Upload,
  Calendar
} from 'lucide-react';
import { useFinanceData } from '@/hooks/use-finance-data';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';
import { DataBackup } from '@/components/DataBackup';

export const UserProfile = () => {
  const { expenses, budgets, savingsGoals } = useFinanceData();
  const [userSettings, setUserSettings] = useKV('user-settings', {
    currency: 'INR',
    language: 'en',
    notifications: {
      budgetAlerts: true,
      goalReminders: true,
      weeklyReports: true,
      expenseAlerts: true
    },
    preferences: {
      defaultCategory: 'General',
      budgetPeriod: 'monthly',
      theme: 'system'
    }
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    currency: userSettings.currency,
    language: userSettings.language,
    defaultCategory: userSettings.preferences.defaultCategory,
    budgetPeriod: userSettings.preferences.budgetPeriod,
    theme: userSettings.preferences.theme
  });

  const handleSaveSettings = async () => {
    setUserSettings({
      ...userSettings,
      currency: formData.currency,
      language: formData.language,
      preferences: {
        ...userSettings.preferences,
        defaultCategory: formData.defaultCategory,
        budgetPeriod: formData.budgetPeriod,
        theme: formData.theme
      }
    });
    setIsEditing(false);
    toast.success('Settings saved successfully! ✨');
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setUserSettings({
      ...userSettings,
      notifications: {
        ...userSettings.notifications,
        [key]: value
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Settings & Preferences</h1>
                <p className="text-white/80">
                  Customize your Finance Tracker experience
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings size={16} />
            Settings
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell size={16} />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <Database size={16} />
            Data Backup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Application Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Application Settings
                      </CardTitle>
                      <CardDescription>
                        Configure your app preferences
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (isEditing) {
                          setFormData({
                            currency: userSettings.currency,
                            language: userSettings.language,
                            defaultCategory: userSettings.preferences.defaultCategory,
                            budgetPeriod: userSettings.preferences.budgetPeriod,
                            theme: userSettings.preferences.theme
                          });
                        }
                        setIsEditing(!isEditing);
                      }}
                    >
                      {isEditing ? (
                        <>
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                            <SelectItem value="USD">US Dollar ($)</SelectItem>
                            <SelectItem value="EUR">Euro (€)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select value={formData.language} onValueChange={(value) => setFormData({...formData, language: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                            <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                            <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="defaultCategory">Default Category</Label>
                        <Input
                          id="defaultCategory"
                          value={formData.defaultCategory}
                          onChange={(e) => setFormData({...formData, defaultCategory: e.target.value})}
                          placeholder="Enter default category"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="budgetPeriod">Budget Period</Label>
                        <Select value={formData.budgetPeriod} onValueChange={(value) => setFormData({...formData, budgetPeriod: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select budget period" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="theme">Theme</Label>
                        <Select value={formData.theme} onValueChange={(value) => setFormData({...formData, theme: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select theme" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button onClick={handleSaveSettings} className="w-full">
                        <Save className="w-4 h-4 mr-2" />
                        Save Settings
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <IndianRupee className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Currency</p>
                          <p className="font-medium">{userSettings.currency} - {userSettings.currency === 'INR' ? 'Indian Rupee (₹)' : userSettings.currency === 'USD' ? 'US Dollar ($)' : 'Euro (€)'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Globe className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Language</p>
                          <p className="font-medium">{userSettings.language === 'en' ? 'English' : userSettings.language === 'hi' ? 'Hindi' : userSettings.language === 'ta' ? 'Tamil' : 'Telugu'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Calculator className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Default Category</p>
                          <p className="font-medium">{userSettings.preferences.defaultCategory}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Budget Period</p>
                          <p className="font-medium capitalize">{userSettings.preferences.budgetPeriod}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Data Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Data Overview
                  </CardTitle>
                  <CardDescription>Your financial data at a glance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{expenses.length}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">{budgets.length}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Active Budgets</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{savingsGoals.length}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Savings Goals</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        ₹{expenses.reduce((total, expense) => total + expense.amount, 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Spent</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Manage your notification settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Budget & Spending</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Budget Alerts</p>
                        <p className="text-sm text-gray-500">Get notified when you're close to budget limits</p>
                      </div>
                      <Switch
                        checked={userSettings.notifications.budgetAlerts}
                        onCheckedChange={(checked) => handleNotificationChange('budgetAlerts', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Expense Alerts</p>
                        <p className="text-sm text-gray-500">Notifications for large transactions</p>
                      </div>
                      <Switch
                        checked={userSettings.notifications.expenseAlerts}
                        onCheckedChange={(checked) => handleNotificationChange('expenseAlerts', checked)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Goals & Reports</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Goal Reminders</p>
                        <p className="text-sm text-gray-500">Reminders about your savings goals</p>
                      </div>
                      <Switch
                        checked={userSettings.notifications.goalReminders}
                        onCheckedChange={(checked) => handleNotificationChange('goalReminders', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Weekly Reports</p>
                        <p className="text-sm text-gray-500">Get weekly spending summaries</p>
                      </div>
                      <Switch
                        checked={userSettings.notifications.weeklyReports}
                        onCheckedChange={(checked) => handleNotificationChange('weeklyReports', checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <DataBackup />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};