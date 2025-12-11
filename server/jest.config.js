module.exports = {
  testTimeout: 20000,
  globalTeardown: './tests/util/global-teardown.js',
  transform: {
    '^.+\\.(js|mjs)$': 'babel-jest'
  },
  transformIgnorePatterns: ['node_modules/(?!(parse5|jsdom-global)/)']
};
