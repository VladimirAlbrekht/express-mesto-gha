module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
    commonjs: true,
  },
  extends: 'airbnb-base',
  rules: {
    'no-underscore-dangle': ['error', { allow: ['_id'] }],
    'comma-dangle': ['error', 'always-multiline'],
    'eol-last': ['error', 'always'],
  },
};
