import chalk from 'chalk';
import { command } from './command/command';

const NUMBER_OF_API_KEY_CHARACTERS_TO_SHOW = 4;

const { log } = console;

command.parse();

const commandOptions = command.opts();

const { key, inputPath, locales } = commandOptions;

log(
  chalk.magenta(
    `Attempting to translate Vue I18n messages found within the JSON file located at: ${chalk.bold.underline(
      inputPath,
    )} \n`,
  ),
);

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
