import { Configuration, OpenAIApi } from 'openai';

let APIClient: OpenAIApi;

export const initializeAPIClient = (APIKey: string): void => {
  const configuration = new Configuration({
    apiKey: APIKey,
  });

  APIClient = new OpenAIApi(configuration);
}
