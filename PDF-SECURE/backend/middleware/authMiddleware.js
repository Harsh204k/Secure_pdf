const { admin, db } = require('../config/firebase');

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    let token;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;

        // Check availability strictly against database state
        const userDoc = await db.collection('users').doc(decodedToken.uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            if (userData.disabled) {
                return res.status(403).json({ 
                    message: 'Account suspended due to security violations.',
                    reason: userData.disabledReason || 'Terms verification pending'
                });
            }
        }

        next();
    } catch (error) {
        console.error('Auth Error:', error);
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};

module.exports = authMiddleware;
