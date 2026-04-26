const admin = require('../config/firebase');
const User = require('../models/User');

module.exports = async function(req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        
        let user = await User.findOne({ email: decodedToken.email });
        if (!user) {
            let username = decodedToken.email.split('@')[0];
            let existingUsername = await User.findOne({ username });
            if (existingUsername) {
                username = `${username}_${Math.floor(Math.random() * 10000)}`;
            }
            user = new User({
                username,
                email: decodedToken.email,
                role: 'student',
                source: 'firebase'
            });
            await user.save();
        }

        req.user = { id: user.id };
        next();
    } catch (err) {
        console.error('Auth Middleware Error:', err.message);
        if (err.code && err.code.startsWith('auth/')) {
            return res.status(401).json({ msg: 'Token is not valid' });
        }
        res.status(500).json({ msg: 'Server error: ' + err.message });
    }
};
