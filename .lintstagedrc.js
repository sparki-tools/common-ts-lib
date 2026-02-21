// lint-staged configuration for @sparki/common-ts-lib
// See: platform/.github/dev-tools/hooks/ts-husky-template/

module.exports = {
  // TypeScript files
  '*.{ts,tsx}': [
    'eslint --fix --max-warnings=0',
    'prettier --write',
  ],

  // Type checking - run on all TS files when any TS file changes
  '*.{ts,tsx}': () => 'tsc --noEmit',

  // JSON, YAML, Markdown
  '*.{json,yaml,yml,md}': [
    'prettier --write',
  ],
};
