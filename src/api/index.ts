import chalk from 'chalk';
import {
  Configuration,
  CreateCompletionResponseChoicesInner,
  OpenAIApi,
} from 'openai';

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

/**
 * The number of end-characters to display of the user's OpenAI key when
 * logging.
 */
const NUMBER_OF_API_KEY_CHARACTERS_TO_SHOW = 4;

let client: OpenAIApi;

/**
 * Initializes the API client using the given API key. This method must be
 * called before attempting to use any methods that make API calls.
 */
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

/**
 * Sends a completion request for given prompt to OpenAI and returns
 * the first completion returned. Any HTTP errors encountered will
 * cause the process to immediately exit.
 */
export const sendCompletionRequest = async (
  prompt: string,
): Promise<CreateCompletionResponseChoicesInner> => {
  logCompletionRequest(prompt);

  try {
    const { data } = await client.createCompletion({
      model: 'text-davinci-003',
      prompt,
      temperature: TEMPERATURE,
      max_tokens: MAXIMUM_TOKENS,
      n: NUMBER_OF_COMPLETIONS,
    });

    const completion = data.choices[0];

    if (!completion) {
      throw new Error('OpenAI provided no completion for the previous prompt');
    }

    logCompletionResponse(completion);

    return completion;
  } catch (error) {
    logCompletionError(error as AxiosError);

    process.exit(1);
  }
};

const logCompletionRequest = (prompt: string): void => {
  console.log(
    chalk.magenta(
      `Sending a completion request to OpenAI using the following prompt:`,
    ),
  );

  console.log(`${chalk.blue.italic(prompt)}\n`);
};

const logCompletionResponse = (
  completion: CreateCompletionResponseChoicesInner,
): void => {
  console.log(
    chalk.magenta(
      `OpenAI provided the following completion for the previous prompt: ${chalk.green.italic(
        JSON.stringify(completion, null, 2),
      )}\n`,
    ),
  );
};

const logCompletionError = (error: AxiosError): void => {
  if (error.response) {
    console.log(
      chalk.red(
        `OpenAI returned the following error in response to the completion request:`,
      ),
    );

    console.log(chalk.red.italic(`Status code: ${error.response.status}`));

    console.log(chalk.red.italic(JSON.stringify(error.response.data, null, 2)));
  } else if (error.request) {
    console.log(
      chalk.red(
        'Received no response from OpenAI after sending a completion request. The following request was sent:',
      ),
    );

    console.log(chalk.red.italic(JSON.stringify(error.request, null, 2)));
  } else {
    console.log(
      chalk.red(
        'There was an error when setting up the completion request to send to OpenAI:',
      ),
    );

    console.log(chalk.red.italic(JSON.stringify(error.message, null, 2)));
  }
};

type AxiosError = import('axios').AxiosError;
