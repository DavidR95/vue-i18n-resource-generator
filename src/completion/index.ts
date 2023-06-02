import { CreateCompletionResponseChoicesInner } from 'openai';
import partialJSONParse from 'partial-json-parser';
import chalk from 'chalk';

export const parseCompletion = (
  completion: CreateCompletionResponseChoicesInner,
): object => {
  const { text } = completion;

  if (!text) {
    console.log(
      chalk.magenta('Could not find any text within the completion.'),
    );

    process.exit(1);
  }

  return partialJSONParse(text);
};
