const common = {
  paths: ['features/**/*.feature'],
  retry: 1,
  requireModule: ['tsx/cjs'],
  require: [
    'support/**/*.ts',
    'steps/**/*.steps.ts'
  ],
  format: [
    'progress-bar',
    'html:test-results/cucumber-report.html'
  ]
};

module.exports = {
  default: { ...common, tags: 'not @known-defect' },
  // npx cucumber-js -p known-defect
  'known-defect': { ...common, tags: '@known-defect' }
};
