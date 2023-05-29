import { Messages } from '../messages';
import { encode, decode } from 'gpt-3-encoder';
import partialJSONParse from 'partial-json-parser';

export const createPrompt = (
  messages: Messages,
  locales: string[],
  maxTokens: number,
): string => {
  const tokenLimitedMessages = limitMessagesToMaxTokens(messages, maxTokens);

  return `Translate the values in the following JSON in to the following locales: ${locales.join(
    ', ',
  )}. The following rules must be followed:
- Translations must adhere to the Vue I18n message syntax.
- The response should be JSON where each locale is a root key.

${JSON.stringify(tokenLimitedMessages)}`;
};

export const createSingeLocalePrompt = (
  messages: Messages,
  locale: string,
  maxTokens: number,
): string => {
  const tokenLimitedMessages = limitMessagesToMaxTokens(messages, maxTokens);

  return `Translate the values in the following JSON in to the following locale: ${locale}. The following rules must be followed:
- Translations must adhere to the Vue I18n message syntax.

${JSON.stringify(tokenLimitedMessages)}`;
};

const limitMessagesToMaxTokens = (
  messages: Messages,
  maxTokens: number,
): Messages => {
  const messagesText = JSON.stringify(messages);

  const messagesTokens = encode(messagesText);

  const cappedMessagesTokens = messagesTokens.slice(0, maxTokens);

  const cappedMessagesText = decode(cappedMessagesTokens);

  return partialJSONParse(cappedMessagesText);
};
