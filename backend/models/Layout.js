const mongoose = require('mongoose');

const layoutSchema = new mongoose.Schema({
  name: { type: String, required: true },
  aisles: { type: Array, default: [] },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Layout', layoutSchema);
