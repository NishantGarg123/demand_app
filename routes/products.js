const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Product = require('../models/product');

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb('Error: Images only!');
    }
});

// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.render('products/index', { products });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Show add product form
router.get('/add', (req, res) => {
    res.render('products/add');
});

// Add new product
router.post('/', upload.single('image'), async (req, res) => {
    const product = new Product({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        image: '/uploads/' + req.file.filename
    });

    try {
        const newProduct = await product.save();
        res.redirect('/products');
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router; 