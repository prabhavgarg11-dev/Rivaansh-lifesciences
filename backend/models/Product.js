const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    badge: { type: String },
    prescriptionRequired: { type: Boolean, required: true, default: false },
    stock: { type: Number, required: true, default: 0 },
    description: { type: String, required: true },
    composition: { type: String },
    image: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
