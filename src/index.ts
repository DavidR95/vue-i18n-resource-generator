import chalk from 'chalk';
import { command } from './command';
import { readInput } from './io';
import { initializeClient } from './api';

const NUMBER_OF_API_KEY_CHARACTERS_TO_SHOW = 4;

const { log } = console;

const { key, inputPath, locales } = command.opts();

log(
  chalk.magenta(
    `Reading input messages located at: ${chalk.bold.underline(inputPath)}.`,
  ),
);

log(
  chalk.red.italic(
    'Note, it is assumed that this is a JSON file representing messages written in valid Vue I18n message syntax.\n',
  ),
);

const inputMessages = readInput(inputPath);

log(
  chalk.magenta(
    `Found ${Object.keys(inputMessages).length} messages to translate.\n`,
  ),
);

log(
  chalk.magenta(
    `Initializing OpenAI API client using key ******${chalk.bold(
      key.slice(-NUMBER_OF_API_KEY_CHARACTERS_TO_SHOW),
    )} \n`,
  ),
);

initializeClient(key);

log(
  chalk.magenta(
    `Messages will be translated in to the following locales: ${chalk.bold(
      locales.join(', '),
    )} \n`,
  ),
);
