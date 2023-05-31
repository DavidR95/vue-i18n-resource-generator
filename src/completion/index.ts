import { CreateCompletionResponseChoicesInner } from 'openai';
import { LocaleMappedMessages } from '../messages';
import partialJSONParse from 'partial-json-parser';
import chalk from 'chalk';

export const convertCompletionToLocaleMappedMessages = (
  completion: CreateCompletionResponseChoicesInner,
): LocaleMappedMessages => {
  const { text } = completion;

  if (!text) {
    console.log(
      chalk.magenta('Could not find any text within the completion.'),
    );

    process.exit(1);
  }

  return partialJSONParse(text);
};
