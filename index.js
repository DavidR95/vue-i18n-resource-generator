import { Configuration, OpenAIApi } from "openai";
import { program } from 'commander';
import fs from 'fs/promises';
import { encode } from 'gpt-3-encoder';
import partialJSONParse from 'partial-json-parser';
import _ from 'lodash'

// The logrocket blog had article on CLI colours - or maybe commander can do it?

const MAX_TOKENS = 1000;

const MAX_PROMPT_TOKEN_LIMIT = MAX_TOKENS * (1/3);

const commaSeparatedList = (value) => value.split(',');

program
  .option('-k, --key <type>')
  .option('-i, --input-path <type>')
  .option('-l, --locales <type>', 'hm', commaSeparatedList);

program.parse();

const options = program.opts();

let data = '';

const locales = options.locales;

const localeTextList = locales.join(', ');

try {
    data = await fs.readFile(options.inputPath, { encoding: 'utf8' });
  } catch (err) {
    console.log(err);
  }

const jsonData = JSON.parse(data);

const configuration = new Configuration({
  apiKey: options.key,
});

const openai = new OpenAIApi(configuration);

const prompt = `Translate the values in the following JSON in to the following locales: ${localeTextList}. Translation must adhere to the Vue I18n message syntax.
${data}`;

const promptTokenLength = encode(prompt).length;

const arrayData = Object.entries(jsonData);

const arrayDataHalf1 = arrayData.slice(0, arrayData.length / 2);

const jsonDataHalf1 = Object.fromEntries(arrayDataHalf1);

const jsonDataHalf1TokenLength = encode(JSON.stringify(jsonDataHalf1)).length;

const newPrompt = `Translate the values in the following JSON in to the following locales: ${localeTextList}. The following rules must be followed:
- Translation must adhere to the Vue I18n message syntax.
- The response should be JSON where each locale is a root key.

${JSON.stringify(jsonDataHalf1)}`;

const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: newPrompt,
    temperature: 0,
    max_tokens: 100,
  });

const choice = completion.data.choices[0];

const finishedLocales = [];
const missingMessagesPerLocale = {};

if (choice.finish_reason === 'length') {
    const responseJSON = partialJSONParse(choice.text);

    for (const [translatedLocale, messages] of Object.entries(responseJSON)) {
        const messageKeys = Object.keys(messages);
        
        for (const locale of locales) {
            if (locale === translatedLocale) {
                const missingMessageKeys = _.difference(Object.keys(jsonData), messageKeys);
                if (missingMessageKeys === []) {
                    finishedLocales.push(locale);
                } else {
                    missingMessagesPerLocale[locale] = missingMessageKeys;
                }
            }
        }
    }

    for (const locale of Object.keys(missingMessagesPerLocale)) {
        const jsonToSend = Object.entries(jsonData).reduce((jsonToSend, [key, value]) => {
            if (missingMessagesPerLocale[locale].includes(key)) {
                jsonToSend[key] = value;
            }

            return jsonToSend;
        }, {});

        console.log(jsonToSend);

        const perLocalePrompt = `Translate the values in the following JSON in to the following locale: ${locale}. The following rules must be followed:
        - Translation must adhere to the Vue I18n message syntax.
        - The response should be JSON where each locale is a root key.
        
        ${JSON.stringify(jsonToSend)}`;

        const completion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: perLocalePrompt,
            temperature: 0,
            max_tokens: 100,
          });
        
    }
}