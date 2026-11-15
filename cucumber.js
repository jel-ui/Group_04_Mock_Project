module.exports = {
  default: {
    paths: ['features/**/*.feature'],
    requireModule: ['tsx/cjs'],
    require: [
      'support/**/*.ts',
      'steps/**/*.steps.ts'
    ],
    format: [
      'progress-bar',
      'html:test-results/cucumber-report.html'
    ]
  }
};
