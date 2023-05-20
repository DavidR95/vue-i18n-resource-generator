import { Configuration, OpenAIApi } from "openai";
import { program } from 'commander';
import fs from 'fs/promises';

program
  .option('-k, --key <type>')
  .option('-i, --input-path <type>');

program.parse();

const options = program.opts();

let data = '';

try {
    data = await fs.readFile(options.inputPath, { encoding: 'utf8' });
    console.log(data);
  } catch (err) {
    console.log(err);
  }

const configuration = new Configuration({
  apiKey: options.key,
});

const openai = new OpenAIApi(configuration);

const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Translate the values in the following JSON in to the following locales: 'de-DE'. Translation must adhere to the Vue I18n message syntax.
    ${data}`,
    temperature: 0,
    max_tokens: 100,
  });

console.log(completion.data.choices[0].text);
