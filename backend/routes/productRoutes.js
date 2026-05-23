const express = require("express");

const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controller/productController')
const multer = require('multer');
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image uploads are allowed'));
        }
        cb(null, true);
    }
});

const router = express.Router();
//allproduct
router.route('/').get(getProducts).post(protect, admin, upload.single('image'), createProduct); 
//specific products
router.route('/:id').get(getProductById).put(protect, admin, upload.single('image'), updateProduct).delete(protect, admin, deleteProduct);


module.exports = router;
