import chalk from 'chalk';
import { command } from './command';
import { readInput, writeLocaleMappedMessages } from './io';
import {
  PROMPT_MAXIMUM_TOKENS,
  initializeClient,
  sendCompletionRequest,
} from './api';
import { createMultiLocalePrompt, createSingeLocalePrompt } from './prompt';
import { convertCompletionToLocaleMappedMessages } from './completion';
import { LocaleMappedMessages, Messages } from './messages';
import partialJSONParse from 'partial-json-parser';

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

  const localeMappedMessages =
    convertCompletionToLocaleMappedMessages(completion);

  if (completion.finish_reason === 'stop') {
    handleStopFinishReason(localeMappedMessages, outputPath);

    return;
  }

  const missingMessagesPerLocale: Record<string, string[]> = {};
  const translatedMessagesPerLocale: LocaleMappedMessages = {};

  for (const locale of locales) {
    const messages = localeMappedMessages[locale] ?? {};
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    while (
      (missingMessagesPerLocale[locale] ?? []).length !== 0 ||
      Object.keys(translatedMessagesPerLocale[locale] ?? []).length === 0
    ) {
      for (const [messageKey, messageValue] of Object.entries(messages)) {
        if (!translatedMessagesPerLocale[locale]) {
          translatedMessagesPerLocale[locale] = {};
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        translatedMessagesPerLocale[locale]![messageKey] = messageValue;
      }

      console.log(
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

      console.log(
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

      console.log(
        chalk.magenta(
          `Making a new request with the following translation messages ${JSON.stringify(
            remainingInputMessages,
          )}\n`,
        ),
      );

      const prompt = createSingeLocalePrompt(
        remainingInputMessages,
        locale,
        PROMPT_MAXIMUM_TOKENS,
      );

      const newCompletion = await sendCompletionRequest(prompt);

      console.log(
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

      console.log(
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

  writeLocaleMappedMessages(translatedMessagesPerLocale, outputPath);
};

const handleStopFinishReason = (localeMappedMessages: LocaleMappedMessages, outputPath: string): void => {
  console.log(
    chalk.magenta(
      `OpenAI provided a finish reason of 'stop'. Now writing output JSON files to ${outputPath}.`,
    ),
  );

  writeLocaleMappedMessages(localeMappedMessages, outputPath);
}

void (async () => main())();
