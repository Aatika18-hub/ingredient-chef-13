import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { RecipeGrid } from "@/components/RecipeGrid";
import { MatchedRecipes } from "@/components/MatchedRecipes";
import { HowItWorks } from "@/components/HowItWorks";
import { Footer } from "@/components/Footer";
import { RecipeModal } from "@/components/RecipeModal";

const Index = () => {
  const [detectedIngredients, setDetectedIngredients] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const recipeId = searchParams.get('recipe');
    if (recipeId) {
      // Fetch and display the recipe
      const fetchRecipe = async () => {
        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .eq('id', recipeId)
          .single();
        
        if (data && !error) {
          setSelectedRecipe(data);
          setIsModalOpen(true);
        }
      };
      fetchRecipe();
    }
  }, [searchParams]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecipe(null);
    // Remove the recipe parameter from URL
    searchParams.delete('recipe');
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <Hero onIngredientsDetected={setDetectedIngredients} />
      <MatchedRecipes detectedIngredients={detectedIngredients} />
      <RecipeGrid />
      <HowItWorks />
      <Footer />
      <RecipeModal 
        recipe={selectedRecipe} 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
      />
    </div>
  );
};

export default Index;
