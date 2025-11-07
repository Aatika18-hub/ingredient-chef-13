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

      // Helper function to check if ingredients match
      const ingredientsMatch = (recipeIngredient: string, detectedIngredient: string): boolean => {
        const recipeLower = recipeIngredient.toLowerCase();
        const detectedLower = detectedIngredient.toLowerCase();
        
        // Direct substring match (covers cases like "chicken" in "800g chicken breast")
        if (recipeLower.includes(detectedLower) || detectedLower.includes(recipeLower)) {
          return true;
        }
        
        // Word-level matching for better accuracy
        const recipeWords = recipeLower.split(/[\s,]+/);
        const detectedWords = detectedLower.split(/[\s,]+/);
        
        // Check if any significant words match (ignore common words)
        const ignoreWords = ['and', 'or', 'with', 'of', 'the', 'a', 'an'];
        const recipeSignificant = recipeWords.filter(w => w.length > 2 && !ignoreWords.includes(w));
        const detectedSignificant = detectedWords.filter(w => w.length > 2 && !ignoreWords.includes(w));
        
        return recipeSignificant.some(rw => 
          detectedSignificant.some(dw => rw.includes(dw) || dw.includes(rw))
        );
      };

      // Filter recipes that contain any of the detected ingredients
      const matchedRecipes = (data as Recipe[]).filter((recipe) =>
        recipe.ingredients.some((ingredient) =>
          detectedIngredients.some((detected) =>
            ingredientsMatch(ingredient, detected)
          )
        )
      );

      // Sort by number of matching ingredients (most matches first)
      return matchedRecipes.sort((a, b) => {
        const aMatches = a.ingredients.filter((ing) =>
          detectedIngredients.some((det) => ingredientsMatch(ing, det))
        ).length;
        const bMatches = b.ingredients.filter((ing) =>
          detectedIngredients.some((det) => ingredientsMatch(ing, det))
        ).length;
        return bMatches - aMatches;
      });
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
