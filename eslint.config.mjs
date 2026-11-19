import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';

export default [
  {
    ignores: ['dist/**/*', 'node_modules/**/*', 'flutter_nutriai/**/*', 'src/**/*'],
  },
  firebaseRulesPlugin.configs['flat/recommended'],
];
