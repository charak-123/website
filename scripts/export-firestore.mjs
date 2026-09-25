/**
 * Export Firestore collections to a single .xlsx workbook, one sheet each.
 *
 * This runs on your machine with the Admin SDK, not in the browser: the
 * security rules in firestore.rules deliberately forbid a client from reading
 * the waitlist at all, and let a doctor read only their own record. An export
 * of everyone's details is an ops job, so it uses a service account key.
 *
 *   node scripts/export-firestore.mjs                    # doctors + waitlist
 *   node scripts/export-firestore.mjs doctors            # just one collection
 *   node scripts/export-firestore.mjs --out ~/regs.xlsx
 */
import { existsSync } from 'node:fs';
import { mkdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import ExcelJS from 'exceljs';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Columns we want first and in this order; anything else in the document is
// appended after them, so a new field added to the form still gets exported.
const PREFERRED_COLUMNS = {
  doctors: [
    'id', 'createdAt', 'reference', 'name', 'email', 'phone', 'dialCode',
    'phoneLocal', 'specialty', 'specialtyOther', 'experience', 'country',
    'city', 'state', 'channels', 'verification_status', 'source',
    'authMethod', 'emailVerified', 'consent_at', 'uid'
  ],
  waitlist: ['id', 'createdAt', 'email']
};

function parseArgs(argv) {
  const collections = [];
  let out = null;
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--out' || argv[i] === '-o') {
      out = argv[i + 1];
      i += 1;
    } else if (argv[i].startsWith('-')) {
      throw new Error(`Unknown option: ${argv[i]}`);
    } else {
      collections.push(argv[i]);
    }
  }
  return {
    collections: collections.length ? collections : ['doctors', 'waitlist'],
    out
  };
}

function credentialPath() {
  const fromEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (fromEnv) return resolve(fromEnv);
  const fallback = resolve(projectRoot, 'serviceAccountKey.json');
  if (existsSync(fallback)) return fallback;
  throw new Error(
    'No service account key found.\n' +
    '  Firebase console > Project settings > Service accounts > Generate new private key,\n' +
    `  then save it as ${fallback} (it is gitignored) or point\n` +
    '  GOOGLE_APPLICATION_CREDENTIALS at it.'
  );
}

/** Flatten one Firestore value into something a spreadsheet cell can hold. */
export function toCell(value) {
  if (value === null || value === undefined) return '';
  if (value instanceof Timestamp) return value.toDate();
  if (Array.isArray(value)) return value.map(toCell).join(', ');
  if (typeof value === 'object') {
    // GeoPoint, DocumentReference, and plain maps all land here.
    if (typeof value.latitude === 'number' && typeof value.longitude === 'number') {
      return `${value.latitude}, ${value.longitude}`;
    }
    if (typeof value.path === 'string') return value.path;
    // A checkbox group is stored as a boolean map ({online: true, home: false});
    // list the ones that are on rather than dumping raw JSON into the cell.
    const entries = Object.entries(value);
    if (entries.length && entries.every(([, v]) => typeof v === 'boolean')) {
      return entries.filter(([, v]) => v).map(([k]) => k).join(', ');
    }
    return JSON.stringify(value);
  }
  return value;
}

export function columnsFor(name, rows) {
  const seen = new Set();
  const ordered = [];
  for (const key of PREFERRED_COLUMNS[name] ?? ['id']) {
    ordered.push(key);
    seen.add(key);
  }
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (!seen.has(key)) {
        ordered.push(key);
        seen.add(key);
      }
    }
  }
  // Drop preferred columns that this collection never actually uses.
  const used = new Set(rows.flatMap((row) => Object.keys(row)));
  return ordered.filter((key) => used.has(key));
}

export function addSheet(workbook, name, rows) {
  const sheet = workbook.addWorksheet(name);
  const columns = columnsFor(name, rows);

  if (!columns.length) {
    sheet.addRow([`No documents in "${name}".`]);
    return sheet;
  }

  sheet.columns = columns.map((key) => ({
    header: key,
    key,
    // Wide enough for the header and the longest value, within reason.
    width: Math.min(
      44,
      Math.max(12, key.length + 2, ...rows.map((r) => String(r[key] ?? '').length + 2))
    )
  }));

  for (const row of rows) sheet.addRow(row);

  sheet.getRow(1).font = { bold: true };
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } };

  // Only ask for columns this sheet actually has: getColumn() treats an
  // unknown key as a letter address and throws.
  for (const key of ['createdAt', 'consent_at']) {
    if (columns.includes(key)) sheet.getColumn(key).numFmt = 'yyyy-mm-dd hh:mm';
  }

  return sheet;
}

async function main() {
  const { collections, out } = parseArgs(process.argv.slice(2));
  const keyFile = credentialPath();
  const serviceAccount = JSON.parse(await readFile(keyFile, 'utf8'));

  initializeApp({ credential: cert(serviceAccount), projectId: serviceAccount.project_id });
  const db = getFirestore();

  const workbook = new ExcelJS.Workbook();
  workbook.created = new Date();

  for (const name of collections) {
    const snapshot = await db.collection(name).get();
    const rows = snapshot.docs.map((doc) => {
      const row = { id: doc.id };
      for (const [key, value] of Object.entries(doc.data())) row[key] = toCell(value);
      return row;
    });
    // Newest first — that is the order ops actually reads these in.
    rows.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    addSheet(workbook, name, rows);
    console.log(`${name}: ${rows.length} document${rows.length === 1 ? '' : 's'}`);
  }

  const stamp = new Date().toISOString().slice(0, 10);
  const target = out
    ? resolve(out)
    : resolve(projectRoot, 'exports', `charak-firestore-${stamp}.xlsx`);
  await mkdir(dirname(target), { recursive: true });
  await workbook.xlsx.writeFile(target);
  console.log(`\nWrote ${target}`);
}

// Only run when invoked directly, so the helpers above stay importable by tests.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message || error);
    process.exit(1);
  });
}
