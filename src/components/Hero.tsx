import { useState } from "react";
import { ScannerInterface } from "./ScannerInterface";
import { BrowserMLScanner } from "./BrowserMLScanner";
import { ManualIngredientInput } from "./ManualIngredientInput";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cloud, Zap, PenLine } from "lucide-react";

interface HeroProps {
  onIngredientsDetected: (ingredients: string[]) => void;
}

export const Hero = ({ onIngredientsDetected }: HeroProps) => {
  return (
    <section className="gradient-hero text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-5xl md:text-6xl font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          Scan. Cook. Enjoy.
        </h2>
        <p className="text-xl mb-12 max-w-2xl mx-auto opacity-95 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-150">
          Discover amazing recipes by scanning your ingredients. CookScan turns
          your kitchen staples into culinary masterpieces.
        </p>

        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="mb-6 bg-white/10 backdrop-blur-sm">
              <TabsTrigger value="manual" className="gap-2">
                <PenLine className="w-4 h-4" />
                Type Ingredients
              </TabsTrigger>
              <TabsTrigger value="cloud" className="gap-2">
                <Cloud className="w-4 h-4" />
                Cloud AI Scan
              </TabsTrigger>
              <TabsTrigger value="browser" className="gap-2">
                <Zap className="w-4 h-4" />
                Browser AI Scan
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual">
              <ManualIngredientInput onIngredientsDetected={onIngredientsDetected} />
            </TabsContent>
            
            <TabsContent value="cloud">
              <ScannerInterface onIngredientsDetected={onIngredientsDetected} />
            </TabsContent>
            
            <TabsContent value="browser">
              <BrowserMLScanner onIngredientsDetected={onIngredientsDetected} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
};
