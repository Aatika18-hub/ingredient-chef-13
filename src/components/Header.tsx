import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Heart, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You've been successfully logged out",
    });
    navigate("/");
  };

  return (
    <header className="bg-card shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center space-x-3 cursor-pointer">
            <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CookScan
            </h1>
          </button>

          <nav className="hidden md:flex space-x-8 items-center">
            <a href="#" className="text-foreground/60 hover:text-primary transition-colors font-medium">
              Home
            </a>
            <a href="#recipes" className="text-foreground/60 hover:text-primary transition-colors font-medium">
              Recipes
            </a>
            <a href="#how-it-works" className="text-foreground/60 hover:text-primary transition-colors font-medium">
              How It Works
            </a>
            {user && (
              <button
                onClick={() => navigate("/favorites")}
                className="text-foreground/60 hover:text-primary transition-colors font-medium flex items-center gap-2"
              >
                <Heart className="w-4 h-4" />
                Favorites
              </button>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/favorites")}
                  className="hidden sm:flex"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Favorites
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Button
                className="gradient-primary text-white shadow-button hover:shadow-card-hover transition-all"
                onClick={() => navigate("/auth")}
              >
                <User className="w-4 h-4 mr-2" />
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
