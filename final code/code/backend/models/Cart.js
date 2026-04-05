import mongoose from 'mongoose';

const cartSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
            quantity: { type: Number, required: true, default: 1 }
        }
    ]
}, { timestamps: true });

export default mongoose.model('Cart', cartSchema);
