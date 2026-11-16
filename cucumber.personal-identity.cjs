module.exports = { default: {
    paths: ['features/personal-name-id.feature'],
    requireModule: ['tsx/cjs'],
    require: ['support/**/*.ts', 'steps/personal-name-id.steps.ts'],
    parallel: 2,
    format: process.argv.includes('--dry-run') ? ['summary'] : ['summary', 'json:test-results/personal-identity/personal-details.json',
        'message:test-results/personal-identity/personal-details.ndjson', 'html:test-results/personal-identity/personal-details.html']
} };
