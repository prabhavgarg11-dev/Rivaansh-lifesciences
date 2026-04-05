const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, default: 'Rivaansh Life' },
  composition: { type: String },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  category: { type: String, required: true },
  prescriptionRequired: { type: Boolean, default: false },
  description: { type: String },
  stock: { type: Number, default: 100 },
  image: { type: String, default: "https://via.placeholder.com/200" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Product", ProductSchema);
