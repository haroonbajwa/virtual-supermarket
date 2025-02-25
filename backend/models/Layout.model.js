const mongoose = require('mongoose');

const SlotSchema = new mongoose.Schema({
    id: String,
    position: Number,
    isOccupied: { type: Boolean, default: false },
    product: {
        name: String,
        quantity: Number
    }
});

const RackSchema = new mongoose.Schema({
    id: String,
    type: { type: String, enum: ['single', 'double'] },
    slots: [SlotSchema],
    position: {
        x: Number,
        y: Number
    }
});

const AisleSchema = new mongoose.Schema({
    id: String,
    name: String,
    racks: [RackSchema],
    position: {
        x: Number,
        y: Number
    }
});

const LayoutSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    aisles: [AisleSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Layout', LayoutSchema);
