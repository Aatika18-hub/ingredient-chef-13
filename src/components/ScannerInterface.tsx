import { useState, useRef } from "react";
import { Camera, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const ScannerInterface = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [detectedIngredients, setDetectedIngredients] = useState<string[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = async (file: File) => {
    setIsScanning(true);
    setDetectedIngredients([]);

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
          resolve(base64String);
        };
        reader.readAsDataURL(file);
      });

      // Call edge function to detect ingredients
      const { data, error } = await supabase.functions.invoke('detect-ingredients', {
        body: { image: base64 }
      });

      if (error) throw error;

      if (data?.ingredients) {
        setDetectedIngredients(data.ingredients);
        toast({
          title: "Ingredients detected!",
          description: `Found ${data.ingredients.length} ingredient(s)`,
        });
      }
    } catch (error) {
      console.error('Error detecting ingredients:', error);
      toast({
        title: "Error",
        description: "Failed to detect ingredients. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
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
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isScanning}
          className="gradient-primary text-white shadow-button hover:shadow-card-hover transition-all"
        >
          {isScanning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Image
            </>
          )}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
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
    </div>
  );
};
