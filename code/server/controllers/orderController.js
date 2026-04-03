const Order = require("../models/Order");

// Task 4 & 5: Order CRUD
exports.createOrder = async (req, res) => {
  try {
    const { products, totalAmount, userName, address } = req.body;
    const newOrder = new Order({ products, totalAmount, userName, address });
    await newOrder.save();
    res.status(201).json({ success: true, message: "Order placed successfully", order: newOrder });
  } catch (err) {
    res.status(400).json({ success: false, message: "Checkout Error" });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("products.productId")
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ status: "Fetch Error" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const o = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.status(200).json({ message: "Status Updated", order: o });
  } catch (err) {
    res.status(400).json({ status: "Update Failure" });
  }
};

exports.paymentConfirmation = async (req, res) => {
  try {
    const { provider, paymentId, status = 'Paid', amount } = req.body;
    const updates = {
      paymentStatus: status,
      paymentProvider: provider || 'unknown',
      paymentId: paymentId || '',
      status: status === 'Paid' ? 'Confirmed' : 'Pending'
    };
    const order = await Order.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.status(200).json({ success: true, message: 'Payment confirmed', order });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Payment confirmation failed' });
  }
};

exports.razorpayWebhook = async (req, res) => {
  try {
    const payload = req.body;
    const signature = req.headers['x-razorpay-signature'];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'rivaansh_razorpay_secret';
    const crypto = require('crypto');

    const expectedSignature = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
    if (signature !== expectedSignature) {
      return res.status(401).json({ success: false, message: 'Invalid razorpay signature' });
    }

    if (payload.event === 'payment.captured' && payload.payload && payload.payload.payment && payload.payload.payment.entity) {
      const razorPayment = payload.payload.payment.entity;
      // Persist or update linked order if your metadata includes orderId.
      const orderId = razorPayment.notes?.orderId;
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: 'Paid',
          paymentProvider: 'razorpay',
          paymentId: razorPayment.id,
          status: 'Confirmed'
        });
      }
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Razorpay webhook error', err);
    res.status(500).json({ success: false, message: 'Webhook handling failed' });
  }
};

exports.paypalWebhook = async (req, res) => {
  try {
    const event = req.body;
    if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED' && event.resource) {
      const orderId = event.resource.custom_id || event.resource.invoice_id;
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: 'Paid',
          paymentProvider: 'paypal',
          paymentId: event.resource.id,
          status: 'Confirmed'
        });
      }
    }
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('PayPal webhook error', err);
    res.status(500).json({ success: false, message: 'Webhook error' });
  }
};
