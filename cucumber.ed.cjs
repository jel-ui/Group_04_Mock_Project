module.exports = { default: {
    paths: ['features/personal-details.feature'],
    requireModule: ['tsx/cjs'],
    require: ['support/**/*.ts', 'steps/personal-details.steps.ts'],
    parallel: 2,
    format: process.argv.includes('--dry-run') ? ['summary'] : ['summary', 'json:test-results/personal-details.json',
        'message:test-results/personal-details.ndjson', 'html:test-results/personal-details.html']
} };
