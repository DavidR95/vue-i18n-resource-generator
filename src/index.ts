import chalk from 'chalk';
import { command } from './command';
import { readInput, writeOutput } from './io';
import {
  PROMPT_MAXIMUM_TOKENS,
  initializeClient,
  sendCompletionRequest,
} from './api';
import { createMultiLocalePrompt, createSingeLocalePrompt } from './prompt';
import { parseCompletion } from './completion';
import { LocaleMappedMessages, Messages } from './messages';

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

  const multiLocalePrompt = createMultiLocalePrompt(
    inputMessages,
    locales,
    PROMPT_MAXIMUM_TOKENS,
  );

  const completion = await sendCompletionRequest(multiLocalePrompt);

  const localeMappedMessages = parseCompletion(
    completion,
  ) as LocaleMappedMessages;

  if (completion.finish_reason === 'stop') {
    handleStopFinishReason(localeMappedMessages, outputPath);
  } else {
    await handleLengthFinishReason(
      inputMessages,
      locales,
      localeMappedMessages,
      outputPath,
    );
  }
};

const handleStopFinishReason = (
  localeMappedMessages: LocaleMappedMessages,
  outputPath: string,
): void => {
  console.log(
    chalk.magenta(
      `OpenAI provided a finish reason of 'stop'. Now writing output JSON files to ${outputPath}.`,
    ),
  );

  for (const [locale, messages] of Object.entries(localeMappedMessages)) {
    writeOutput(outputPath, locale, messages);
  }
};

const handleLengthFinishReason = async (
  inputMessages: Messages,
  locales: string[],
  localeMappedMessages: LocaleMappedMessages,
  outputPath: string,
): Promise<void> => {
  for (const locale of locales) {
    const messages: Messages = localeMappedMessages[locale] ?? {};

    let missingMessageKeys = Object.keys(inputMessages).filter(
      (inputMessageKey) => !Object.keys(messages).includes(inputMessageKey),
    );

    while (missingMessageKeys.length > 0) {
      console.log(
        chalk.magenta(
          `For ${locale}, so far we have the following translated messages: ${JSON.stringify(
            messages,
            null,
            2,
          )}\n`,
        ),
      );

      console.log(
        chalk.magenta(
          `We are still missing the following translations for following message keys: ${JSON.stringify(
            missingMessageKeys,
          )}\n`,
        ),
      );

      const missingMessages = Object.fromEntries(
        Object.entries(inputMessages).filter(([key]) =>
          missingMessageKeys.includes(key),
        ),
      );

      const prompt = createSingeLocalePrompt(
        missingMessages,
        locale,
        PROMPT_MAXIMUM_TOKENS,
      );

      const completion = await sendCompletionRequest(prompt);

      for (const [messageKey, messageValue] of Object.entries(
        parseCompletion(completion) as Messages,
      )) {
        messages[messageKey] = messageValue;
      }

      console.log(
        chalk.magenta(
          `For ${locale}, we so far we have the following translated messages ${JSON.stringify(
            messages,
          )}\n`,
        ),
      );

      missingMessageKeys = Object.keys(inputMessages).filter(
        (messageKey) => !Object.keys(messages).includes(messageKey),
      );
    }

    writeOutput(outputPath, locale, messages);
  }
};

void (async () => main())();
