import { useState, useRef, useEffect } from "react";
import { Camera, Upload, Loader2, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

interface BrowserMLScannerProps {
  onIngredientsDetected: (ingredients: string[]) => void;
}

export const BrowserMLScanner = ({ onIngredientsDetected }: BrowserMLScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [detectedIngredients, setDetectedIngredients] = useState<string[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [modelLoaded, setModelLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const classifierRef = useRef<any>(null);
  const { toast } = useToast();

  const analyzeImageWithML = async (imageFile: File) => {
    setIsScanning(true);
    setDetectedIngredients([]);

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(imageFile);

    try {
      toast({
        title: "Loading AI model...",
        description: "First-time setup may take a moment",
      });

      setIsModelLoading(true);

      const getClassifier = async () => {
        try {
          return await pipeline(
            'image-classification',
            'onnx-community/mobilenetv4_conv_small.e2400_r224_in1k',
            { device: 'webgpu' }
          );
        } catch {
          // Fallback to WASM if WebGPU unsupported
          return await pipeline(
            'image-classification',
            'onnx-community/mobilenetv4_conv_small.e2400_r224_in1k',
            { device: 'wasm' }
          );
        }
      };

      const classifier = await getClassifier();

      setModelLoaded(true);
      setIsModelLoading(false);

      toast({
        title: "Analyzing image...",
        description: "Using AI to detect ingredients",
      });

      // Resize image to 224x224 for fast inference
      const resizedDataUrl = await new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 224; canvas.height = 224;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas not supported'));
          ctx.drawImage(img, 0, 0, 224, 224);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(imageFile);
      });

      const results: any[] = await classifier(resizedDataUrl);

      // Extract top predictions as ingredients
      const ingredients = (results || [])
        .slice(0, 5)
        .filter((r: any) => (r.score ?? 0) > 0.15)
        .map((r: any) => String(r.label).replace(/_/g, ' '));

      setDetectedIngredients(ingredients.length > 0 ? ingredients : ['mixed ingredients']);
      onIngredientsDetected(ingredients.length > 0 ? ingredients : ['mixed ingredients']);
      
      toast({
        title: "Detection complete!",
        description: `Found ${ingredients.length || 1} potential ingredient(s)`,
      });
    } catch (error) {
      console.error('Browser ML error:', error);
      toast({
        title: "Error",
        description: "Failed to detect ingredients. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
      setIsModelLoading(false);
    }
  };

  useEffect(() => {
    // Preload model on mount and perform a tiny warm-up to reduce first-run latency
    (async () => {
      try {
        setIsModelLoading(true);
        const getClassifier = async () => {
          try {
            return await pipeline(
              'image-classification',
              'onnx-community/mobilenetv4_conv_small.e2400_r224_in1k',
              { device: 'webgpu' }
            );
          } catch {
            return await pipeline(
              'image-classification',
              'onnx-community/mobilenetv4_conv_small.e2400_r224_in1k',
              { device: 'wasm' }
            );
          }
        };
        classifierRef.current = await getClassifier();
        // Warm-up with a blank image
        const canvas = document.createElement('canvas');
        canvas.width = 224; canvas.height = 224;
        await classifierRef.current(canvas.toDataURL('image/jpeg', 0.5));
        setModelLoaded(true);
      } catch (e) {
        console.warn('Model preload failed (will load on demand):', e);
      } finally {
        setIsModelLoading(false);
      }
    })();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      analyzeImageWithML(file);
    }
  };

  return (
    <div className="bg-card rounded-2xl p-8 max-w-2xl mx-auto shadow-elegant">
      <div className="text-center mb-6">
        <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Zap className="text-white w-10 h-10" />
        </div>
        <h3 className="text-2xl font-bold text-foreground">Browser AI Scanner</h3>
        <p className="text-muted-foreground mt-2">
          Fast, offline ingredient detection using in-browser AI
        </p>
        {modelLoaded && (
          <p className="text-sm text-primary mt-1">✓ AI Model loaded and ready</p>
        )}
      </div>

      <div className="bg-muted/50 rounded-xl p-4 mb-6 border border-border/50">
        <div className="border-2 border-dashed border-border rounded-lg h-64 flex items-center justify-center overflow-hidden bg-background/50 backdrop-blur-sm">
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain shadow-lg" />
          ) : (
            <div className="text-center p-8">
              <Camera className="text-muted-foreground w-16 h-16 mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground font-medium">No image selected</p>
              <p className="text-muted-foreground/60 text-sm mt-1">Upload to detect ingredients with AI</p>
            </div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isScanning || isModelLoading}
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isScanning || isModelLoading}
          size="lg"
          className="gradient-primary text-white shadow-button hover:shadow-card-hover transition-all font-semibold"
        >
          {isModelLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading AI Model...
            </>
          ) : isScanning ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-5 w-5" />
              {previewUrl ? 'Upload Another Image' : 'Upload & Scan Image'}
            </>
          )}
        </Button>
      </div>

      {detectedIngredients.length > 0 && (
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 border border-primary/20">
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Detected Ingredients:
          </h4>
          <div className="flex flex-wrap gap-2">
            {detectedIngredients.map((ingredient, index) => (
              <span
                key={index}
                className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-in fade-in zoom-in-50 duration-300"
                style={{ animationDelay: `${index * 75}ms` }}
              >
                {ingredient}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-muted-foreground text-center">
        <p>⚡ Powered by HuggingFace Transformers • Works offline after first load</p>
      </div>
    </div>
  );
};
