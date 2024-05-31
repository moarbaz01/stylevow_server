const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// Revenue
exports.totalRevenue = async (req, res) => {
    try {
        const revenue = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalAmount" },
                },
            },
        ]);
        res.status(200).json(revenue);
    } catch (err) {
        res.status(500).json(err);
    }
}

// Monthly sales
exports.monthlySales = async (req, res) => {
    const date = new Date();
    const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
    const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

    try {
        const sales = await Order.aggregate([
            { $match: { createdAt: { $gte: previousMonth } } },
            {
                $project: {
                    month: { $month: "$createdAt" },
                    sales: "$amount",
                },
            },
            {
                $group: {
                    _id: "$month",
                    total: { $sum: "$sales" },
                },
            },
        ]);
        res.status(200).json(sales);
    } catch (err) {
        res.status(500).json(err);
    }
}

// Daily Sales
exports.dailySales = async (req, res) => {
    const date = new Date();
    const lastDay = new Date(date.setDate(date.getDate() - 1));
    const previousDay = new Date(new Date().setDate(lastDay.getDate() - 1));

    try {
        const sales = await Order.aggregate([
            { $match: { createdAt: { $gte: previousDay } } },
            {
                $project: {
                    day: { $dayOfMonth: "$createdAt" },
                    sales: "$amount",
                },
            },
            {
                $group: {
                    _id: "$day",
                    total: { $sum: "$sales" },
                },
            },
        ]);
        res.status(200).json(sales);
    } catch (err) {
        res.status(500).json(err);
    }
}

// Abondoned Orders
exports.abondonedOrders = async (req, res) => {
    try {
        const orders = await Order.find({ status: "cancel" });
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json(err);
    }
}

// Conversion rate
exports.conversionRate = async (req, res) => {
    try {
        const users = await User.find();
        const orders = await Order.find();
        const conversionRate = orders.length / users.length;
        res.status(200).json(conversionRate);
    } catch (err) {
        res.status(500).json(err);
    }
}

// Best Selling Products
exports.bestSellingProducts = async (req, res) => {
    try {
        const products = await Product.find();
        const bestSellingProducts = products.sort((a, b) => b.sold - a.sold);
        res.status(200).json(bestSellingProducts);
    } catch (err) {
        res.status(500).json(err);
    }
}

// Shopping Cart Abondend rate
exports.shoppingCartAbondendRate = async (req, res) => {
    try {
        const orders = await Order.find();
        const shoppingCartAbondendRate = orders.filter(order => order.status === "cancel").length / orders.length;
        res.status(200).json(shoppingCartAbondendRate);
    } catch (err) {
        res.status(500).json(err);
    }
}

// ROI
exports.roi = async (req, res) => {
    try {
        const revenue = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalAmount" },
                },
            },
        ]);
        const orders = await Order.find();
        const roi = (revenue[0].totalRevenue / orders.length) * 100;
        res.status(200).json(roi);
    } catch (err) {
        res.status(500).json(err);
    }
}

