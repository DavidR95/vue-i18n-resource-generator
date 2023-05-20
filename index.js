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

const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: 'say hello world',
    temperature: 0,
  });

console.log(completion.data.choices[0].text);
