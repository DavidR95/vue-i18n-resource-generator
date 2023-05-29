import chalk from 'chalk';
import { command } from './command';
import { readInput, writeOutput } from './io';
import { MAX_TOKENS, initializeClient, sendRequest } from './api';
import { createPrompt } from './prompt';
import { extractLocaleMappedMessagesFromChoice } from './completion';
import { LocaleMappedMessages } from './messages';

const NUMBER_OF_API_KEY_CHARACTERS_TO_SHOW = 4;

const { log } = console;

const main = async (): Promise<void> => {
  const { key, inputPath, outputPath, locales } = command.opts();

  log(
    chalk.magenta(
      `Reading input messages located at: ${chalk.bold.underline(inputPath)}.`,
    ),
  );

  log(
    chalk.red.italic(
      'Note, it is assumed that this is a JSON file representing messages written in valid Vue I18n message syntax.\n',
    ),
  );

  const inputMessages = readInput(inputPath);

  log(
    chalk.magenta(
      `Found ${Object.keys(inputMessages).length} messages to translate.\n`,
    ),
  );

  log(
    chalk.magenta(
      `Initializing OpenAI API client using key ******${chalk.bold(
        key.slice(-NUMBER_OF_API_KEY_CHARACTERS_TO_SHOW),
      )} \n`,
    ),
  );

  initializeClient(key);

  const prompt = createPrompt(inputMessages, locales, MAX_TOKENS / 2);

  log(
    chalk.magenta(
      `Requesting translations from OpenAI using the following prompt:\n`,
    ),
  );

  log(`${chalk.blue.italic(prompt)}\n`);

  const completion = await sendRequest(prompt);

  log(
    chalk.magenta(
      `OpenAI provided the following response to the previous prompt: ${chalk.green.italic(
        JSON.stringify(completion),
      )}\n`,
    ),
  );

  const choice = completion.choices[0];

  if (!choice) {
    throw new Error('');
  }

  const localeMappedMessages = extractLocaleMappedMessagesFromChoice(choice, locales);

  log(
    chalk.magenta(
      `The translated messages are in the JSON form of: ${chalk.green.italic(
        JSON.stringify(localeMappedMessages),
      )}\n`,
    ),
  );

  if (choice.finish_reason === 'stop') {
    log(
      chalk.magenta(
        `OpenAI provided a finish reason of 'stop'. Now writing output JSON files to ${outputPath}\n`,
      ),
    );

    for (const [locale, messages] of Object.entries(localeMappedMessages)) {
      writeOutput(outputPath, locale, messages);
    }

    return;
  }

  const missingMessagesPerLocale: Record<string, string[]> = {};
  const translatedMessagesPerLocale: LocaleMappedMessages = {};

  if (choice.finish_reason === 'length') {
    for (const [locale, messages] of Object.entries(localeMappedMessages)) {
      for (const [messageKey, messageValue] of Object.entries(messages)) {
        if (!translatedMessagesPerLocale[locale]) {
          translatedMessagesPerLocale[locale] = {};
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        translatedMessagesPerLocale[locale]![messageKey] = messageValue;
      }

      log(
        chalk.magenta(
          `For ${locale}, we so far we have the following translated messages ${JSON.stringify(translatedMessagesPerLocale[locale] ?? [])}\n`,
        ),
      );

      const messageKeys = Object.keys(messages);

      const missingMessageKeys = Object.keys(inputMessages).filter(
        (messageKey) => !messageKeys.includes(messageKey),
      );

      missingMessagesPerLocale[locale] = missingMessageKeys;

      log(
        chalk.magenta(
          `For ${locale}, we are missing the following translations ${JSON.stringify(missingMessagesPerLocale[locale])}\n`,
        ),
      );
    }
  }
};

void (async () => main())();
