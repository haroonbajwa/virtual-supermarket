const mongoose = require('mongoose');

const LayoutSchema = new mongoose.Schema({
    name: { type: String, required: true },
    aisles: [{ type: mongoose.Schema.Types.Mixed }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Layout', LayoutSchema);
