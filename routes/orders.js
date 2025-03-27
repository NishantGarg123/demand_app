const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Product = require('../models/product');

// Get all orders
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().populate('items.product');
        
        // Get unique retailer names
        const retailers = [...new Set(orders.map(order => order.retailerName))];
        
        res.render('orders/index', { orders, retailers });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get orders by retailer name
router.get('/retailer/:name', async (req, res) => {
    try {
        const retailerName = req.params.name;
        const retailerOrders = await Order.find({ retailerName }).populate('items.product').sort({ orderDate: -1 });
        
        if (retailerOrders.length === 0) {
            return res.render('orders/retailer', { 
                retailerName, 
                orders: [], 
                message: 'No orders found for this retailer' 
            });
        }
        
        res.render('orders/retailer', { 
            retailerName, 
            orders: retailerOrders,
            message: null // Pass null for message when orders exist
        });
    } catch (error) {
        res.status(500).render('orders/retailer', { 
            retailerName: req.params.name, 
            orders: [],
            message: 'Error: ' + error.message
        });
    }
});

// Show create order form
router.get('/create', async (req, res) => {
    try {
        const products = await Product.find();
        
        // Get unique retailer names for the dropdown
        const allOrders = await Order.find().select('retailerName -_id');
        const existingRetailers = [...new Set(allOrders.map(order => order.retailerName))];
        
        // Check if a retailer name was passed in the query
        const preselectedRetailer = req.query.retailer || '';
        
        res.render('orders/create', { 
            products, 
            existingRetailers,
            preselectedRetailer
        });
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
        
        // Redirect to retailer page if the retailer name is provided
        if (retailerName) {
            return res.redirect(`/orders/retailer/${encodeURIComponent(retailerName)}`);
        }
        
        res.redirect('/orders');
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete order
router.delete('/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// For form submission (non-AJAX)
router.post('/:id/delete', async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).send('Order not found');
        }
        
        // Check if we need to redirect back to retailer-specific page
        const referer = req.headers.referer;
        if (referer && referer.includes('/orders/retailer/')) {
            return res.redirect(referer);
        }
        
        res.redirect('/orders');
    } catch (error) {
        res.status(500).send('Error deleting order');
    }
});

module.exports = router; 