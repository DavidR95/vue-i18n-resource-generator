import { createCommand } from 'commander';
import { name, description, version } from '../package.json';

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

console.log(command.opts());
