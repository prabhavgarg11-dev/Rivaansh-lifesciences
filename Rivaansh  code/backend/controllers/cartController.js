const Cart = require('../models/Cart');

// GET /api/cart — fetch user's cart with populated product details
exports.getUserCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user._id })
            .populate('items.productId', 'name price brand category prescriptionRequired imageUrl');
        if (!cart) {
            cart = await Cart.create({ userId: req.user._id, items: [] });
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/cart — add item or update quantity (quantity is a delta: +1 to add, -1 to reduce)
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        if (!productId || quantity === undefined) {
            return res.status(400).json({ message: 'productId and quantity are required' });
        }

        let cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) cart = await Cart.create({ userId: req.user._id, items: [] });

        const itemIndex = cart.items.findIndex(i => i.productId.toString() === productId);

        if (itemIndex > -1) {
            const newQty = cart.items[itemIndex].quantity + Number(quantity);
            if (newQty <= 0) {
                // Remove item if quantity drops to 0
                cart.items.splice(itemIndex, 1);
            } else {
                cart.items[itemIndex].quantity = newQty;
            }
        } else {
            if (Number(quantity) > 0) {
                cart.items.push({ productId, quantity: Number(quantity) });
            }
        }

        await cart.save();
        // Return populated cart
        const updatedCart = await Cart.findById(cart._id).populate('items.productId', 'name price brand category prescriptionRequired imageUrl');
        res.json(updatedCart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/cart/:productId — remove a specific item
exports.removeFromCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        cart.items = cart.items.filter(
            i => i.productId.toString() !== req.params.productId
        );
        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/cart — clear entire cart (called after order placement)
exports.clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
