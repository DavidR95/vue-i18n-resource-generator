import { Messages } from '../messages';
import { encode, decode } from 'gpt-3-encoder';
import partialJSONParse from 'partial-json-parser';

/**
 * Returns a prompt requesting that the given messages are translated in to the given
 * list of locales. The messages are limited by the given number of maximum tokens.
 */
export const createMultiLocalePrompt = (
  messages: Messages,
  locales: string[],
  maximumTokens: number,
): string => {
  const tokenCappedMessages = capMessagesToMaximumTokens(
    messages,
    maximumTokens,
  );

  return `Translate only the values in the following JSON in to the following locales: ${locales.join(
    ', ',
  )}. The following rules must be followed:
- The response must be JSON.
- The response JSON should use each locale as a root key.
- The keys of the original JSON must not be changed.
- Translations must adhere to the Vue I18n message syntax.

${JSON.stringify(tokenCappedMessages)}`;
};

/**
 * Returns a prompt requesting that the given messages are translated in to the given
 * locale. The messages are limited by the given number of maximum tokens.
 */
export const createSingeLocalePrompt = (
  messages: Messages,
  locale: string,
  maximumTokens: number,
): string => {
  const tokenCappedMessages = capMessagesToMaximumTokens(
    messages,
    maximumTokens,
  );

  return `Translate only the values in the following JSON in to the following locale: ${locale}. The following rules must be followed:
- The response must be JSON.
- The keys of the response JSON must be the same as the original.
- Translations must adhere to the Vue I18n message syntax.

${JSON.stringify(tokenCappedMessages)}`;
};

/**
 * Caps the given messages to the largest number of complete key/value pairs that
 * can fit within the given number of maximum tokens.
 */
const capMessagesToMaximumTokens = (
  messages: Messages,
  maximumTokens: number,
): Messages => {
  const messagesText = JSON.stringify(messages);

  const messagesTokens = encode(messagesText);

  const tokenCappedMessages = messagesTokens.slice(0, maximumTokens);

  const tokenCappedMessagesText = decode(tokenCappedMessages);

  return partialJSONParse(tokenCappedMessagesText);
};
