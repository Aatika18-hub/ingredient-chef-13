import { Clock, Users, ChefHat } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RecipeCardProps {
  title: string;
  description: string;
  imageUrl: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: string;
  category: string;
  tags: string[];
  calories?: number;
  protein?: number;
  onClick: () => void;
}

export const RecipeCard = ({
  title,
  description,
  imageUrl,
  prepTime,
  cookTime,
  servings,
  difficulty,
  category,
  tags,
  calories,
  protein,
  onClick,
}: RecipeCardProps) => {
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

  return (
    <Card
      className="cursor-pointer transition-all duration-300 hover:-translate-y-2 shadow-card hover:shadow-card-hover overflow-hidden group"
      onClick={onClick}
    >
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/5 to-accent/5">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&q=80';
            target.onerror = null;
          }}
        />
        <div className="absolute top-3 right-3">
          <Badge className={getDifficultyColor(difficulty)}>{difficulty}</Badge>
        </div>
        <div className="absolute top-3 left-3">
          <Badge className="bg-primary text-primary-foreground">{category}</Badge>
        </div>
      </div>

      <CardHeader>
        <CardTitle className="text-xl line-clamp-1">{title}</CardTitle>
        <CardDescription className="line-clamp-2">{description}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{prepTime + cookTime} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{servings} servings</span>
          </div>
          <div className="flex items-center gap-1">
            <ChefHat className="w-4 h-4" />
            <span className="capitalize">{difficulty}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{tags.length - 3}
            </Badge>
          )}
        </div>

        {(calories || protein) && (
          <div className="flex gap-4 mt-4 pt-4 border-t border-border text-sm">
            {calories && (
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">🔥</span>
                <span className="font-semibold">{calories}</span>
                <span className="text-muted-foreground text-xs">cal</span>
              </div>
            )}
            {protein && (
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">💪</span>
                <span className="font-semibold">{protein}g</span>
                <span className="text-muted-foreground text-xs">protein</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
