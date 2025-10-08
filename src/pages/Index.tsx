import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { RecipeGrid } from "@/components/RecipeGrid";
import { HowItWorks } from "@/components/HowItWorks";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <RecipeGrid />
      <HowItWorks />
      <Footer />
    </div>
  );
};

export default Index;
