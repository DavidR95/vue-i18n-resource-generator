import { createCommand } from 'commander';
import chalk from 'chalk';
import { name, description, version } from '../package.json';

const NUMBER_OF_API_KEY_CHARACTERS_TO_SHOW = 4;

const { log } = console;

const command = createCommand();

command
  .name(name)
  .description(description)
  .version(version, '-v --version', 'Outputs the current library version.')
  .helpOption('-h, --help', 'Displays help information.')
  .showHelpAfterError('(add --help for additional information)');

command
  .requiredOption('-k, --key <key>', 'Your OpenAI API key.')
  .requiredOption(
    '-i, --input-path <path>',
    'The path to the JSON file containing the Vue I18n messages you would like to translate.',
  )
  .option(
    '-o, --output-path <path>',
    'The path to the directory where you would like your translated JSON files to be written to.',
    process.cwd(),
  )
  .requiredOption(
    '-l, --locales <locales...>',
    'The list of locales you would like to translate your input messages in to.',
  );

command.parse();

const commandOptions = command.opts();

const { key, inputPath, locales } = commandOptions;

log(chalk.magenta(`Attempting to translate Vue I18n messages found within the JSON file located at: ${chalk.bold.underline(inputPath)} \n`));

log(chalk.magenta(`Messages will be translated in to the following locales: ${chalk.bold(locales.join(', '))} \n`));

log(
  chalk.magenta(
    `Using OpenAPI key ******${chalk.bold(
      key.slice(-NUMBER_OF_API_KEY_CHARACTERS_TO_SHOW),
    )}`,
  ),
);
