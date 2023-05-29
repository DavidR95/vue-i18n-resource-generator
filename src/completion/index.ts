import { CreateCompletionResponseChoicesInner } from "openai";
import { LocaleMappedMessages } from "../messages";
import partialJSONParse from "partial-json-parser";

export const extractLocaleMappedMessagesFromChoice = (choice: CreateCompletionResponseChoicesInner): LocaleMappedMessages => {
  const { text } = choice;

  if (!text) {
    throw new Error('');
  }

  return partialJSONParse(text);
}
