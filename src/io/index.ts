import fs from 'fs';
import { Messages } from '../messages';

/**
 * Reads the file from the given input. It is assumed the file will be JSON and
 * the return value is automatically parsed accordingly.
 */
export const readInput = (inputPath: string): Messages => {
  const input = fs.readFileSync(inputPath, 'utf-8');

  return JSON.parse(input) as Messages;
};

/**
 * Writes the given messages to a JSON file at given output path, where the file
 * name is the locale.
 */
export const writeOutput = (
  outputPath: string,
  locale: string,
  messages: Messages,
): void => {
  fs.writeFileSync(
    `${outputPath}/${locale}.json`,
    JSON.stringify(messages, null, 2),
  );
};
