const User = require('../models/User');

module.exports = async function(req, res, next) {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            console.log('AdminAuth Failed: User not found in DB for ID:', req.user.id);
            return res.status(403).json({ msg: 'Access denied. User not found.' });
        }
        if (!user.isAdmin) {
            console.log('AdminAuth Failed: User exists but isAdmin is false for:', user.username);
            return res.status(403).json({ msg: 'Access denied. Admin privileges required.' });
        }
        next();
    } catch (err) {
        console.error('AdminAuth Error:', err.message);
        res.status(500).send('Server Error');
    }
};
