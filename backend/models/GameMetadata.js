const mongoose = require('mongoose');

const GameMetadataSchema = new mongoose.Schema({
  gameId: { type: String, required: true, unique: true, index: true }, // e.g., "novomatic/bookofra"
  isActive: { type: Boolean, default: true },
  minBet: { type: Number, default: 0.1 },
  maxBet: { type: Number, default: 100 },
  rtpOverride: { type: Number, default: null }, // if set, overrides Slotopol's RTP
  difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'very_hard'], default: 'medium' },
  order: { type: Number, default: 0 },
  tags: [String],
  // Store Slotopol provider info for quick filtering
  provider: { type: String, default: '' },
}, { timestamps: true });

// Index for faster queries
GameMetadataSchema.index({ provider: 1 });

module.exports = mongoose.model('GameMetadata', GameMetadataSchema);
