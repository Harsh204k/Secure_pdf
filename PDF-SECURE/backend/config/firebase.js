const admin = require('firebase-admin');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

let initError = null;

// Initialize Firebase Admin
if (!admin.apps.length) {
    try {
        let serviceAccount = null;

        if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
            const json = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
            serviceAccount = JSON.parse(json);
        } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            // Common on Vercel: JSON is stored with escaped newlines
            const raw = process.env.FIREBASE_SERVICE_ACCOUNT.replace(/\\n/g, '\n');
            serviceAccount = JSON.parse(raw);
        } else {
            // Local dev fallback ONLY if file exists (this file is typically not committed)
            const keyPath = path.join(__dirname, 'serviceAccountKey.json');
            if (fs.existsSync(keyPath)) {
                serviceAccount = require(keyPath);
            }
        }

        if (!serviceAccount) {
            initError = new Error(
                'Firebase Admin not configured. Set FIREBASE_SERVICE_ACCOUNT (JSON) or FIREBASE_SERVICE_ACCOUNT_BASE64 in the backend environment.'
            );
        } else {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('Firebase Admin Initialized');
        }
    } catch (error) {
        initError = error;
        console.error('Firebase Admin Initialization Error:', error.message);
    }
}

const firebaseReady = admin.apps.length > 0;
const db = firebaseReady ? admin.firestore() : null;
const auth = firebaseReady ? admin.auth() : null;

module.exports = { admin, db, auth, firebaseReady, initError };
