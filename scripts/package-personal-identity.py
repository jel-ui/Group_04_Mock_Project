from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parent.parent
files = [
    'package.json', 'package-lock.json', 'tsconfig.json', 'cucumber.js', 'cucumber.personal-identity.cjs', '.env.example', '.gitignore',
    'features/personal-name-id.feature', 'steps/personal-name-id.steps.ts', 'test-data/personal-name-id.json',
    'scripts/run-personal-identity.cjs', 'scripts/node-userinfo.cjs', 'scripts/report-personal-identity.cjs', 'scripts/package-personal-identity.py',
    'docs/personal-identity-handover.md', 'docs/personal-identity-last-run.md', 'docs/personal-identity-defect-evidence.json',
    'test-results/personal-identity/personal-details.html', 'test-results/personal-identity/personal-details.json',
    'test-results/personal-identity/personal-details.ndjson', 'test-results/personal-identity/personal-details-run-summary.md'
]
for directory in ('pages', 'support'):
    files.extend(str(p.relative_to(root)) for p in (root / directory).glob('*.ts'))
for name in files:
    if not (root / name).is_file():
        raise FileNotFoundError(name)
output = root / 'deliverables' / 'Personal-Identity-Sprint-02.zip'
output.parent.mkdir(exist_ok=True)
with ZipFile(output, 'w', ZIP_DEFLATED) as archive:
    for name in files:
        archive.write(root / name, Path(name).as_posix())
with ZipFile(output) as archive:
    assert archive.testzip() is None
    assert not any(n == '.env' or 'node_modules/' in n or 'message-to-lead' in n for n in archive.namelist())
print(str(output))
