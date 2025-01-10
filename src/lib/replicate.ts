import Replicate from 'replicate';

// Initialize Replicate with proper error handling
function createReplicateClient() {
  const apiKey = import.meta.env.VITE_REPLICATE_API_TOKEN;
  
  if (!apiKey) {
    console.warn('VITE_REPLICATE_API_TOKEN not found in environment variables');
  }

  return new Replicate({
    auth: apiKey || 'r8_9W62FzrDBgkJzYeRtiSihDCdkcJLESS1owxJl',
    // Add proper headers and configuration
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

const replicate = createReplicateClient();

// Validation constants
const MAX_PROMPT_LENGTH = 500;
const MIN_PROMPT_LENGTH = 3;
const BANNED_WORDS = [
  'nsfw', 'nude', 'explicit', 'pornographic', 'violent', 'gore',
  'disturbing', 'offensive', 'hateful', 'racist', 'discriminatory'
];

// Prompt enhancement templates
const ENHANCEMENT_TEMPLATES = {
  quality: 'high quality, detailed, sharp focus, professional',
  style: 'artistic, beautiful composition, masterful technique',
  lighting: 'perfect lighting, cinematic, dramatic atmosphere',
};

export function validatePrompt(prompt: string): { isValid: boolean; error?: string } {
  if (!prompt || typeof prompt !== 'string') {
    return { isValid: false, error: 'Prompt must be a non-empty string' };
  }

  const trimmedPrompt = prompt.trim();

  if (trimmedPrompt.length < MIN_PROMPT_LENGTH) {
    return { isValid: false, error: `Prompt must be at least ${MIN_PROMPT_LENGTH} characters` };
  }

  if (trimmedPrompt.length > MAX_PROMPT_LENGTH) {
    return { isValid: false, error: `Prompt must not exceed ${MAX_PROMPT_LENGTH} characters` };
  }

  const containsBannedWord = BANNED_WORDS.some(word => 
    trimmedPrompt.toLowerCase().includes(word)
  );

  if (containsBannedWord) {
    return { isValid: false, error: 'Prompt contains inappropriate content' };
  }

  return { isValid: true };
}

export function enhancePrompt(prompt: string): string {
  const enhancedPrompt = [
    prompt.trim(),
    ENHANCEMENT_TEMPLATES.quality,
    ENHANCEMENT_TEMPLATES.style,
    ENHANCEMENT_TEMPLATES.lighting
  ].join(', ');

  return enhancedPrompt;
}

export async function generateImage(prompt: string): Promise<string> {
  try {
    // Check if API key is available
    if (!replicate.auth) {
      throw new Error('Replicate API key is not configured');
    }

    // Validate prompt
    const validation = validatePrompt(prompt);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Enhance prompt
    const enhancedPrompt = enhancePrompt(prompt);

    // Generate image with enhanced settings and proper error handling
    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt: enhancedPrompt,
          negative_prompt: "low quality, blurry, distorted, disfigured, bad anatomy, ugly, duplicate, error, watermark, signature, text, extra limbs, poorly drawn face, poorly drawn hands",
          width: 1024,
          height: 1024,
          num_outputs: 1,
          scheduler: "K_EULER",
          num_inference_steps: 25,
          guidance_scale: 7.5,
          prompt_strength: 0.8,
        }
      }
    ).catch(error => {
      // Handle specific API errors
      if (error.response) {
        const status = error.response.status;
        switch (status) {
          case 401:
            throw new Error('Invalid API key. Please check your Replicate API configuration.');
          case 403:
            throw new Error('Access forbidden. Please verify your API permissions.');
          case 429:
            throw new Error('Rate limit exceeded. Please try again later.');
          default:
            throw new Error(`API error: ${error.response.data?.error || error.message}`);
        }
      }
      throw error;
    });

    if (!output) {
      throw new Error('Failed to generate image: No output received');
    }

    if (Array.isArray(output) && output.length > 0) {
      const imageUrl = output[0];
      if (typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
        throw new Error('Invalid image URL received from generation');
      }
      return imageUrl;
    }

    throw new Error('No valid image URL in generation output');
  } catch (error) {
    console.error('Error generating image:', error);
    if (error instanceof Error) {
      throw new Error(`Image generation failed: ${error.message}`);
    }
    throw new Error('Image generation failed: Unknown error occurred');
  }
}