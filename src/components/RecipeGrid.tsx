import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RecipeCard } from "./RecipeCard";
import { RecipeModal } from "./RecipeModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Heart, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const CATEGORIES = [
  "All",
  "Appetizer",
  "Breakfast", 
  "Chinese",
  "Dessert",
  "Indian",
  "Italian",
  "Japanese",
  "Main Course",
  "Mexican",
  "Salad",
  "Snack",
];

export const RecipeGrid = () => {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
        await loadFavorites(session.user.id);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUserId(session.user.id);
        loadFavorites(session.user.id);
      } else {
        setUserId(null);
        setFavorites([]);
        setShowFavoritesOnly(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadFavorites = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from("favorites")
        .select("recipe_id")
        .eq("user_id", uid);

      if (error) throw error;
      setFavorites(data?.map((fav) => fav.recipe_id) || []);
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  };

  const { data: recipes, isLoading } = useQuery({
    queryKey: ["recipes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Recipe[];
    },
  });

  // Helper function to normalize ingredient text for better matching
  const normalizeIngredient = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[\d½¼¾⅓⅔⅛⅜⅝⅞]+/g, '') // Remove numbers and fractions
      .replace(/\b(cup|cups|tbsp|tsp|tablespoon|teaspoon|oz|ounce|lb|pound|g|gram|kg|ml|liter|litre|piece|pieces|slice|slices|clove|cloves|bunch|bunches|can|cans|package|pkg|pinch|dash|to taste|large|medium|small|fresh|dried|chopped|minced|diced|sliced|grated|crushed|ground|whole|boneless|skinless|raw|cooked|optional)\b/gi, '')
      .replace(/[^a-z\s]/g, '')
      .trim();
  };

  // Helper to get canonical ingredient names (synonyms)
  const getCanonicalName = (ingredient: string): string => {
    const synonyms: Record<string, string> = {
      'cilantro': 'coriander', 'coriander': 'coriander',
      'chilli': 'chili', 'chili': 'chili', 'chile': 'chili',
      'capsicum': 'bell pepper', 'bell pepper': 'bell pepper',
      'aubergine': 'eggplant', 'eggplant': 'eggplant',
      'courgette': 'zucchini', 'zucchini': 'zucchini',
      'prawns': 'shrimp', 'shrimp': 'shrimp',
      'spring onion': 'green onion', 'scallion': 'green onion', 'green onion': 'green onion',
    };
    return synonyms[ingredient] || ingredient;
  };

  // Tokenize and check if search term matches any ingredient word
  const ingredientMatchesSearch = (ingredient: string, searchTerm: string): boolean => {
    const normalizedIng = normalizeIngredient(ingredient);
    const normalizedSearch = normalizeIngredient(searchTerm);
    
    if (!normalizedSearch) return false;
    
    // Direct inclusion check
    if (normalizedIng.includes(normalizedSearch)) return true;
    
    // Tokenize and check individual words
    const ingTokens = normalizedIng.split(/\s+/).filter(t => t.length > 1);
    const searchTokens = normalizedSearch.split(/\s+/).filter(t => t.length > 1);
    
    // Check if any search token matches any ingredient token (with canonical names)
    return searchTokens.some(searchToken => {
      const canonicalSearch = getCanonicalName(searchToken);
      return ingTokens.some(ingToken => {
        const canonicalIng = getCanonicalName(ingToken);
        return canonicalIng.includes(canonicalSearch) || 
               canonicalSearch.includes(canonicalIng) ||
               ingToken.startsWith(searchToken) ||
               searchToken.startsWith(ingToken);
      });
    });
  };

  const filteredRecipes = recipes?.filter((recipe) => {
    const searchLower = searchQuery.toLowerCase();
    
    const matchesTitle = recipe.title.toLowerCase().includes(searchLower);
    const matchesDescription = recipe.description?.toLowerCase().includes(searchLower);
    const matchesTags = recipe.tags?.some((tag) => tag.toLowerCase().includes(searchLower));
    const matchesCategory = recipe.category?.toLowerCase().includes(searchLower);
    
    // Enhanced ingredient matching
    const matchesIngredients = recipe.ingredients?.some((ing) => 
      ingredientMatchesSearch(ing, searchQuery)
    );

    const matchesSearch = matchesTitle || matchesDescription || matchesTags || matchesCategory || matchesIngredients;
    const matchesFavorites = !showFavoritesOnly || favorites.includes(recipe.id);
    const matchesCategoryFilter = selectedCategory === "All" || recipe.category === selectedCategory;

    return matchesSearch && matchesFavorites && matchesCategoryFilter;
  });

  return (
    <section className="py-16 bg-muted/30" id="recipes">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4">Featured Recipes</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Discover our most popular recipes that our community loves
          </p>

          <div className="max-w-3xl mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search recipes by name, ingredient, or tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[180px] h-12">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {userId && (
              <div className="flex justify-center">
                <Button
                  variant={showFavoritesOnly ? "default" : "outline"}
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className="gap-2"
                >
                  <Heart className={`w-4 h-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
                  {showFavoritesOnly ? "Show All Recipes" : "Show Favorites Only"}
                </Button>
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading recipes...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRecipes?.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                id={recipe.id}
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
        )}

        {filteredRecipes?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No recipes found matching your search.</p>
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
