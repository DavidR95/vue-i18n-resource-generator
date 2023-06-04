import chalk from 'chalk';
import { command } from './command';
import { readInput, writeOutput } from './io';
import { initializeClient, sendCompletionRequest } from './api';
import { createPrompt } from './prompt';
import { parseCompletion } from './completion';
import { Messages } from './messages';

const main = async (): Promise<void> => {
  const { key, inputPath, outputPath, locales } = command.opts();

  console.log(
    chalk.magenta(
      `Reading input messages located at: ${chalk.bold.underline(
        inputPath,
      )}.\n`,
    ),
  );

  const inputMessages = readInput(inputPath);

  console.log(
    chalk.magenta(
      `Found ${Object.keys(inputMessages).length} messages to translate.\n`,
    ),
  );

  initializeClient(key);

  for (const locale of locales) {
    const messages: Messages = {};
    let missingMessageKeys = Object.keys(inputMessages);

    while (missingMessageKeys.length > 0) {
      console.log(
        chalk.magenta(
          `We are still missing translations for the following message keys: ${JSON.stringify(
            missingMessageKeys,
          )}\n`,
        ),
      );

      const missingMessages = Object.fromEntries(
        Object.entries(inputMessages).filter(([key]) =>
          missingMessageKeys.includes(key),
        ),
      );

      const prompt = createPrompt(missingMessages, locale);

      const completion = await sendCompletionRequest(prompt);

      for (const [messageKey, messageValue] of Object.entries(
        parseCompletion(completion) as Messages,
      )) {
        messages[messageKey] = messageValue;
      }

      missingMessageKeys = Object.keys(inputMessages).filter(
        (messageKey) => !Object.keys(messages).includes(messageKey),
      );
    }

    writeOutput(outputPath, locale, messages);
  }
};

void (async () => main())();
