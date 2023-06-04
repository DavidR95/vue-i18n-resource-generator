import { PROMPT_MAXIMUM_TOKENS } from '../api';
import { Messages } from '../messages';
import { encode, decode } from 'gpt-3-encoder';
import partialJSONParse from 'partial-json-parser';

/**
 * Returns a prompt requesting that the given messages are translated in to the given
 * locale.
 */
export const createPrompt = (messages: Messages, locale: string): string => {
  const leadInText = `Transform the given JSON string such that the keys are unchanged but the values are translated in to the locale ${locale}, where the translations adhere to the Vue I18n message syntax.
For example, This JSON string: {"helloWorld":"Hello World","poolCount":"pool | {count} pools","thereArePoolCount":"There are @:poolCount"} would be transformed in to this JSON string using the locale fr-FR: {"helloWorld":"Bonjour le monde","poolCount":"piscine | {count} piscines","thereArePoolCount":"Il y a @:poolCount"}.
The JSON string to transform is:`;

  const numberOfTokensInLeadInText = encode(leadInText).length;

  return `${leadInText} ${convertMessagesToTokenCappedText(
    messages,
    PROMPT_MAXIMUM_TOKENS - numberOfTokensInLeadInText,
  )}`;
};

/**
 * Returns a text version of the given messages, capped to the largest number of
 * complete key/value pairs that can fit within the given number of maximum
 * tokens.
 */
const convertMessagesToTokenCappedText = (
  messages: Messages,
  maximumTokens: number,
): string => {
  const messagesText = JSON.stringify(messages);

  const messagesTokens = encode(messagesText);

  const tokenCappedMessages = messagesTokens.slice(0, maximumTokens);

  const tokenCappedMessagesText = decode(tokenCappedMessages);

  return JSON.stringify(partialJSONParse(tokenCappedMessagesText));
};
