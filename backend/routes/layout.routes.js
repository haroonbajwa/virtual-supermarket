const router = require('express').Router();
const Layout = require('../models/Layout.model');

// Get all layouts
router.get('/', async (req, res) => {
    try {
        const layouts = await Layout.find();
        res.json(layouts);
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});

// Get a specific layout
router.get('/:id', async (req, res) => {
    try {
        const layout = await Layout.findById(req.params.id);
        res.json(layout);
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});

// Create a new layout
router.post('/', async (req, res) => {
    try {
        const newLayout = new Layout(req.body);
        const savedLayout = await newLayout.save();
        res.json(savedLayout);
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});

// Update a layout
router.put('/:id', async (req, res) => {
    try {
        const updatedLayout = await Layout.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        );
        res.json(updatedLayout);
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});

// Delete a layout
router.delete('/:id', async (req, res) => {
    try {
        await Layout.findByIdAndDelete(req.params.id);
        res.json('Layout deleted successfully');
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});

module.exports = router;
