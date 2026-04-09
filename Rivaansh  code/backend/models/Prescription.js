const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  productId: { type: Number, required: true },
  user: { type: String, required: true },
  fileName: { type: String, required: true },
  uploadedAt: { type: String, required: true },
  fileType: { type: String, required: true },
  dataUrl: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  comment: { type: String, default: 'Awaiting pharmacist review' },
  isReviewed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
