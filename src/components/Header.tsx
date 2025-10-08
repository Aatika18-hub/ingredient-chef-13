import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="bg-card shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CookScan
            </h1>
          </div>

          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-foreground/60 hover:text-primary transition-colors font-medium">
              Home
            </a>
            <a href="#recipes" className="text-foreground/60 hover:text-primary transition-colors font-medium">
              Recipes
            </a>
            <a href="#how-it-works" className="text-foreground/60 hover:text-primary transition-colors font-medium">
              How It Works
            </a>
          </nav>

          <Button className="gradient-primary text-white shadow-button hover:shadow-card-hover transition-all">
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
};
