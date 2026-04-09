const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    userId: { type: String, default: 'guest' }, // Support both guest and registered
    userName: { type: String, default: 'Guest' },
    email: { type: String },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    items: [
        {
            productId: { type: String, required: true },
            name: { type: String },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true }
        }
    ],
    totalAmount: { type: Number, required: true },
    status: { type: String, required: true, default: 'Pending', enum: ['Pending', 'Paid', 'Confirmed', 'Delivered', 'Cancelled'] },
    paymentId: { type: String },
    provider: { type: String }, // e.g. Razorpay, PayPal, WhatsApp
    prescription: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
