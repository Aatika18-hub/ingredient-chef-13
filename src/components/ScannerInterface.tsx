import { useState, useRef } from "react";
import { Camera, Upload, Loader2, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { classifyIngredient } from "@/lib/browserScanner";

export const ScannerInterface = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [detectedIngredients, setDetectedIngredients] = useState<string[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [useBrowserML, setUseBrowserML] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const { toast } = useToast();

  const compressImageToBase64 = (file: File, maxDim = 1024, quality = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        const scale = Math.min(1, maxDim / Math.max(width, height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas not supported'));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (file: File) => {
    setIsScanning(true);
    setDetectedIngredients([]);

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);

    try {
      if (useBrowserML) {
        // Use browser-based ML model
        const img = new Image();
        img.onload = async () => {
          try {
            const ingredients = await classifyIngredient(img);
            setDetectedIngredients(ingredients);
            toast({
              title: "Ingredients detected (Browser ML)!",
              description: `Found ${ingredients.length} ingredient(s) offline`,
            });
          } catch (error) {
            console.error('Browser ML error:', error);
            toast({
              title: "Browser ML unavailable",
              description: "Falling back to cloud AI...",
              variant: "destructive",
            });
            // Fallback to cloud AI
            await processWithCloudAI(file);
          } finally {
            setIsScanning(false);
          }
        };
        img.src = URL.createObjectURL(file);
      } else {
        // Use cloud AI
        await processWithCloudAI(file);
        setIsScanning(false);
      }
    } catch (error) {
      console.error('Error processing image:', error);
      setIsScanning(false);
    }
  };

  const processWithCloudAI = async (file: File) => {
    // Convert and compress to base64 for faster upload
    toast({ title: "Optimizing image...", description: "Compressing for faster detection" });
    const base64 = await compressImageToBase64(file, 1024, 0.8);

    // Call edge function to detect ingredients
    const { data, error } = await supabase.functions.invoke('detect-ingredients', {
      body: { image: base64 }
    });

    if (error) throw error;

    if (data?.ingredients) {
      setDetectedIngredients(data.ingredients);
      toast({
        title: "Ingredients detected (Cloud AI)!",
        description: `Found ${data.ingredients.length} ingredient(s)`,
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  return (
    <div className="bg-card rounded-2xl p-8 max-w-2xl mx-auto shadow-2xl">
      <div className="text-center mb-6">
        <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Camera className="text-white w-10 h-10" />
        </div>
        <h3 className="text-2xl font-bold text-foreground">Scan Your Ingredient</h3>
        <p className="text-muted-foreground mt-2">
          Upload an image of any food item to find matching recipes
        </p>
      </div>

      <div className="bg-muted/50 rounded-xl p-4 mb-6 border border-border/50">
        <div className="border-2 border-dashed border-border rounded-lg h-64 flex items-center justify-center overflow-hidden bg-background/50 backdrop-blur-sm">
          {previewUrl ? (
            <img ref={imageRef} src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain shadow-lg" />
          ) : (
            <div className="text-center p-8">
              <Camera className="text-muted-foreground w-16 h-16 mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground font-medium">No image selected</p>
              <p className="text-muted-foreground/60 text-sm mt-1">Upload to detect ingredients with Cloud AI</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={useBrowserML}
            onChange={(e) => setUseBrowserML(e.target.checked)}
            className="w-4 h-4"
          />
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm text-foreground">Use Offline Mode (Browser ML)</span>
        </label>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isScanning}
          size="lg"
          className="gradient-primary text-white shadow-button hover:shadow-card-hover transition-all font-semibold"
        >
          {isScanning ? (
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
    </div>
  );
};
