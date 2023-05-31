import chalk from 'chalk';
import { command } from './command';
import { readInput, writeOutput } from './io';
import {
  PROMPT_MAXIMUM_TOKENS,
  initializeClient,
  sendCompletionRequest,
} from './api';
import { createMultiLocalePrompt, createSingeLocalePrompt } from './prompt';
import { convertCompletionToLocaleMappedMessages } from './completion';
import { LocaleMappedMessages, Messages } from './messages';
import partialJSONParse from 'partial-json-parser';
import { CreateCompletionResponseChoicesInner } from 'openai';

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
  } else {
    await handleLengthFinishReason(
      inputMessages,
      locales,
      completion,
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
  completion: CreateCompletionResponseChoicesInner,
  localeMappedMessages: LocaleMappedMessages,
  outputPath: string,
): Promise<void> => {
  for (const locale of locales) {
    const messages: Messages = localeMappedMessages[locale] ?? {};
    let missingMessages: string[] = [];

    const stillHaveMessagesToTranslate =
      missingMessages.length > 0 || Object.keys(messages).length === 0;

    while (stillHaveMessagesToTranslate) {
      console.log(
        chalk.magenta(
          `For ${locale}, so far we have the following translated messages ${JSON.stringify(
            messages,
          )}\n`,
        ),
      );

      const messageKeys = Object.keys(messages);

      const missingMessageKeys = Object.keys(inputMessages).filter(
        (messageKey) => !messageKeys.includes(messageKey),
      );

      missingMessages = missingMessageKeys;

      console.log(
        chalk.magenta(
          `For ${locale}, we are missing the following translations ${JSON.stringify(
            missingMessages,
          )}\n`,
        ),
      );

      const remainingInputMessages = Object.entries(
        inputMessages,
      ).reduce<Messages>((remainingInputMessages, [key, value]) => {
        if (missingMessages.includes(key)) {
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

      for (const [messageKey, messageValue] of Object.entries(newMessages)) {
        messages[messageKey] = messageValue;
      }

      console.log(
        chalk.magenta(
          `For ${locale}, we so far we have the following translated messages ${JSON.stringify(
            messages,
          )}\n`,
        ),
      );

      const messageKeys2 = Object.keys(messages);

      const missingMessageKeys2 = Object.keys(inputMessages).filter(
        (messageKey) => !messageKeys2.includes(messageKey),
      );

      missingMessages = missingMessageKeys2;
    }

    writeOutput(outputPath, locale, messages);
  }
};

void (async () => main())();
