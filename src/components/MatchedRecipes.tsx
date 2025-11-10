import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RecipeCard } from "./RecipeCard";
import { RecipeModal } from "./RecipeModal";
import { Loader2 } from "lucide-react";

interface Recipe {
  id: string;
  title: string;
  description: string;
  image_url: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: string;
  category: string;
  ingredients: string[];
  instructions: string[];
  tags: string[];
  protein?: number;
  carbohydrates?: number;
  fats?: number;
  calories?: number;
}

interface MatchedRecipesProps {
  detectedIngredients: string[];
}

export const MatchedRecipes = ({ detectedIngredients }: MatchedRecipesProps) => {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const { data: recipes, isLoading } = useQuery({
    queryKey: ["matched-recipes", detectedIngredients],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Normalize ingredient names for better matching
      const normalizeIngredient = (ingredient: string): string => {
        return ingredient
          .toLowerCase()
          .replace(/[^\w\s]/g, '') // Remove punctuation
          .replace(/\b(chopped|diced|sliced|minced|grated|fresh|dried|ground|whole)\b/g, '') // Remove common modifiers
          .replace(/\b\d+\s*(g|kg|ml|l|cup|cups|tablespoon|tablespoons|teaspoon|teaspoons|tbsp|tsp|oz|lb)\b/g, '') // Remove measurements
          .replace(/\s+/g, ' ') // Normalize spaces
          .trim();
      };

      // Helper function to check if ingredients match
      const ingredientsMatch = (recipeIngredient: string, detectedIngredient: string): boolean => {
        const recipeNormalized = normalizeIngredient(recipeIngredient);
        const detectedNormalized = normalizeIngredient(detectedIngredient);
        
        // Direct match after normalization
        if (recipeNormalized.includes(detectedNormalized) || detectedNormalized.includes(recipeNormalized)) {
          return true;
        }
        
        // Word-level matching for compound ingredients
        const ignoreWords = ['and', 'or', 'with', 'of', 'the', 'a', 'an', 'to', 'for'];
        const recipeWords = recipeNormalized.split(/\s+/).filter(w => w.length > 2 && !ignoreWords.includes(w));
        const detectedWords = detectedNormalized.split(/\s+/).filter(w => w.length > 2 && !ignoreWords.includes(w));
        
        // Must match at least one significant word
        return recipeWords.some(rw => 
          detectedWords.some(dw => {
            // Match if words are very similar (at least 80% of shorter word matches)
            const minLen = Math.min(rw.length, dw.length);
            return (rw.includes(dw) || dw.includes(rw)) && minLen >= 3;
          })
        );
      };

      // Filter and score recipes based on ingredient matches
      const matchedRecipes = (data as Recipe[])
        .map((recipe) => {
          const matchedIngredients = recipe.ingredients.filter((ingredient) =>
            detectedIngredients.some((detected) => ingredientsMatch(ingredient, detected))
          );
          
          return {
            ...recipe,
            matchCount: matchedIngredients.length,
            matchedIngredients
          };
        })
        .filter((recipe) => recipe.matchCount > 0) // Only include recipes with at least one match
        .sort((a, b) => b.matchCount - a.matchCount); // Sort by number of matches

      console.log('Detected ingredients:', detectedIngredients);
      console.log('Matched recipes:', matchedRecipes.map(r => ({
        title: r.title,
        matchCount: r.matchCount,
        matchedIngredients: r.matchedIngredients
      })));

      return matchedRecipes;
    },
    enabled: detectedIngredients.length > 0,
  });

  if (detectedIngredients.length === 0) return null;

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4">Recipes You Can Make</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Based on the ingredients we detected, here are some delicious recipes for you
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="inline-block h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Finding matching recipes...</p>
          </div>
        ) : recipes && recipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.slice(0, 6).map((recipe) => (
              <RecipeCard
                key={recipe.id}
                title={recipe.title}
                description={recipe.description || ""}
                imageUrl={recipe.image_url}
                prepTime={recipe.prep_time}
                cookTime={recipe.cook_time}
                servings={recipe.servings}
                difficulty={recipe.difficulty}
                category={recipe.category}
                tags={recipe.tags}
                calories={recipe.calories}
                protein={recipe.protein}
                onClick={() => setSelectedRecipe(recipe)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-xl">
            <p className="text-muted-foreground text-lg">
              No exact recipe matches found for these ingredients.
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              Try scanning different ingredients or browse all recipes below.
            </p>
          </div>
        )}
      </div>

      <RecipeModal
        recipe={selectedRecipe}
        isOpen={!!selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
      />
    </section>
  );
};
