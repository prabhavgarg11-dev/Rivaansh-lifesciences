const Order = require("../models/Order");

// Task 5: Order Controllers
exports.createOrder = async (req, res) => {
  try {
    const { products, totalAmount, userName, address } = req.body;
    const newOrder = new Order({ products, totalAmount, userName, address });
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ message: "Store Order Error" });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("products.productId").sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const o = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(o);
  } catch (err) {
    res.status(400).json({ message: "Status Update Error" });
  }
};
