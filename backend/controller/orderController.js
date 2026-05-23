const Order = require('../model/Order');
const Product = require('../model/Product');

const sendEmail = require('../utils/sendEmail');

const buildOrderItems = async (items = []) => {
    if (!Array.isArray(items) || items.length === 0) {
        throw new Error('Cart is empty');
    }

    const productIds = items.map((item) => item.productId || item._id);
    const products = await Product.find({ _id: { $in: productIds } });

    const orderItems = items.map((item) => {
        const productId = item.productId || item._id;
        const product = products.find((p) => p._id.toString() === productId);
        const qty = Number(item.qty);

        if (!product) {
            throw new Error('Product not found in cart');
        }

        if (!Number.isInteger(qty) || qty < 1) {
            throw new Error('Invalid product quantity');
        }

        if (product.stock < qty) {
            throw new Error(`${product.name} has only ${product.stock} items in stock`);
        }

        return {
            productId: product._id,
            qty,
            price: product.price
        };
    });

    const totalAmount = orderItems.reduce((total, item) => total + item.price * item.qty, 0);
    return { orderItems, totalAmount };
};

// Create a new order
const createOrder = async (req, res) => {
    try {
        const { items, address, paymentId } = req.body;
        if (!items || items.length === 0 || !address) {
            return res.status(400).json({ message: 'Invalid Order Data' });
        }
        else {
            const { orderItems, totalAmount } = await buildOrderItems(items);
            const order = new Order({
            user: req.user._id,
            items: orderItems,
            totalAmount,
            address,
            paymentId
        });
        await order.save();

        await Promise.all(orderItems.map((item) => (
            Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.qty } })
        )));

        const message = `Dear ${req.user.name},\n\nThank you for your order! Your order has been successfully created.\n\nOrder ID: ${order._id}\nTotal Amount: Rs. ${order.totalAmount}\nShipping Address: ${address.fullName}, ${address.street}, ${address.city}, ${address.postalCode}, ${address.country}\n\nWe will notify you once your order is shipped.\n\nBest regards,\nShopZone Team`; 

        try {
            await sendEmail(req.user.email, 'Order Created', message);
        } catch (emailError) {
            console.error(`Order email failed: ${emailError.message}`);
        }
        res.status(201).json({ message: 'Order created successfully', order });
        } 
    } catch (error) {
        res.status(500).json({ message: error.message || 'error creating order' });
    }
};

// Get all orders (admin only)
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', ' _id name ');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

//my orders
const myOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).populate('items.productId', 'name price');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: ' error fetching orders', error });
}
};

//update order status
const updateOrderStatus = async (req, res) => {
    try {
        const status = String(req.body.status || '').trim().toLowerCase();
        const allowedStatuses = ['pending', 'shipped', 'delivered'];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid order status' });
        }

        const order = await Order.findById(req.params.id);
        if (order) {
            order.status = status;
            await order.save();
            res.json({ message: 'Order status updated', order });
        }
        else {  
             res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: ' error updating order status', error });
    }   
};


        module.exports = { 
    createOrder,
    getOrders,
    myOrders,
    updateOrderStatus
 };    

module.exports.buildOrderItems = buildOrderItems;
