import { Configuration, OpenAIApi } from "openai";
import { program } from 'commander';

program
  .option('-k, --key <type>');

program.parse();

const options = program.opts();

const configuration = new Configuration({
  apiKey: options.key,
});

const openai = new OpenAIApi(configuration);

console.log('hello world');
