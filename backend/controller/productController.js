const Product = require('../model/Product');
const cloudinary = require('../config/cloudinary');
const fs = require('fs/promises');

const removeTempFile = async (filePath) => {
    if (!filePath) return;
    try {
        await fs.unlink(filePath);
    } catch (error) {
        console.error(`Could not remove temp upload: ${error.message}`);
    }
};

//getproducts
const getProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'server error'});
    }
};

//getprodect by id 
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
             res.json(product);
        }
        else {
            res.status(404).json({ message: 'Product not found'});
        }
    } catch (error) {
        res.status(500).json({ message: 'server error'});
    }
};

//create product post
const createProduct = async (req,res) => {
    try {
        const { name, description, price, category, stock } = req.body;
        let imageUrl = '';
        if (req.file ) {
            const result = await cloudinary.uploader.upload(req.file.path);
            //console.log(result);
            imageUrl = result.secure_url;
            await removeTempFile(req.file.path);
        }
        const product = new Product({
                   name,
                   description,
                   price,
                   category,
                   stock,
                   imageUrl
        });
        const savedProduct = await product.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(500).json({ message: 'server error'});
    }
};

//update product put
const updateProduct = async (req,res) => {
    try {
        const { name, description, price, category, stock } = req.body;
        const product = await Product.findById(req.params.id);
        if (product) {
            product.name = name || product.name;
            product.description = description || product.description;
            product.price = price || product.price;
            product.category = category || product.category;
            product.stock = stock || product.stock;
             if (req.file ) {
            const result = await cloudinary.uploader.upload(req.file.path);
            console.log(result);
            product.imageUrl = result.secure_url;
            await removeTempFile(req.file.path);
        }
        const updatedProduct = await product.save();
        res.json(updatedProduct);
        }
        else {
            res.status(404).json({ message: 'Product not found'});
        }
    } catch (error) {
        res.status(500).json({ message: 'server error'});
    }
};

//delete product delete
const deleteProduct = async (req,res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            await product.deleteOne();
            res.json({ message: 'Product removed'}); 
        }
        else {
        res.status(404).json({ message: 'Product not found'});    
        }
    } catch (error) {
        res.status(500).json({ message: 'server error'});
    }
};


module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
