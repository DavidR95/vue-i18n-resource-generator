# Vue I18n Resource Generator

A CLI tool that utilizes the OpenAI API to automatically generate static Vue I18n resources.

## Preface

Note that this tool is still generally very much in the experimental phase. It is currently limited to only converting/generating JSON and provides no guarantee that the translations returned will be accurate.

If you are paying as you go for OpenAI, be aware that it is likely that multiple requests will be sent to OpenAI during this process.

## Installation

```bash
npm install -g vue-i18n-resource-generator
```

## Usage

```bash
npx vue-i18n-resource-generator [options]
```

### Options

```
Options:
  -v --version                Outputs the current library version.
  -k, --key <key>             Your OpenAI API key.
  -i, --input-path <path>     The path to the JSON file containing the Vue I18n messages you would like to translate.
  -o, --output-path <path>    The path to the directory where you would like your translated JSON files to be written to.
  -l, --locales <locales...>  The list of locales you would like to translate your Vue I18n messages in to. One JSON file will be generated per locale.
  -h, --help                  Displays help information.
```
