import { useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { RecipeGrid } from "@/components/RecipeGrid";
import { MatchedRecipes } from "@/components/MatchedRecipes";
import { HowItWorks } from "@/components/HowItWorks";
import { Footer } from "@/components/Footer";

const Index = () => {
  const [detectedIngredients, setDetectedIngredients] = useState<string[]>([]);

  return (
    <div className="min-h-screen">
      <Header />
      <Hero onIngredientsDetected={setDetectedIngredients} />
      <MatchedRecipes detectedIngredients={detectedIngredients} />
      <RecipeGrid />
      <HowItWorks />
      <Footer />
    </div>
  );
};

export default Index;
