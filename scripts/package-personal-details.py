from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parent.parent
files = [
    'package.json', 'package-lock.json', 'tsconfig.json', 'cucumber.js', 'cucumber.ed.cjs', '.env.example',
    'features/personal-details.feature', 'steps/personal-details.steps.ts', 'test-data/personal-details.json',
    'scripts/run-personal-details.cjs', 'scripts/node-userinfo.cjs', 'scripts/report-personal-details.cjs',
    'scripts/package-personal-details.py', 'docs/personal-details-handover.md',
    'docs/personal-details-last-run.md', 'docs/personal-details-defect-evidence.json',
    'docs/message-to-lead.md', 'test-results/personal-details.html', 'test-results/personal-details.json',
    'test-results/personal-details.ndjson', 'test-results/personal-details-run-summary.md'
]
for directory in ('pages', 'support'):
    files.extend(str(p.relative_to(root)) for p in (root / directory).glob('*.ts'))
for name in files:
    if not (root / name).is_file():
        raise FileNotFoundError(name)
output = root / 'deliverables' / 'Khoi-Personal-Details.zip'
output.parent.mkdir(exist_ok=True)
with ZipFile(output, 'w', ZIP_DEFLATED) as archive:
    for name in files:
        archive.write(root / name, Path(name).as_posix())
with ZipFile(output) as archive:
    assert archive.testzip() is None
    assert not any(n == '.env' or 'node_modules/' in n for n in archive.namelist())
print(str(output))
