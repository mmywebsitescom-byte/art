const admin = require('firebase-admin');

// Initialize Firebase Admin with just the projectId for token verification.
// No service account is needed just for verifyIdToken if you're not managing users via admin SDK.
admin.initializeApp({
  projectId: 'ascii-art-generator-7482b'
});

module.exports = admin;
