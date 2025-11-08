import { X, Clock, Users, ChefHat } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

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

interface RecipeModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RecipeModal = ({ recipe, isOpen, onClose }: RecipeModalProps) => {
  if (!recipe) return null;

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "easy":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "medium":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "hard":
        return "bg-red-500/10 text-red-700 dark:text-red-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getFallbackImage = (cat: string, _title: string) => {
    const c = (cat || '').toLowerCase();
    const map: Record<string, string> = {
      dessert: '/images/categories/dessert.jpg',
      salad: '/images/categories/salad.jpg',
      soup: '/images/categories/soup.jpg',
      breakfast: '/images/categories/breakfast.jpg',
      beverage: '/images/categories/beverage.jpg',
      drink: '/images/categories/beverage.jpg',
      bread: '/images/categories/bread.jpg',
      pasta: '/images/categories/pasta.jpg',
      seafood: '/images/categories/seafood.jpg',
      vegan: '/images/categories/vegan.jpg',
      main: '/images/categories/main.jpg',
      entree: '/images/categories/main.jpg',
    };
    return map[c] || '/images/categories/main.jpg';
  };

  const displayImageUrl = recipe.image_url && recipe.image_url.trim() !== ''
    ? recipe.image_url
    : getFallbackImage(recipe.category, recipe.title);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <div className="relative">
          <div className="h-64 w-full overflow-hidden rounded-t-lg">
            <img
              src={displayImageUrl}
              alt={`${recipe.title} - ${recipe.category} recipe photo`}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = getFallbackImage(recipe.category, recipe.title);
                target.onerror = null;
              }}
            />
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <Badge className={getDifficultyColor(recipe.difficulty)}>
              {recipe.difficulty}
            </Badge>
            <Badge className="bg-primary text-primary-foreground">
              {recipe.category}
            </Badge>
          </div>
        </div>

        <ScrollArea className="max-h-[calc(90vh-16rem)] px-6 pb-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-3xl">{recipe.title}</DialogTitle>
            <p className="text-muted-foreground mt-2">{recipe.description}</p>
          </DialogHeader>

          <div className="flex items-center gap-6 mb-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <div>
                <p className="font-semibold text-foreground">
                  {recipe.prep_time + recipe.cook_time} min
                </p>
                <p className="text-xs">Total Time</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <div>
                <p className="font-semibold text-foreground">{recipe.servings}</p>
                <p className="text-xs">Servings</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ChefHat className="w-5 h-5" />
              <div>
                <p className="font-semibold text-foreground capitalize">
                  {recipe.difficulty}
                </p>
                <p className="text-xs">Difficulty</p>
              </div>
            </div>
          </div>

          {(recipe.calories || recipe.protein || recipe.carbohydrates || recipe.fats) && (
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold mb-3">Nutrition Facts (per serving)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recipe.calories && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{recipe.calories}</div>
                    <div className="text-sm text-muted-foreground">Calories</div>
                  </div>
                )}
                {recipe.protein && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{recipe.protein}g</div>
                    <div className="text-sm text-muted-foreground">Protein</div>
                  </div>
                )}
                {recipe.carbohydrates && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{recipe.carbohydrates}g</div>
                    <div className="text-sm text-muted-foreground">Carbs</div>
                  </div>
                )}
                {recipe.fats && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{recipe.fats}g</div>
                    <div className="text-sm text-muted-foreground">Fats</div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">Ingredients</h3>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">Instructions</h3>
            <ol className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 gradient-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {index + 1}
                  </span>
                  <span className="pt-1">{instruction}</span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag, index) => (
                <Badge key={index} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
