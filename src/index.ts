import { Command } from 'commander';
import { name, description, version } from '../package.json';

const program = new Command();

program.name(name).description(description).version(version)

program
  .requiredOption('-k, --key <key>', 'your OpenAI API key')
  .requiredOption(
    '-i, --input-path <path>',
    'the path to the JSON file containing the Vue I18n messages you would like to translate',
  )
  .option(
    '-o, --output-path <path>',
    'the path to the directory where you would like your translated JSON files to be written to',
    process.cwd()
  )
  .requiredOption('-l, --locales <locales...>', 'the list of locales you would like to translate your input messages in to');

program.parse();

console.log(program.opts());
