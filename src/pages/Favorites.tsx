import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RecipeCard } from "@/components/RecipeCard";
import { RecipeModal } from "@/components/RecipeModal";
import { toast } from "@/hooks/use-toast";
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
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fats?: number;
}

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    const checkAuthAndLoadFavorites = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please log in to view your favorites",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      await loadFavorites();
    };

    checkAuthAndLoadFavorites();
  }, [navigate]);

  const loadFavorites = async () => {
    try {
      const { data: favoritesData, error: favError } = await supabase
        .from("favorites")
        .select("recipe_id");

      if (favError) throw favError;

      if (!favoritesData || favoritesData.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      const recipeIds = favoritesData.map((fav) => fav.recipe_id);

      const { data: recipesData, error: recError } = await supabase
        .from("recipes")
        .select("*")
        .in("id", recipeIds);

      if (recError) throw recError;

      setFavorites(recipesData || []);
    } catch (error) {
      console.error("Error loading favorites:", error);
      toast({
        title: "Error",
        description: "Failed to load favorites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16 flex justify-center items-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Favorites</h1>
          <p className="text-muted-foreground">
            {favorites.length} {favorites.length === 1 ? "recipe" : "recipes"} saved
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground mb-4">
              You haven't saved any favorites yet
            </p>
            <p className="text-muted-foreground">
              Explore recipes and click the heart icon to save your favorites
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                title={recipe.title}
                description={recipe.description}
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
        )}
      </main>
      <Footer />

      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          isOpen={!!selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </div>
  );
};

export default Favorites;
