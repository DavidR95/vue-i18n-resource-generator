import { Command } from 'commander';
import { name, description, version } from '../package.json';

const program = new Command();

program
  .name(name)
  .description(description)
  .version(version);

program.option('-k, --key <type>').option('-i, --input-path <type>');
// .option('-l, --locales <type>', 'hm', commaSeparatedList);

program.parse();

console.log(program.opts());
