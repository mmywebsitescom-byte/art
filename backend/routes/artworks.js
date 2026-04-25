const express = require('express');
const router = express.Router();
const artController = require('../controllers/artController');
const auth = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminAuth');

router.post('/', auth, artController.saveArtwork);
router.get('/', auth, artController.getArtworks);
router.get('/all', artController.getAllArtworks);
router.get('/:id/raw', artController.getRawArtwork);

router.get('/pending', auth, adminAuth, artController.getPendingArtworks);
router.get('/admin/all', auth, adminAuth, artController.getAdminAllArtworks);
router.put('/:id/status', auth, adminAuth, artController.updateArtworkStatus);
router.delete('/:id', auth, adminAuth, artController.deleteArtwork);

module.exports = router;
