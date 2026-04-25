const Artwork = require('../models/Artwork');

exports.saveArtwork = async (req, res) => {
    try {
        const { title, asciiData, imageData } = req.body;
        const newArtwork = new Artwork({
            title,
            asciiData,
            imageData,
            user: req.user.id
        });
        const artwork = await newArtwork.save();
        res.json(artwork);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getArtworks = async (req, res) => {
    try {
        const artworks = await Artwork.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(artworks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getAllArtworks = async (req, res) => {
    try {
        const artworks = await Artwork.find({
            $or: [{ status: 'approved' }, { status: { $exists: false } }]
        }).populate('user', 'username').sort({ createdAt: -1 });
        res.json(artworks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getPendingArtworks = async (req, res) => {
    try {
        const artworks = await Artwork.find({ status: 'pending' }).populate('user', 'username').sort({ createdAt: -1 });
        res.json(artworks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.updateArtworkStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ msg: 'Invalid status' });
        }
        
        const artwork = await Artwork.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!artwork) {
            return res.status(404).json({ msg: 'Artwork not found' });
        }
        
        res.json(artwork);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Artwork not found' });
        }
        res.status(500).send('Server Error');
    }
};

exports.getAdminAllArtworks = async (req, res) => {
    try {
        const artworks = await Artwork.find().populate('user', 'username').sort({ createdAt: -1 });
        res.json(artworks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteArtwork = async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id);
        if (!artwork) {
            return res.status(404).json({ msg: 'Artwork not found' });
        }
        await artwork.deleteOne();
        res.json({ msg: 'Artwork removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Artwork not found' });
        }
        res.status(500).send('Server Error');
    }
};

exports.getRawArtwork = async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id);
        if (!artwork) {
            return res.status(404).send('Artwork not found');
        }
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.send(artwork.asciiData);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).send('Artwork not found');
        }
        res.status(500).send('Server Error');
    }
};
