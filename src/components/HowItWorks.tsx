import { Camera, Search, ChefHat } from "lucide-react";

export const HowItWorks = () => {
  const steps = [
    {
      icon: Camera,
      title: "1. Scan",
      description: "Use your camera to scan any ingredient or food item",
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      icon: Search,
      title: "2. Discover",
      description: "Find matching recipes from our extensive database",
      color: "bg-purple-500/10 text-purple-600",
    },
    {
      icon: ChefHat,
      title: "3. Cook",
      description: "Follow step-by-step instructions to create your meal",
      color: "bg-green-500/10 text-green-600",
    },
  ];

  return (
    <section className="py-16 bg-card" id="how-it-works">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">How CookScan Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to transform your ingredients into delicious meals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-lg transition-all duration-300 hover:shadow-card"
            >
              <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <step.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
