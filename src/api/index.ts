import chalk from 'chalk';
import { Configuration, CreateCompletionResponseChoicesInner, OpenAIApi } from 'openai';

/**
 * Maximum number of tokens for the model 'text-davinci-003', taken from
 * https://platform.openai.com/docs/models/gpt-3-5.
 */
export const MAXIMUM_TOKENS = 4096;

/**
 * Use a temperature of 0 to ensure the response is reliably deterministic.
 */
const TEMPERATURE = 0;

/**
 * Only generate 1 completion for each prompt. We expect the result to be
 * deterministic anyway.
 */
const NUMBER_OF_COMPLETIONS = 1;

const NUMBER_OF_API_KEY_CHARACTERS_TO_SHOW = 4;

let client: OpenAIApi;

export const initializeClient = (apiKey: string): void => {
  console.log(
    chalk.magenta(
      `Initializing OpenAI API client using API key ******${chalk.bold(
        apiKey.slice(-NUMBER_OF_API_KEY_CHARACTERS_TO_SHOW),
      )}\n`,
    ),
  );

  client = new OpenAIApi(new Configuration({ apiKey }));
};

export const sendCompletionRequest = async (
  prompt: string,
): Promise<CreateCompletionResponseChoicesInner> => {
  console.log(
    chalk.magenta(
      `Sending a completion request to OpenAI using the following prompt:\n`,
    ),
  );

  console.log(`${chalk.blue.italic(prompt)}\n`);

  const { data } = await client.createCompletion({
    model: 'text-davinci-003',
    prompt,
    temperature: TEMPERATURE,
    max_tokens: MAXIMUM_TOKENS,
    n: NUMBER_OF_COMPLETIONS,
  });

  const completion = data.choices[0];

  console.log(
    chalk.magenta(
      `OpenAI provided the following completion for the previous prompt: ${chalk.green.italic(
        JSON.stringify(completion),
      )}\n`,
    ),
  );

  if (!completion) {
    throw new Error('OpenAI provided no completion for the previous prompt');
  }

  return completion;
};
