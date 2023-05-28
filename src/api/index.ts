import { Configuration, CreateCompletionResponse, OpenAIApi } from 'openai';

// Make this an option?
export const MAX_TOKENS = 100;
const TEMPERATURE = 0;

let client: OpenAIApi;

export const initializeClient = (key: string): void => {
  const configuration = new Configuration({
    apiKey: key,
  });

  client = new OpenAIApi(configuration);
}

export const sendRequest = async (prompt: string): Promise<CreateCompletionResponse> => {
  const { data } = await client.createCompletion({
    model: 'text-davinci-003',
    prompt,
    temperature: TEMPERATURE,
    max_tokens: MAX_TOKENS,
  });

  return data;
}
