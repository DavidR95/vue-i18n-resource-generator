declare module 'partial-json-parser' {
  const partialJSONParse: <T extends object>(value: string) => T;

  export = partialJSONParse;
}
