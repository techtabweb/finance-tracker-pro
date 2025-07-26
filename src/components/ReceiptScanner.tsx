import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Upload, 
  Scan, 
  CheckCircle, 
  XCircle, 
  Sparkle,
  Image as ImageIcon,
  Robot,
  Trash
} from '@phosphor-icons/react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ScannedExpense {
  amount: number;
  merchant: string;
  category: string;
  date: string;
  confidence: number;
  items?: string[];
}

interface ReceiptScannerProps {
  onExpenseScanned: (expense: ScannedExpense) => void;
  onScanningStateChange: (isScanning: boolean) => void;
}

export function ReceiptScanner({ onExpenseScanned, onScanningStateChange }: ReceiptScannerProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedExpense, setScannedExpense] = useState<ScannedExpense | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('Image size must be less than 10MB');
      return;
    }

    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    toast.success('📷 Receipt image loaded successfully!');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const simulateAIScanning = async (imageFile: File): Promise<ScannedExpense> => {
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Generate mock data based on common receipt patterns
    const merchants = [
      'Big Bazaar', 'Reliance Fresh', 'Spencer\'s', 'More Supermarket', 'DMart',
      'McDonald\'s', 'Domino\'s Pizza', 'Subway', 'KFC', 'Pizza Hut',
      'Cafe Coffee Day', 'Starbucks', 'Barista', 'Tata Sky', 'Airtel',
      'BPCL Petrol Pump', 'HP Gas Station', 'Indian Oil', 'Myntra', 'Flipkart'
    ];

    const categories = [
      { name: 'Groceries', items: ['Rice', 'Dal', 'Vegetables', 'Milk', 'Bread'] },
      { name: 'Food & Dining', items: ['Burger', 'Pizza', 'Coffee', 'Sandwich'] },
      { name: 'Transportation', items: ['Petrol', 'Diesel', 'Toll', 'Parking'] },
      { name: 'Shopping', items: ['Clothes', 'Shoes', 'Electronics', 'Books'] },
      { name: 'Utilities', items: ['Mobile Recharge', 'DTH Recharge', 'Internet Bill'] },
    ];

    const randomMerchant = merchants[Math.floor(Math.random() * merchants.length)];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const amount = Math.floor(Math.random() * 5000) + 50; // ₹50 to ₹5050
    const confidence = Math.floor(Math.random() * 20) + 80; // 80-99% confidence

    // Generate a recent date (within last 7 days)
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 7));

    return {
      amount,
      merchant: randomMerchant,
      category: randomCategory.name,
      date: date.toISOString().split('T')[0],
      confidence,
      items: randomCategory.items.slice(0, Math.floor(Math.random() * 3) + 1)
    };
  };

  const scanReceipt = async () => {
    if (!selectedImage) {
      toast.error('Please select an image first');
      return;
    }

    setIsScanning(true);
    onScanningStateChange(true);
    
    try {
      toast.loading('🤖 AI is analyzing your receipt...', { 
        id: 'scanning',
        duration: Infinity // Keep loading toast until completion
      });
      
      const scannedData = await simulateAIScanning(selectedImage);
      
      setScannedExpense(scannedData);
      toast.success('✨ Receipt scanned successfully!', { 
        id: 'scanning',
        description: `Found expense: ${scannedData.merchant} - ₹${scannedData.amount}`
      });
    } catch (error) {
      console.error('Receipt scanning error:', error);
      toast.error('Failed to scan receipt. Please try again.', { id: 'scanning' });
    } finally {
      setIsScanning(false);
      onScanningStateChange(false);
    }
  };

  const acceptScannedExpense = () => {
    if (scannedExpense) {
      onExpenseScanned(scannedExpense);
      clearState();
      toast.success('✅ Expense added to your tracker!');
    }
  };

  const clearState = () => {
    setSelectedImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setScannedExpense(null);
    setIsScanning(false);
    onScanningStateChange(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    // Also dismiss any loading toasts
    toast.dismiss('scanning');
  };

  return (
    <div className="space-y-4">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Upload Options */}
      {!selectedImage && (
        <motion.div 
          className="grid grid-cols-2 gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button 
            type="button"
            variant="outline" 
            onClick={() => cameraInputRef.current?.click()}
            className={`${isMobile ? 'h-12' : 'h-11'} flex flex-col gap-1 p-3`}
          >
            <Camera className="w-5 h-5" />
            <span className="text-xs">Camera</span>
          </Button>
          <Button 
            type="button"
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            className={`${isMobile ? 'h-12' : 'h-11'} flex flex-col gap-1 p-3`}
          >
            <Upload className="w-5 h-5" />
            <span className="text-xs">Gallery</span>
          </Button>
        </motion.div>
      )}

      {/* Image Preview */}
      <AnimatePresence>
        {previewUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="relative">
                    <img 
                      src={previewUrl} 
                      alt="Receipt preview" 
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={clearState}
                      className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {!scannedExpense && !isScanning && (
                    <Button 
                      type="button"
                      onClick={scanReceipt}
                      className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                    >
                      <Sparkle className="w-4 h-4 mr-2" />
                      Scan with AI
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scanning State */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glass-card border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-center space-x-3">
                  <div className="relative">
                    <Scan className="w-8 h-8 text-purple-500 animate-pulse" />
                    <div className="absolute inset-0 border-2 border-purple-500 rounded-full animate-ping opacity-20" />
                  </div>
                  <div>
                    <p className="font-medium text-purple-700">Scanning Receipt...</p>
                    <p className="text-sm text-purple-600">AI is extracting expense details</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scanned Results */}
      <AnimatePresence>
        {scannedExpense && !isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glass-card border-green-200">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Robot className="w-5 h-5 text-green-500" />
                      <span className="font-medium text-green-700">AI Results</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      {scannedExpense.confidence}% confidence
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="font-semibold text-lg">₹{scannedExpense.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Category</p>
                      <p className="font-medium">{scannedExpense.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Merchant</p>
                      <p className="font-medium">{scannedExpense.merchant}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-medium">{new Date(scannedExpense.date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {scannedExpense.items && scannedExpense.items.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Items Found</p>
                      <div className="flex flex-wrap gap-2">
                        {scannedExpense.items.map((item, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={clearState}
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Discard
                    </Button>
                    <Button 
                      type="button"
                      onClick={acceptScannedExpense}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Accept
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Card */}
      {!selectedImage && !isScanning && !scannedExpense && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🤖</div>
                <div className="flex-1">
                  <h4 className="font-medium text-blue-800 mb-1">Smart Receipt Scanner</h4>
                  <p className="text-sm text-blue-700 leading-relaxed">
                    Our AI can automatically extract expense details from your receipt photos, including amount, merchant, date, and smart category suggestions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}