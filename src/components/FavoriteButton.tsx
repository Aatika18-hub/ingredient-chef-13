import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface FavoriteButtonProps {
  recipeId: string;
}

export const FavoriteButton = ({ recipeId }: FavoriteButtonProps) => {
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
        await checkFavoriteStatus(session.user.id);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUserId(session.user.id);
        checkFavoriteStatus(session.user.id);
      } else {
        setUserId(null);
        setIsFavorited(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [recipeId]);

  const checkFavoriteStatus = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", uid)
        .eq("recipe_id", recipeId)
        .maybeSingle();

      if (error) throw error;
      setIsFavorited(!!data);
    } catch (error) {
      console.error("Error checking favorite:", error);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!userId) {
      toast({
        title: "Login required",
        description: "Please log in to save favorites",
      });
      navigate("/auth");
      return;
    }

    setLoading(true);

    try {
      if (isFavorited) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", userId)
          .eq("recipe_id", recipeId);

        if (error) throw error;

        setIsFavorited(false);
        toast({
          title: "Removed from favorites",
        });
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert({ user_id: userId, recipe_id: recipeId });

        if (error) throw error;

        setIsFavorited(true);
        toast({
          title: "Added to favorites",
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleFavorite}
      disabled={loading}
      className="absolute top-3 left-3 z-10 bg-background/80 backdrop-blur-sm hover:bg-background"
    >
      <Heart
        className={`w-5 h-5 ${isFavorited ? "fill-red-500 text-red-500" : "text-foreground"}`}
      />
    </Button>
  );
};
