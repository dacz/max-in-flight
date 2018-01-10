module.exports = {
  extends: 'dacz-node',
  rules: {
    'security/detect-object-injection': 0,
    'no-unused-vars': [2, { argsIgnorePattern: '^_', args: 'after-used' }],
  },
};
