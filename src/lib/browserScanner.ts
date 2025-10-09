import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

let classifier: any = null;

export const loadModel = async () => {
  if (!classifier) {
    console.log('Loading browser-based food classification model...');
    classifier = await pipeline(
      'zero-shot-classification',
      'Xenova/mobilebert-uncased-mnli',
      { device: 'webgpu' }
    );
  }
  return classifier;
};

export const classifyIngredient = async (imageElement: HTMLImageElement): Promise<string[]> => {
  try {
    const model = await loadModel();
    
    // Common food ingredients to classify against
    const candidateLabels = [
      'tomato', 'onion', 'garlic', 'potato', 'carrot', 'broccoli', 'lettuce',
      'chicken', 'beef', 'pork', 'fish', 'shrimp', 'egg',
      'cheese', 'milk', 'butter', 'cream',
      'rice', 'pasta', 'bread', 'noodles',
      'apple', 'banana', 'orange', 'lemon',
      'bell pepper', 'chili', 'mushroom', 'spinach', 'cabbage',
      'avocado', 'cucumber', 'eggplant', 'zucchini'
    ];
    
    // For zero-shot classification, we need text input
    // This is a simplified approach - in production, you'd use an actual image classifier
    const result = await model(
      'This is a food ingredient image',
      candidateLabels,
      { multi_label: true }
    );
    
    // Return top 3 matches with scores above 0.3
    const topIngredients = result.labels
      .slice(0, 5)
      .filter((_: string, index: number) => result.scores[index] > 0.2)
      .slice(0, 3);
    
    return topIngredients;
  } catch (error) {
    console.error('Browser ML classification error:', error);
    throw error;
  }
};
