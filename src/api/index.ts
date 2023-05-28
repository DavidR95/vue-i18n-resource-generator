import { Configuration, OpenAIApi } from 'openai';

let client: OpenAIApi;

export const initializeClient = (key: string): void => {
  const configuration = new Configuration({
    apiKey: key,
  });

  client = new OpenAIApi(configuration);
}

export const req = () => {
  console.log(client);
}
