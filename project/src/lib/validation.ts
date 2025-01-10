// Validation constants
const MAX_PROMPT_LENGTH = 500;
const MIN_PROMPT_LENGTH = 3;
const BANNED_WORDS = [
  'nsfw', 'nude', 'explicit', 'pornographic', 'violent', 'gore',
  'disturbing', 'offensive', 'hateful', 'racist', 'discriminatory'
];

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