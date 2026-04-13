const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional if guest 
  },
  userId: {
    type: String, // String representation or guest ID
    required: false
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  ipFallback: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Location', locationSchema);
