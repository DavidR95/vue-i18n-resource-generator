import { createCommand } from '@commander-js/extra-typings';
import { name, description, version } from '../../package.json';

export const command = createCommand()
  .name(name)
  .description(description)
  .version(version, '-v --version', 'Outputs the current library version.')
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
    'The list of locales you would like to translate your Vue I18n messages in to. One JSON file will be generated per locale.',
  )
  .helpOption('-h, --help', 'Displays help information.')
  .showHelpAfterError('(add --help for additional information)')
  .parse();
