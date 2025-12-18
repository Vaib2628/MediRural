const express = require('express');
const router = express.Router();
const Order = require('../models/OrderModel');
const User = require('../models/UserModel');
const WrapAsync = require('../utility/WrapAsync');
const ExpressError = require('../utility/ExpressError');
const { body, validationResult } = require('express-validator');
const auth = require('../middlewares/auth');

//getting all the orders 
router.get('/' , auth , WrapAsync(async (req, res) => {
  const orders = await Order.find({}).populate('user').populate('items.medicine');
  res.status(200).json({ success: true, orders });
}));

router.get('/user', auth, WrapAsync(async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).populate('items.medicine');
  res.status(200).json({ success: true, orders });
}));

// Get user's subscription orders only
router.get('/user/subscriptions', auth, WrapAsync(async (req, res) => {
  const subscriptions = await Order.find({ 
    user: req.user.id, 
    isSubscription: true 
  }).populate('items.medicine');
  res.status(200).json({ success: true, subscriptions });
}));

//getting orders for suppliers based on pincode matching
router.get('/supplier', auth, WrapAsync(async (req, res) => {
  // Check if user is a supplier
  if (req.user.role !== 'supplier') {
    return res.status(403).json({ 
      success: false, 
      message: "Access denied. Only suppliers can access this endpoint." 
    });
  }

  // Get supplier's address pincode
  const supplier = await User.findById(req.user.id);
  if (!supplier || !supplier.address || !supplier.address.pincode) {
    return res.status(400).json({ 
      success: false, 
      message: "Supplier address pincode not found. Please update your profile." 
    });
  }

  const supplierPincode = supplier.address.pincode;

  // Find orders where shipping pincode matches supplier's pincode
  const orders = await Order.find({
    'shipping.pincode': supplierPincode
  }).populate('user', 'name email phone').populate('items.medicine', 'name price');

  res.status(200).json({ 
    success: true, 
    orders,
    supplierPincode,
    message: `Showing orders for pincode: ${supplierPincode}`
  });
}));

//getting revenue analytics for suppliers
router.get('/supplier/revenue', auth, WrapAsync(async (req, res) => {
  // Check if user is a supplier
  if (req.user.role !== 'supplier') {
    return res.status(403).json({ 
      success: false, 
      message: "Access denied. Only suppliers can access this endpoint." 
    });
  }

  const { period = '7d' } = req.query;
  
  // Get supplier's address pincode
  const supplier = await User.findById(req.user.id);
  if (!supplier || !supplier.address || !supplier.address.pincode) {
    return res.status(400).json({ 
      success: false, 
      message: "Supplier address pincode not found. Please update your profile." 
    });
  }

  const supplierPincode = supplier.address.pincode;

  // Calculate date range based on period
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Find orders for supplier's area within date range
  const orders = await Order.find({
    'shipping.pincode': supplierPincode,
    createdAt: { $gte: startDate }
  }).populate('items.medicine', 'name price');

  // Calculate daily revenue
  const dailyRevenue = [];
  const medicineSales = {};
  let totalRevenue = 0;
  let totalOrders = orders.length;

  // Group orders by date and calculate daily revenue
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i - 1));
    date.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const dayOrders = orders.filter(order => 
      order.createdAt >= date && order.createdAt < nextDate
    );

    const dayRevenue = dayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const dayOrderCount = dayOrders.length;

    dailyRevenue.push({
      date: date.toISOString().split('T')[0],
      revenue: dayRevenue,
      orders: dayOrderCount
    });

    totalRevenue += dayRevenue;
  }

  // Calculate medicine-wise sales
  orders.forEach(order => {
    order.items.forEach(item => {
      const medicineName = item.medicine.name;
      if (!medicineSales[medicineName]) {
        medicineSales[medicineName] = { sales: 0, revenue: 0 };
      }
      medicineSales[medicineName].sales += item.quantity;
      medicineSales[medicineName].revenue += item.price * item.quantity;
    });
  });

  const medicineSalesArray = Object.entries(medicineSales).map(([name, data]) => ({
    name,
    sales: data.sales,
    revenue: data.revenue
  })).sort((a, b) => b.revenue - a.revenue);

  // Calculate growth rate
  const firstDayRevenue = dailyRevenue[0]?.revenue || 0;
  const lastDayRevenue = dailyRevenue[dailyRevenue.length - 1]?.revenue || 0;
  const growthRate = firstDayRevenue > 0 ? ((lastDayRevenue - firstDayRevenue) / firstDayRevenue * 100).toFixed(1) : 0;

  res.status(200).json({
    success: true,
    dailyRevenue,
    medicineSales: medicineSalesArray,
    totalRevenue,
    totalOrders,
    averageOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
    growthRate: parseFloat(growthRate),
    supplierPincode,
    period
  });
}));

