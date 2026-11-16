const fs = require('node:fs');
const cases = JSON.parse(fs.readFileSync('test-data/personal-name-id.json','utf8'));
const features = JSON.parse(fs.readFileSync('test-results/personal-identity/personal-details.json','utf8'));
const results = features.flatMap(f => f.elements || []).filter(e => e.type === 'scenario').map(e => {
    const failed = [...(e.before || []), ...(e.steps || []), ...(e.after || [])].filter(s => s.result?.status === 'failed');
    const id = e.name.match(/ED_\d+/)?.[0];
    return { id, name: e.name, status: failed.length ? 'FAIL' : e.steps.every(s=>s.result?.status==='passed') ? 'PASS' : 'INCOMPLETE',
        failures: failed.map(s=>s.result.error_message) };
});
const missing = cases.map(c=>c.id).filter(id=>!results.some(r=>r.id===id));
const output = { generatedAt: new Date().toISOString(), total: results.length,
    passed: results.filter(r=>r.status==='PASS').length, failed: results.filter(r=>r.status==='FAIL').length,
    missing, results };
fs.writeFileSync('test-results/personal-identity/personal-details-summary.json',JSON.stringify(output,null,2));
const text = '# Personal Details results\n\n'+
    `Run UTC: ${output.generatedAt}\n\n${output.total} scenarios; ${output.passed} PASS; ${output.failed} FAIL. Missing IDs: ${missing.join(', ') || 'none'}.\n\n`+
    '| Case | Result |\n| --- | --- |\n'+results.map(r=>`| ${r.id} | ${r.status} |`).join('\n')+
    '\n\n## Failures\n\n'+results.filter(r=>r.failures.length).map(r=>`### ${r.id}\n\n\x60\x60\x60text\n${r.failures.join('\n')}\n\x60\x60\x60`).join('\n\n');
fs.writeFileSync('test-results/personal-identity/personal-details-run-summary.md',text);
const messages = fs.readFileSync('test-results/personal-identity/personal-details.ndjson','utf8').trim().split('\n').map(line=>JSON.parse(line));
const evidence = new Map();
for (const message of messages) {
    const a = message.attachment;
    if (!a || a.mediaType !== 'application/json') continue;
    const data = JSON.parse(a.body);
    evidence.set(a.testCaseStartedId, { ...evidence.get(a.testCaseStartedId), ...data });
}
const findings = [...evidence.values()].filter(e=>results.some(r=>r.id===e.testCase?.id && r.status==='FAIL'));
fs.writeFileSync('test-results/personal-identity/personal-details-defect-evidence.json',JSON.stringify(findings,null,2));
fs.mkdirSync('docs',{ recursive:true });
fs.writeFileSync('docs/personal-identity-last-run.md',text);
fs.writeFileSync('docs/personal-identity-defect-evidence.json',JSON.stringify(findings,null,2));
console.log(JSON.stringify({ total:output.total,passed:output.passed,failed:output.failed,missing }));
