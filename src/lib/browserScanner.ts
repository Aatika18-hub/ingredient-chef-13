import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

let classifier: any = null;

export const loadModel = async () => {
  if (!classifier) {
    console.log('Loading browser-based food classification model...');
    classifier = await (async () => {
      try {
        return await pipeline(
          'image-classification',
          'onnx-community/mobilenetv4_conv_small.e2400_r224_in1k',
          { device: 'webgpu' }
        );
      } catch {
        return await pipeline(
          'image-classification',
          'onnx-community/mobilenetv4_conv_small.e2400_r224_in1k',
          { device: 'wasm' }
        );
      }
    })();
  }
  return classifier;
};

export const classifyIngredient = async (imageElement: HTMLImageElement): Promise<string[]> => {
  try {
    const model = await loadModel();

    const results: any[] = await model(imageElement);

    // Return top 3 matches with decent confidence
    const topIngredients = (results || [])
      .slice(0, 5)
      .filter((r: any) => (r.score ?? 0) > 0.15)
      .map((r: any) => String(r.label).replace(/_/g, ' '))
      .slice(0, 3);

    return topIngredients;
  } catch (error) {
    console.error('Browser ML classification error:', error);
    throw error;
  }
};
