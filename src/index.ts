import { program } from 'commander';

console.log('hello world');

program
  .name('string-util')
  .description('CLI to some JavaScript string utilities')
  .version('0.8.0');

program.option('-k, --key <type>').option('-i, --input-path <type>');
// .option('-l, --locales <type>', 'hm', commaSeparatedList);
