import { CreateCompletionResponseChoicesInner } from "openai";
import { LocaleMappedMessages } from "../messages";
import partialJSONParse from "partial-json-parser";

export const extractLocaleMappedMessagesFromChoice = (choice: CreateCompletionResponseChoicesInner, locales: string[]): LocaleMappedMessages => {
  const { text } = choice;

  if (!text) {
    throw new Error('');
  }

  const parsedText = partialJSONParse<LocaleMappedMessages>(text);

  return locales.reduce<LocaleMappedMessages>((localeMappedMessages, locale) => {
    localeMappedMessages[locale] = parsedText[locale] ?? {};
    return localeMappedMessages;
  }, {})
}
