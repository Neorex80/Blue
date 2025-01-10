import { validatePrompt } from './validation';

const AIML_API_KEY = '4fa7b18c4ae547df9706a305af94e210';
const AIML_API_BASE = 'https://api.aimlapi.com/v1';

// Improved error handling and retry logic
const fetchWithRetry = async (url: string, options: RequestInit, retries = 3): Promise<Response> => {
  let lastError: Error | null = null;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      
      const errorData = await response.json().catch(() => null);
      if (response.status === 429) {
        // Rate limit - wait before retry
        await new Promise(resolve => setTimeout(resolve, (i + 1) * 2000));
        continue;
      }
      
      throw new Error(
        errorData?.error?.message || 
        errorData?.message || 
        `HTTP error! status: ${response.status}`
      );
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error occurred');
      if (i === retries - 1) break;
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, (i + 1) * 1000));
    }
  }
  throw lastError || new Error('Failed after multiple retries');
};

// Enhanced image generation with better error handling and performance
export async function generateImage(prompt: string): Promise<string> {
  try {
    const validation = validatePrompt(prompt);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetchWithRetry(
        `${AIML_API_BASE}/images/generations`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${AIML_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
          },
          body: JSON.stringify({
            prompt,
            model: 'dall-e-3',
            n: 1,
            size: '1024x1024',
            quality: 'hd',
            response_format: 'url',
            style: 'vivid',
          }),
          signal: controller.signal,
        }
      );

      const data = await response.json();
      if (!data.data?.[0]?.url) {
        throw new Error('No image URL in response');
      }

      // Pre-load the image with timeout
      await Promise.race([
        new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = () => reject(new Error('Failed to load generated image'));
          img.src = data.data[0].url;
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Image loading timeout')), 10000)
        )
      ]);

      return data.data[0].url;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error('Error generating image:', error);
    throw error instanceof Error 
      ? new Error(`Image generation failed: ${error.message}`)
      : new Error('Image generation failed: Unknown error occurred');
  }
}

// Improved GPT-4 streaming with better error handling
export async function* streamGPT4(
  messages: Array<{ role: string; content: string }>,
  signal?: AbortSignal
): AsyncGenerator<string, void, unknown> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

  try {
    const response = await fetchWithRetry(
      `${AIML_API_BASE}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIML_API_KEY}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini-2024-07-18',
          messages,
          temperature: 0.7,
          max_tokens: 2048,
          stream: true,
          presence_penalty: 0.6,
          frequency_penalty: 0.5,
          top_p: 0.9,
        }),
        signal: signal || controller.signal,
      }
    );

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.choices?.[0]?.delta?.content) {
                yield data.choices[0].delta.content;
              }
            } catch (e) {
              console.error('Error parsing stream data:', e);
              continue;
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    console.error('GPT-4 streaming error:', error);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw error;
      }
      throw new Error(`GPT-4 completion failed: ${error.message}`);
    }
    throw new Error('GPT-4 completion failed: Unknown error occurred');
  } finally {
    clearTimeout(timeoutId);
  }
}