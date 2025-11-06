import { useState } from "react";
import { Plus, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface ManualIngredientInputProps {
  onIngredientsDetected: (ingredients: string[]) => void;
}

export const ManualIngredientInput = ({ onIngredientsDetected }: ManualIngredientInputProps) => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const { toast } = useToast();

  const addIngredient = () => {
    const trimmed = currentInput.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      const updated = [...ingredients, trimmed];
      setIngredients(updated);
      setCurrentInput("");
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIngredient();
    }
  };

  const findRecipes = () => {
    if (ingredients.length === 0) {
      toast({
        title: "No ingredients",
        description: "Please add at least one ingredient",
        variant: "destructive",
      });
      return;
    }
    
    onIngredientsDetected(ingredients);
    toast({
      title: "Finding recipes!",
      description: `Searching with ${ingredients.length} ingredient(s)`,
    });
  };

  return (
    <div className="bg-card rounded-2xl p-8 max-w-2xl mx-auto shadow-elegant">
      <div className="text-center mb-6">
        <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="text-white w-10 h-10" />
        </div>
        <h3 className="text-2xl font-bold text-foreground">Type Your Ingredients</h3>
        <p className="text-muted-foreground mt-2">
          Enter ingredients manually to find matching recipes
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="e.g., tomatoes, chicken, garlic..."
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={addIngredient} variant="outline">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {ingredients.length > 0 && (
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-6 border border-primary/20">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Your Ingredients:
            </h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {ingredients.map((ingredient, index) => (
                <span
                  key={index}
                  className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center gap-2"
                >
                  {ingredient}
                  <button
                    onClick={() => removeIngredient(index)}
                    className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={findRecipes}
          disabled={ingredients.length === 0}
          size="lg"
          className="w-full gradient-primary text-white shadow-button hover:shadow-card-hover transition-all font-semibold"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          Find Recipes ({ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''})
        </Button>
      </div>
    </div>
  );
};
