const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: { type: String, default: 'Anonymous' }, 
  description: { type: String, required: true },
  region: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Investigating', 'Resolved'], default: 'Pending' },
  evidenceUrl: { type: String },
  likes: { type: Number, default: 0 },
  comments: [
    {
      user: String,
      text: String,
      isOfficial: { type: Boolean, default: false }, // For Police/Partners
      date: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);