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
    uses: { type: String, default: 'Standard pharmaceutical application.' },
    sideEffects: { type: String, default: 'Consult a physician if irritation occurs.' },
    dosage: { type: String, default: 'As directed by a licensed medical practitioner.' },
    storage: { type: String, default: 'Keep in a cool, dry place. Protect from light.' } 
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
