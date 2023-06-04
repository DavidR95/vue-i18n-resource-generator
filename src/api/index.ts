import chalk from 'chalk';
import {
  Configuration,
  CreateCompletionResponseChoicesInner,
  OpenAIApi,
} from 'openai';

const MODEL = 'text-davinci-003';

/**
 * The maximum number of tokens in the combined prompt and completion
 * allowed for `MODEL`.
 *
 * See https://platform.openai.com/docs/models/gpt-3-5.
 */
const MODEL_MAXIMUM_TOKENS = 4096;

/**
 * Even with the lead-in text of the prompt, we can't predict whether the
 * prompt or the completion will use more tokens. Consequently, we'll
 * just evenly divide the token share.
 */
export const PROMPT_MAXIMUM_TOKENS = MODEL_MAXIMUM_TOKENS / 2;
const COMPLETION_MAXIMUM_TOKENS = MODEL_MAXIMUM_TOKENS / 2;

/**
 * Use a temperature of 0 to ensure the response is reliably deterministic.
 */
const TEMPERATURE = 0;

/**
 * Only generate 1 completion for each prompt.
 */
const NUMBER_OF_COMPLETIONS_PER_PROMPT = 1;

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
 * the first completion returned. Any errors encountered will cause
 * the process to immediately exit.
 */
export const sendCompletionRequest = async (
  prompt: string,
): Promise<CreateCompletionResponseChoicesInner> => {
  logCompletionRequest(prompt);

  try {
    const { data } = await client.createCompletion({
      model: MODEL,
      temperature: TEMPERATURE,
      max_tokens: COMPLETION_MAXIMUM_TOKENS,
      n: NUMBER_OF_COMPLETIONS_PER_PROMPT,
      prompt,
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
      'Sending a completion request to OpenAI using the following prompt:',
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
        'There was an error when sending the completion request to OpenAI:',
      ),
    );

    console.log(chalk.red.italic(error.message));
  }
};

// Note that Axios is a dependency of the OpenAI library
type AxiosError = import('axios').AxiosError;
