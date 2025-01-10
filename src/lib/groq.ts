import { Groq } from 'groq-sdk';
import { streamGPT4 } from './aiml';

const groq = new Groq({
  apiKey: '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',
  dangerouslyAllowBrowser: true
});

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const DEFAULT_BLUE_PROMPT = `You are Blue, an advanced AI assistant with a friendly, engaging, and knowledgeable personality. Your responses should be:

- Helpful and informative, providing accurate and well-structured information
- Conversational and natural, making users feel comfortable
- Clear and concise, while being thorough when needed
- Professional yet approachable, using a friendly tone
- Proactive in suggesting relevant follow-up questions or related topics
- Honest about limitations, admitting when you're not sure about something
- Respectful of user privacy and ethical boundaries

You aim to make every interaction meaningful and helpful while maintaining a warm, engaging presence.`;

export async function* streamWithGroq(
  message: string, 
  modelId: string = 'gpt-4',
  imageData?: { base64: string, mimeType: string } | null,
  signal?: AbortSignal,
  previousMessages: any[] = [],
  systemPrompt?: string
) {
  try {
    if (!message.trim()) {
      throw new Error('Message cannot be empty');
    }

    // Format messages for chat completion
    const formattedMessages = [
      { 
        role: 'system', 
        content: systemPrompt || DEFAULT_BLUE_PROMPT
      },
      ...previousMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Use GPT-4 from AIML API if selected
    if (modelId === 'gpt-4') {
      try {
        yield* streamGPT4(formattedMessages, signal);
        return; // Return early if GPT-4 succeeds
      } catch (error) {
        console.error('Error with GPT-4:', error);
        // Don't throw here, fallback to Mixtral instead
        yield 'GPT-4 is currently unavailable. Falling back to Mixtral...\n\n';
        modelId = 'mixtral-8x7b-32768';
      }
    }

    // Use Groq for other models or as fallback
    try {
      // Validate model ID
      const validModels = ['mixtral-8x7b-32768', 'llama-3.1-70b-versatile'];
      if (!validModels.includes(modelId)) {
        modelId = 'mixtral-8x7b-32768'; // Default to Mixtral if invalid model
      }

      const stream = await groq.chat.completions.create({
        messages: formattedMessages,
        model: modelId,
        temperature: 0.7,
        max_tokens: 2048,
        stream: true,
      });

      let buffer = '';
      for await (const chunk of stream) {
        if (signal?.aborted) {
          throw new Error('Generation stopped by user');
        }
        
        const content = chunk.choices[0]?.delta?.content || '';
        buffer += content;
        
        if (content.includes(' ') || content.includes('\n') || buffer.length > 3) {
          yield buffer;
          buffer = '';
          await delay(30);
        }
      }
      
      if (buffer) {
        yield buffer;
      }
    } catch (error: any) {
      console.error('Error with Groq:', error);
      
      // Handle specific error cases
      if (error.error?.type === 'invalid_request_error' && error.error?.code === 'model_decommissioned') {
        throw new Error('This model is no longer available. Switching to Mixtral...');
      }
      
      throw new Error(
        error instanceof Error 
          ? `Chat completion failed: ${error.message}`
          : 'Chat completion failed: Unknown error occurred'
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw error;
      }
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred. Please try again.');
  }
}