import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { useApiKey } from '@/hooks/use-api-key';
import { geminiService } from '@/services/gemini';
import { toast } from 'sonner';
import { Key, Shield, CheckCircle, AlertCircle, Eye, EyeOff, Settings, Trash2 } from '@phosphor-icons/react';

export function ApiKeySettings() {
  const { apiKeyData, isLoading, saveApiKey, clearApiKey, validateApiKey, isConfigured } = useApiKey();
  const [inputKey, setInputKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  const handleSave = async () => {
    if (!inputKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    if (!validateApiKey(inputKey)) {
      toast.error('Invalid API key format. Gemini API keys should start with "AIza"');
      return;
    }

    setIsValidating(true);
    
    try {
      // Test the API key before saving
      geminiService.setApiKey(inputKey);
      await geminiService.callGemini('Test connection', 'gemini-1.5-flash');
      
      const result = await saveApiKey(inputKey);
      if (result.success) {
        toast.success('API key saved successfully!');
        setInputKey('');
      } else {
        toast.error(result.error || 'Failed to save API key');
      }
    } catch (error) {
      console.error('API key validation failed:', error);
      toast.error('Invalid API key or connection failed. Please check your key.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleClear = async () => {
    const result = await clearApiKey();
    if (result.success) {
      geminiService.setApiKey('');
      toast.success('API key cleared successfully');
    } else {
      toast.error(result.error || 'Failed to clear API key');
    }
  };

  const testConnection = async () => {
    if (!isConfigured) {
      toast.error('No API key configured');
      return;
    }

    setTestingConnection(true);
    try {
      geminiService.setApiKey(apiKeyData.geminiApiKey);
      await geminiService.callGemini('Hello, this is a connection test.', 'gemini-1.5-flash');
      toast.success('Connection successful! 🎉');
    } catch (error) {
      console.error('Connection test failed:', error);
      toast.error('Connection failed. Please check your API key.');
    } finally {
      setTestingConnection(false);
    }
  };

  // Initialize Gemini service with stored API key
  if (isConfigured && !geminiService.isConfigured()) {
    geminiService.setApiKey(apiKeyData.geminiApiKey);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Status Card */}
      <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">API Configuration Status</CardTitle>
                <CardDescription>
                  Current state of your Gemini AI integration
                </CardDescription>
              </div>
            </div>
            <Badge variant={isConfigured ? "default" : "secondary"} className="gap-1">
              {isConfigured ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <AlertCircle className="h-3 w-3" />
              )}
              {isConfigured ? 'Configured' : 'Not Configured'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isConfigured ? (
            <div className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Your API key is securely stored and ready to use. All AI features are now enabled.
                </AlertDescription>
              </Alert>
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">API Key:</span>
                  <code className="text-xs bg-background px-2 py-1 rounded">
                    {showKey ? apiKeyData.geminiApiKey : '••••••••••••••••••••••••••••'}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={testConnection}
                    disabled={testingConnection}
                  >
                    {testingConnection ? 'Testing...' : 'Test Connection'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleClear}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {apiKeyData.lastUpdated && (
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(apiKeyData.lastUpdated).toLocaleString()}
                </p>
              )}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No API key configured. Add your Gemini API key below to enable AI-powered features.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Configuration Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Settings className="h-5 w-5 text-accent" />
            </div>
            <div>
              <CardTitle>Gemini AI Configuration</CardTitle>
              <CardDescription>
                Add or update your Google Gemini API key to enable AI features
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">Gemini API Key</Label>
            <div className="flex gap-2">
              <Input
                id="api-key"
                type={showKey ? "text" : "password"}
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="AIza..."
                className="font-mono"
              />
              <Button
                variant="outline"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                onClick={handleSave}
                disabled={isValidating || !inputKey.trim()}
              >
                {isValidating ? 'Validating...' : 'Save'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Your API key is stored locally and never shared. Get your free API key from{' '}
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-medium">Features enabled with API key:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { icon: '🤖', title: 'Smart Expense Categorization', desc: 'AI-powered automatic categorization' },
                { icon: '💬', title: 'Financial Chat Assistant', desc: 'Ask questions about your finances' },
                { icon: '📊', title: 'ML Insights & Analytics', desc: 'Advanced spending pattern analysis' },
                { icon: '🔮', title: 'Expense Predictions', desc: 'Predict future spending trends' },
                { icon: '💡', title: 'Personalized Tips', desc: 'Custom financial wellness advice' },
                { icon: '📈', title: 'Smart Budget Planning', desc: 'AI-assisted budget recommendations' }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-lg">{feature.icon}</span>
                  <div>
                    <p className="font-medium text-sm">{feature.title}</p>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Privacy & Security:</strong> Your API key is stored locally in your browser and is never sent to our servers. 
              It's only used to communicate directly with Google's Gemini API.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </motion.div>
  );
}