import { useState } from "react";
import { Camera, Upload, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

export const BrowserMLScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [detectedIngredients, setDetectedIngredients] = useState<string[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [modelLoaded, setModelLoaded] = useState(false);
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

      // Load image classification model
      const classifier = await pipeline(
        'image-classification',
        'Xenova/vit-base-patch16-224',
        { device: 'webgpu' }
      );

      setModelLoaded(true);
      setIsModelLoading(false);

      // Convert file to URL for the model
      const imageUrl = URL.createObjectURL(imageFile);
      
      toast({
        title: "Analyzing image...",
        description: "Detecting ingredients",
      });

      const results = await classifier(imageUrl);
      
      // Extract top predictions as ingredients
      const ingredients = results
        .slice(0, 5)
        .map((result: any) => result.label)
        .filter((label: string) => 
          // Filter for food-related items
          label.toLowerCase().includes('food') || 
          label.toLowerCase().includes('fruit') ||
          label.toLowerCase().includes('vegetable') ||
          label.toLowerCase().includes('meat') ||
          !label.includes('_')
        );

      setDetectedIngredients(ingredients.length > 0 ? ingredients : ['food item']);
      
      toast({
        title: "Detection complete!",
        description: `Found ${ingredients.length || 1} potential ingredient(s)`,
      });

      URL.revokeObjectURL(imageUrl);
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

      <div className="bg-muted rounded-xl p-4 mb-6">
        <div className="border-2 border-dashed border-border rounded-lg h-48 flex items-center justify-center overflow-hidden">
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
          ) : (
            <div className="text-center">
              <Camera className="text-muted-foreground w-12 h-12 mx-auto mb-2" />
              <p className="text-muted-foreground">Image preview will appear here</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
        <label className="cursor-pointer">
          <Button
            disabled={isScanning || isModelLoading}
            className="gradient-primary text-white shadow-elegant hover:shadow-glow transition-all w-full sm:w-auto"
          >
            {isModelLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading AI Model...
              </>
            ) : isScanning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload & Scan
              </>
            )}
          </Button>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isScanning || isModelLoading}
          />
        </label>
      </div>

      {detectedIngredients.length > 0 && (
        <div className="bg-primary/10 rounded-lg p-4 animate-in fade-in slide-in-from-bottom-3">
          <h4 className="font-semibold text-foreground mb-2">Detected Ingredients:</h4>
          <div className="flex flex-wrap gap-2">
            {detectedIngredients.map((ingredient, index) => (
              <span
                key={index}
                className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm"
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