//getting statistics for suppliers
router.get('/supplier/stats', auth, WrapAsync(async (req, res) => {
  // Check if user is a supplier
  if (req.user.role !== 'supplier') {
    return res.status(403).json({ 
      success: false, 
      message: "Access denied. Only suppliers can access this endpoint." 
    });
  }

  // Get supplier's address pincode
  const supplier = await User.findById(req.user.id);
  if (!supplier || !supplier.address || !supplier.address.pincode) {
    return res.status(400).json({ 
      success: false, 
      message: "Supplier address pincode not found. Please update your profile." 
    });
  }

  const supplierPincode = supplier.address.pincode;

  // Find all orders for supplier's area
  const orders = await Order.find({
    'shipping.pincode': supplierPincode
  });

  // Calculate today's date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Calculate this week's date range
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - 7);
  thisWeekStart.setHours(0, 0, 0, 0);

  // Calculate statistics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const confirmedOrders = orders.filter(order => order.status === 'confirmed').length;
  const shippedOrders = orders.filter(order => order.status === 'shipped').length;
  const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
  const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;

  const todayOrders = orders.filter(order => 
    order.createdAt >= today && order.createdAt < tomorrow
  ).length;

  const thisWeekOrders = orders.filter(order => 
    order.createdAt >= thisWeekStart
  ).length;

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  res.status(200).json({
    success: true,
    totalOrders,
    pendingOrders,
    confirmedOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    totalRevenue,
    averageOrderValue,
    todayOrders,
    thisWeekOrders,
    supplierPincode
  });
}));

//adding the order
router.post(
  '/',
  [
    body('shipping.name').notEmpty().withMessage('Name is required'),
    body('shipping.email').isEmail().withMessage('Valid email is required'),
    body('shipping.phone').matches(/^[0-9]{10}$/).withMessage('Valid 10-digit phone is required'),
    body('shipping.address').notEmpty().withMessage('Address is required'),
    body('shipping.city').notEmpty().withMessage('City is required'),
    body('shipping.state').notEmpty().withMessage('State is required'),
    body('shipping.pincode').matches(/^[0-9]{6}$/).withMessage('Valid 6-digit pincode is required'),
    body('shipping.country').notEmpty().withMessage('Country is required'),
  ], auth ,
  WrapAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Handle subscription data
    if (req.body.isSubscription && req.body.subscriptionDetails) {
      const { duration, frequency, nextDeliveryDate } = req.body.subscriptionDetails;
      
      // Use the nextDeliveryDate sent from frontend, or calculate if not provided
      if (!nextDeliveryDate) {
        const calculatedDate = new Date();
        if (duration === '7days') {
          calculatedDate.setDate(calculatedDate.getDate() + 7);
        } else if (duration === '1month') {
          calculatedDate.setMonth(calculatedDate.getMonth() + 1);
        }
        req.body.subscriptionDetails.nextDeliveryDate = calculatedDate;
      }
    }

    const order = new Order(req.body);
    await order.save();

    res.status(201).json({ success: true, message: "Order created successfully" });
  })
);

//updating the order
router.put('/:id', auth , WrapAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Find the order first
  const order = await Order.findById(id);
  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found"
    });
  }

  // Check if user owns this order or is admin/supplier
  if (order.user.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'supplier') {
    return res.status(403).json({
      success: false,
      message: "Not authorized to update this order"
    });
  }

  // For subscription orders, validate subscription status changes
  if (order.isSubscription && req.body.subscriptionDetails?.status) {
    const validSubscriptionStatuses = ['active', 'paused', 'cancelled'];
    const newSubscriptionStatus = req.body.subscriptionDetails.status;
    
    if (!validSubscriptionStatuses.includes(newSubscriptionStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription status. Use: active, paused, or cancelled"
      });
    }

    // If resuming a paused subscription, update next delivery date
    if (newSubscriptionStatus === 'active' && order.subscriptionDetails?.status === 'paused') {
      const nextDelivery = new Date();
      if (order.subscriptionDetails?.frequency === 'weekly') {
        nextDelivery.setDate(nextDelivery.getDate() + 7);
      } else if (order.subscriptionDetails?.frequency === 'monthly') {
        nextDelivery.setMonth(nextDelivery.getMonth() + 1);
      }
      req.body.subscriptionDetails = {
        ...order.subscriptionDetails,
        status: newSubscriptionStatus,
        nextDeliveryDate: nextDelivery
      };
    } else {
      // Just update the status
      req.body.subscriptionDetails = {
        ...order.subscriptionDetails,
        status: newSubscriptionStatus
      };
    }
  }

  const updatedOrder = await Order.findByIdAndUpdate(id, req.body, { new: true });

  res.status(200).json({
    success: true,
    message: "Order updated successfully",
    order: updatedOrder
  });
}));


//deleting the order
router.delete('/:id', auth , WrapAsync(async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "order deleted successfully",
  });
}));

module.exports = router;
