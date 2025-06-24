
import { GoogleGenAI, GenerateImagesResponse } from "@google/genai";
import { IMAGEN_MODEL } from '../constants';

export class ImagenService {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateImage(prompt: string): Promise<string> {
    try {
      const response: GenerateImagesResponse = await this.ai.models.generateImages({
        model: IMAGEN_MODEL,
        prompt: prompt,
        config: { numberOfImages: 1, outputMimeType: 'image/jpeg' }, 
      });

    if (response.generatedImages?.[0]?.image?.imageBytes) {
      return response.generatedImages[0].image.imageBytes; // This is already a base64 string
    } else {
    console.error("Imagen response did not contain image data:", response);
    throw new Error("No image data received from Imagen.");
    }

    } catch (error) {
      console.error("Error generating image with ImagenService:", error);
      // It's possible the error object has more details, e.g. error.response.data
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to generate image: ${errorMessage}`);
    }
  }
}