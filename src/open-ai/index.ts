import { Configuration, OpenAIApi } from 'openai';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let APIClient: OpenAIApi;

export const initializeAPIClient = (APIKey: string): void => {
  const configuration = new Configuration({
    apiKey: APIKey,
  });

  APIClient = new OpenAIApi(configuration);
}
