import chalk from 'chalk';
import { initializeCLI, log } from './cli';

const NUMBER_OF_API_KEY_CHARACTERS_TO_SHOW = 4;

const { key, inputPath, locales } = initializeCLI();

log(
  `Attempting to translate Vue I18n messages found within the JSON file located at: ${chalk.bold.underline(
    inputPath,
  )} \n`,
);

log(
  `Messages will be translated in to the following locales: ${chalk.bold(
    locales.join(', '),
  )} \n`,
);

log(
  `Using OpenAPI key ******${chalk.bold(
    key.slice(-NUMBER_OF_API_KEY_CHARACTERS_TO_SHOW),
  )} \n`,
);
