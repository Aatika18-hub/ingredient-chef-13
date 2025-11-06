-- Add nutrition columns to recipes table
ALTER TABLE recipes
ADD COLUMN protein numeric,
ADD COLUMN carbohydrates numeric,
ADD COLUMN fats numeric,
ADD COLUMN calories numeric;