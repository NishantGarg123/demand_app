const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Product = require('../models/product');

// Get all orders
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().populate('items.product');
        res.render('orders/index', { orders });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Show create order form
router.get('/create', async (req, res) => {
    try {
        const products = await Product.find();
        res.render('orders/create', { products });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new order
router.post('/', async (req, res) => {
    try {
        const { retailerName, items } = req.body;
        
        // Calculate total amount
        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (product) {
                totalAmount += product.price * item.quantity;
                orderItems.push({
                    product: item.productId,
                    quantity: item.quantity
                });
            }
        }

        const order = new Order({
            retailerName,
            items: orderItems,
            totalAmount
        });

        await order.save();
        res.redirect('/orders');
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router; 