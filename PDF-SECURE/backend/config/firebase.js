const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Firebase Admin
if (!admin.apps.length) {
    try {
        let credential;
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            // Load from Environment Variable (Secure)
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            credential = admin.credential.cert(serviceAccount);
        } else {
            // Fallback to local file (Legacy/Dev)
            console.warn('FIREBASE_SERVICE_ACCOUNT not set. Attempting to load from file...');
            const serviceAccount = require('./serviceAccountKey.json');
            credential = admin.credential.cert(serviceAccount);
        }

        admin.initializeApp({
            credential: credential
        });
        console.log('Firebase Admin Initialized');
    } catch (error) {
        console.error('Firebase Admin Initialization Error:', error.message);
    }
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
