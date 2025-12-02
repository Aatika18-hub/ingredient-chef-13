import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

interface ShareButtonsProps {
  recipeTitle: string;
  recipeDescription: string;
  recipeId: string;
}

export const ShareButtons = ({ recipeTitle, recipeDescription, recipeId }: ShareButtonsProps) => {
  const baseUrl = window.location.origin + window.location.pathname;
  const recipeUrl = `${baseUrl}?recipe=${recipeId}`;

  const shareToWhatsApp = () => {
    const text = `Check out this recipe: ${recipeTitle}\n${recipeDescription}\n\n${recipeUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
  };

  const shareToInstagram = () => {
    const text = `Check out this recipe: ${recipeTitle}\n${recipeDescription}\n\n${recipeUrl}`;
    
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard!",
        description: "Recipe details copied. Open Instagram and paste to share.",
      });
      
      // Try to open Instagram
      setTimeout(() => {
        window.open("https://www.instagram.com/", "_blank");
      }, 500);
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={shareToWhatsApp}>
          <span className="mr-2">📱</span>
          Share to WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToInstagram}>
          <span className="mr-2">📷</span>
          Copy & Share to Instagram
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
