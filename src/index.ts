import chalk from 'chalk';
import { command } from './command';
import { readInput } from './io';
import { initializeAPIClient } from './open-ai';

const NUMBER_OF_API_KEY_CHARACTERS_TO_SHOW = 4;

const { log } = console;

const commandOptions = command.opts();

const { key, inputPath, locales } = commandOptions;

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

initializeAPIClient(key);



log(
  chalk.magenta(
    `Messages will be translated in to the following locales: ${chalk.bold(
      locales.join(', '),
    )} \n`,
  ),
);

log(
  chalk.magenta(
    `Using OpenAPI key ******${chalk.bold(
      key.slice(-NUMBER_OF_API_KEY_CHARACTERS_TO_SHOW),
    )} \n`,
  ),
);
