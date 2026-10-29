import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// get the current folder
const __dirname = dirname(fileURLToPath(import.meta.url));

// use the Render secret file in production and the local file during development
const serviceAccountPath = process.env.NODE_ENV === 'production'
  ? '/etc/secrets/serviceAccountKey.json'
  : resolve(__dirname, 'credentials/serviceAccountKey.json');

// read the service account details
const serviceAccount = JSON.parse(
  readFileSync(serviceAccountPath, 'utf8')
);

// initialize firebase admin
const app = getApps().length === 0
  ? initializeApp({
      credential: cert(serviceAccount)
    })
  : getApps()[0];

// connect to firestore
const db = getFirestore(app);

export { db };