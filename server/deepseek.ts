export type DeepSeekMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export class DeepSeekError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly retryAfterSeconds: number | null = null,
  ) {
    super(message);
    this.name = 'DeepSeekError';
  }
}

const getRetryAfterSeconds = (value: string | null): number | null => {
  if (value === null) return null;
  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : null;
};

export async function generateDeepSeekReply(
  messages: DeepSeekMessage[],
  options: { temperature: number; maxTokens: number },
): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey || apiKey === 'YOUR_DEEPSEEK_API_KEY') {
    throw new DeepSeekError('deepseek_not_configured', 503);
  }

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      messages,
      temperature: options.temperature,
      max_tokens: options.maxTokens,
    }),
  });

  if (!response.ok) {
    throw new DeepSeekError(
      'deepseek_request_failed',
      response.status,
      getRetryAfterSeconds(response.headers.get('retry-after')),
    );
  }

  const result: unknown = await response.json();
  if (typeof result !== 'object' || result === null || !('choices' in result) || !Array.isArray(result.choices)) {
    throw new DeepSeekError('deepseek_invalid_response', 502);
  }

  const firstChoice = result.choices[0];
  if (
    typeof firstChoice !== 'object' ||
    firstChoice === null ||
    !('message' in firstChoice) ||
    typeof firstChoice.message !== 'object' ||
    firstChoice.message === null ||
    !('content' in firstChoice.message) ||
    typeof firstChoice.message.content !== 'string'
  ) {
    throw new DeepSeekError('deepseek_empty_response', 502);
  }

  return firstChoice.message.content.trim();
}
