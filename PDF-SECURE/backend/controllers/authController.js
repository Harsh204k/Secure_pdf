const { db } = require('../config/firebase');

exports.syncUser = async (req, res) => {
    try {
        const { uid, email, name, picture } = req.user;

        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            await userRef.set({
                email,
                name: name || '',
                picture: picture || '',
                createdAt: new Date().toISOString(),
                role: 'user' // default role
            });
        }

        res.status(200).json({ message: 'User synced', user: { uid, email, name, picture } });
    } catch (error) {
        console.error('Error syncing user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { uid } = req.user;
        const { displayName, photoURL } = req.body;

        await db.collection('users').doc(uid).update({
            name: displayName,
            picture: photoURL
        });

        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

