import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import seed from './seed.json' with { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  // Minimal seeding: export JSON to public so the app can fetch it
  const outPath = join(__dirname, '../public/seed.json');
  await writeFile(outPath, JSON.stringify(seed, null, 2), 'utf8');
  console.log('Seed data written to', outPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


