const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true }
        }
    ],
    totalAmount: { type: Number, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    status: { type: String, required: true, default: 'pending', enum: ['pending', 'confirmed', 'delivered'] },
    prescription: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
