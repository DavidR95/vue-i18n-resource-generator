import chalk from 'chalk';
import { command } from './command';
import { readInput, writeOutput } from './io';
import { MAXIMUM_TOKENS, initializeClient, sendCompletionRequest } from './api';
import { createPrompt, createSingeLocalePrompt } from './prompt';
import { extractLocaleMappedMessagesFromChoice } from './completion';
import { LocaleMappedMessages, Messages } from './messages';
import partialJSONParse from 'partial-json-parser';

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

  initializeClient(key);

  const prompt = createPrompt(inputMessages, locales, MAXIMUM_TOKENS / 2);

  const completion = await sendCompletionRequest(prompt);

  const localeMappedMessages = extractLocaleMappedMessagesFromChoice(
    completion,
    locales,
  );

  log(
    chalk.magenta(
      `The translated messages are in the JSON form of: ${chalk.green.italic(
        JSON.stringify(localeMappedMessages),
      )}\n`,
    ),
  );

  if (completion.finish_reason === 'stop') {
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

  for (const [locale, messages] of Object.entries(localeMappedMessages)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    while ((missingMessagesPerLocale[locale] ?? []).length !== 0 || Object.keys(translatedMessagesPerLocale[locale] ?? []).length === 0) {
      for (const [messageKey, messageValue] of Object.entries(messages)) {
        if (!translatedMessagesPerLocale[locale]) {
          translatedMessagesPerLocale[locale] = {};
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        translatedMessagesPerLocale[locale]![messageKey] = messageValue;
      }

      log(
        chalk.magenta(
          `For ${locale}, we so far we have the following translated messages ${JSON.stringify(
            translatedMessagesPerLocale[locale] ?? [],
          )}\n`,
        ),
      );

      const messageKeys = Object.keys(
        translatedMessagesPerLocale[locale] ?? [],
      );

      const missingMessageKeys = Object.keys(inputMessages).filter(
        (messageKey) => !messageKeys.includes(messageKey),
      );

      missingMessagesPerLocale[locale] = missingMessageKeys;

      log(
        chalk.magenta(
          `For ${locale}, we are missing the following translations ${JSON.stringify(
            missingMessagesPerLocale[locale],
          )}\n`,
        ),
      );

      const remainingInputMessages = Object.entries(
        inputMessages,
      ).reduce<Messages>((remainingInputMessages, [key, value]) => {
        if (missingMessagesPerLocale[locale]?.includes(key)) {
          remainingInputMessages[key] = value;
        }

        return remainingInputMessages;
      }, {});

      log(
        chalk.magenta(
          `Making a new request with the following translation messages ${JSON.stringify(
            remainingInputMessages,
          )}\n`,
        ),
      );

      const prompt = createSingeLocalePrompt(
        remainingInputMessages,
        locale,
        MAXIMUM_TOKENS / 2,
      );

      const newCompletion = await sendCompletionRequest(prompt);

      log(
        chalk.magenta(
          `OpenAI provided the following response to the previous prompt: ${chalk.green.italic(
            JSON.stringify(completion),
          )}\n`,
        ),
      );

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const newMessages = partialJSONParse<Messages>(newCompletion.text!);

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      for (const [messageKey, messageValue] of Object.entries(newMessages)) {
        if (!translatedMessagesPerLocale[locale]) {
          translatedMessagesPerLocale[locale] = {};
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        translatedMessagesPerLocale[locale]![messageKey] = messageValue;
      }

      log(
        chalk.magenta(
          `For ${locale}, we so far we have the following translated messages ${JSON.stringify(
            translatedMessagesPerLocale[locale] ?? [],
          )}\n`,
        ),
      );

      const messageKeys2 = Object.keys(
        translatedMessagesPerLocale[locale] ?? [],
      );

      const missingMessageKeys2 = Object.keys(inputMessages).filter(
        (messageKey) => !messageKeys2.includes(messageKey),
      );

      missingMessagesPerLocale[locale] = missingMessageKeys2;
    }
  }

  for (const [locale, messages] of Object.entries(
    translatedMessagesPerLocale,
  )) {
    writeOutput(outputPath, locale, messages);
  }
};

void (async () => main())();
