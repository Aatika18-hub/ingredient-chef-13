import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface RatingStarsProps {
  recipeId: string;
  size?: "sm" | "md" | "lg";
  showAverage?: boolean;
}

export const RatingStars = ({ recipeId, size = "md", showAverage = true }: RatingStarsProps) => {
  const navigate = useNavigate();
  const [userRating, setUserRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
        await loadUserRating(session.user.id);
      }
    };

    checkAuth();
    loadAverageRating();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUserId(session.user.id);
        loadUserRating(session.user.id);
      } else {
        setUserId(null);
        setUserRating(0);
      }
    });

    return () => subscription.unsubscribe();
  }, [recipeId]);

  const loadUserRating = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from("ratings")
        .select("rating")
        .eq("user_id", uid)
        .eq("recipe_id", recipeId)
        .maybeSingle();

      if (error) throw error;
      setUserRating(data?.rating || 0);
    } catch (error) {
      console.error("Error loading user rating:", error);
    }
  };

  const loadAverageRating = async () => {
    try {
      const { data, error } = await supabase
        .from("ratings")
        .select("rating")
        .eq("recipe_id", recipeId);

      if (error) throw error;

      if (data && data.length > 0) {
        const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
        setAverageRating(sum / data.length);
        setTotalRatings(data.length);
      } else {
        setAverageRating(0);
        setTotalRatings(0);
      }
    } catch (error) {
      console.error("Error loading average rating:", error);
    }
  };

  const handleRating = async (rating: number) => {
    if (!userId) {
      toast({
        title: "Login required",
        description: "Please log in to rate recipes",
      });
      navigate("/auth");
      return;
    }

    try {
      const { error } = await supabase
        .from("ratings")
        .upsert(
          { user_id: userId, recipe_id: recipeId, rating },
          { onConflict: "user_id,recipe_id" }
        );

      if (error) throw error;

      setUserRating(rating);
      await loadAverageRating();
      toast({
        title: "Rating saved",
        description: `You rated this recipe ${rating} star${rating !== 1 ? "s" : ""}`,
      });
    } catch (error) {
      console.error("Error saving rating:", error);
      toast({
        title: "Error",
        description: "Failed to save rating",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRating(star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            className="cursor-pointer transition-transform hover:scale-110"
          >
            <Star
              className={`${sizeClasses[size]} ${
                star <= (hoveredStar || userRating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
      {showAverage && totalRatings > 0 && (
        <p className="text-sm text-muted-foreground">
          {averageRating.toFixed(1)} ({totalRatings} rating{totalRatings !== 1 ? "s" : ""})
        </p>
      )}
    </div>
  );
};
