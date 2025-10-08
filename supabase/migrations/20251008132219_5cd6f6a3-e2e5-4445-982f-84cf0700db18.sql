-- Create recipes table for storing recipe data
CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  prep_time INTEGER, -- in minutes
  cook_time INTEGER, -- in minutes
  servings INTEGER,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category TEXT NOT NULL,
  ingredients TEXT[] NOT NULL,
  instructions TEXT[] NOT NULL,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Anyone can view recipes" 
ON public.recipes 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_recipes_updated_at
BEFORE UPDATE ON public.recipes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample recipes
INSERT INTO public.recipes (title, description, image_url, prep_time, cook_time, servings, difficulty, category, ingredients, instructions, tags) VALUES
('Classic Spaghetti Carbonara', 'A traditional Italian pasta dish with creamy egg sauce and crispy bacon', 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&auto=format&fit=crop', 15, 20, 4, 'medium', 'Italian', 
  ARRAY['400g spaghetti', '200g pancetta or bacon', '4 large eggs', '100g Parmesan cheese', 'Black pepper', 'Salt'],
  ARRAY['Cook spaghetti according to package directions', 'Fry pancetta until crispy', 'Beat eggs with grated Parmesan', 'Drain pasta and mix with pancetta', 'Remove from heat and stir in egg mixture', 'Season with black pepper and serve'],
  ARRAY['pasta', 'italian', 'dinner', 'bacon', 'eggs']),

('Chicken Tikka Masala', 'Tender chicken in a rich, creamy tomato sauce with aromatic spices', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&auto=format&fit=crop', 30, 40, 6, 'medium', 'Indian',
  ARRAY['800g chicken breast', '1 cup yogurt', '2 onions', '4 tomatoes', '3 cloves garlic', 'Ginger', 'Heavy cream', 'Garam masala', 'Turmeric', 'Cumin', 'Coriander'],
  ARRAY['Marinate chicken in yogurt and spices for 2 hours', 'Grill or pan-fry chicken pieces', 'Sauté onions, garlic, and ginger', 'Add tomatoes and spices', 'Simmer sauce for 20 minutes', 'Add chicken and cream', 'Garnish with cilantro and serve'],
  ARRAY['chicken', 'indian', 'curry', 'dinner', 'spicy']),

('Caesar Salad', 'Fresh romaine lettuce with creamy Caesar dressing and croutons', 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=800&auto=format&fit=crop', 15, 0, 4, 'easy', 'Salad',
  ARRAY['2 romaine lettuce heads', '1 cup croutons', 'Parmesan cheese', '2 cloves garlic', '2 egg yolks', 'Lemon juice', 'Olive oil', 'Worcestershire sauce', 'Anchovies'],
  ARRAY['Wash and chop romaine lettuce', 'Make dressing with garlic, egg yolks, lemon juice, and anchovies', 'Slowly whisk in olive oil', 'Toss lettuce with dressing', 'Top with croutons and shaved Parmesan', 'Serve immediately'],
  ARRAY['salad', 'vegetarian', 'lunch', 'healthy']),

('Chocolate Chip Cookies', 'Soft and chewy homemade chocolate chip cookies', 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&auto=format&fit=crop', 15, 12, 24, 'easy', 'Dessert',
  ARRAY['2 cups flour', '1 tsp baking soda', '1 cup butter', '3/4 cup sugar', '3/4 cup brown sugar', '2 eggs', '2 tsp vanilla', '2 cups chocolate chips', 'Salt'],
  ARRAY['Preheat oven to 375°F', 'Mix flour, baking soda, and salt', 'Cream butter and sugars', 'Beat in eggs and vanilla', 'Gradually mix in flour mixture', 'Stir in chocolate chips', 'Drop spoonfuls on baking sheet', 'Bake 9-11 minutes until golden'],
  ARRAY['dessert', 'cookies', 'chocolate', 'baking', 'sweet']),

('Greek Salad', 'Fresh Mediterranean salad with tomatoes, cucumbers, olives, and feta', 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&auto=format&fit=crop', 15, 0, 4, 'easy', 'Salad',
  ARRAY['4 tomatoes', '2 cucumbers', '1 red onion', 'Kalamata olives', 'Feta cheese', 'Olive oil', 'Red wine vinegar', 'Oregano', 'Salt', 'Pepper'],
  ARRAY['Chop tomatoes and cucumbers into chunks', 'Slice red onion thinly', 'Combine vegetables and olives in bowl', 'Whisk together olive oil, vinegar, and oregano', 'Pour dressing over salad', 'Top with crumbled feta', 'Serve chilled'],
  ARRAY['salad', 'vegetarian', 'greek', 'healthy', 'lunch']),

('Beef Tacos', 'Delicious Mexican-style tacos with seasoned ground beef', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop', 10, 15, 6, 'easy', 'Mexican',
  ARRAY['500g ground beef', 'Taco shells', 'Lettuce', 'Tomatoes', 'Cheese', 'Sour cream', 'Taco seasoning', 'Onion', 'Salsa'],
  ARRAY['Brown ground beef in pan', 'Add taco seasoning and water', 'Simmer until thickened', 'Warm taco shells', 'Chop lettuce and tomatoes', 'Fill shells with meat', 'Top with cheese, lettuce, tomatoes, and sour cream', 'Serve with salsa'],
  ARRAY['mexican', 'tacos', 'beef', 'dinner', 'easy']);
