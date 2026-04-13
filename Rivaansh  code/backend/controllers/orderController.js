const Order = require('../models/Order');
const Cart = require('../models/Cart');

exports.addOrderItems = async (req, res) => {
    try {
        const { items, address, phone, totalAmount } = req.body;
        // Parse items if sent as JSON string via FormData
        const parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
        const prescription = req.file ? `/uploads/${req.file.filename}` : null;
        
        if (!parsedItems || parsedItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }
        
        const order = new Order({
            userId: req.user._id, 
            items: parsedItems, 
            address, 
            phone, 
            totalAmount, 
            prescription
        });
        
        const createdOrder = await order.save();

        // ── Clear the user's cart after order is placed ──────────────────
        const cart = await Cart.findOne({ userId: req.user._id });
        if (cart) { cart.items = []; await cart.save(); }

        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id })
            .populate('items.productId', 'name price brand category prescriptionRequired')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('userId', 'name email phone');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
