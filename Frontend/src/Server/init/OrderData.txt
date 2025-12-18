const Order = require('../models/OrderModel');
const User = require('../models/UserModel');
const Medicine = require('../models/MedicineModel');

const createSampleOrders = async () => {
    try {
        // Get sample users and medicines
        const users = await User.find({ role: 'customer' }).limit(5);
        const medicines = await Medicine.find().limit(10);
        
        if (users.length === 0 || medicines.length === 0) {
            console.log('No users or medicines found for sample orders');
            return;
        }

        const sampleOrders = [];

        // Create orders for the last 30 days with different pincodes
        // Focus on pincode 395001 for testing area-based filtering
        const pincodes = ['395001', '395001', '395001', '394355', '395002', '395003']; // More weight to 395001
        
        for (let i = 0; i < 80; i++) { // Increased number of orders
            const daysAgo = Math.floor(Math.random() * 30);
            const orderDate = new Date();
            orderDate.setDate(orderDate.getDate() - daysAgo);
            
            const randomUser = users[Math.floor(Math.random() * users.length)];
            const randomPincode = pincodes[Math.floor(Math.random() * pincodes.length)];
            const randomMedicine = medicines[Math.floor(Math.random() * medicines.length)];
            
            const quantity = Math.floor(Math.random() * 5) + 1;
            const totalAmount = randomMedicine.price * quantity;

            const order = {
                user: randomUser._id,
                items: [{
                    medicine: randomMedicine._id,
                    quantity: quantity,
                    price: randomMedicine.price
                }],
                totalAmount: totalAmount,
                status: ['pending', 'confirmed', 'shipped', 'delivered'][Math.floor(Math.random() * 4)],
                shipping: {
                    name: randomUser.name,
                    email: randomUser.email,
                    phone: randomUser.phone,
                    address: `Sample Address ${Math.floor(Math.random() * 100)}`,
                    city: 'Surat',
                    state: 'Gujarat',
                    pincode: randomPincode,
                    country: 'India'
                },
                paymentDetails: {
                    paymentMethod: ['cash', 'card', 'upi'][Math.floor(Math.random() * 3)]
                },
                isSubscription: Math.random() > 0.8, // 20% chance of subscription
                createdAt: orderDate
            };

            if (order.isSubscription) {
                order.subscriptionDetails = {
                    frequency: ['weekly', 'monthly'][Math.floor(Math.random() * 2)],
                    nextDeliveryDate: new Date(orderDate.getTime() + 7 * 24 * 60 * 60 * 1000)
                };
            }

            sampleOrders.push(order);
        }

        // Create additional orders specifically for pincode 395001
        console.log('Creating additional orders for pincode 395001...');
        for (let i = 0; i < 20; i++) {
            const daysAgo = Math.floor(Math.random() * 30);
            const orderDate = new Date();
            orderDate.setDate(orderDate.getDate() - daysAgo);
            
            const randomUser = users[Math.floor(Math.random() * users.length)];
            const randomMedicine = medicines[Math.floor(Math.random() * medicines.length)];
            
            const quantity = Math.floor(Math.random() * 5) + 1;
            const totalAmount = randomMedicine.price * quantity;

            const order = {
                user: randomUser._id,
                items: [{
                    medicine: randomMedicine._id,
                    quantity: quantity,
                    price: randomMedicine.price
                }],
                totalAmount: totalAmount,
                status: ['pending', 'confirmed', 'shipped', 'delivered'][Math.floor(Math.random() * 4)],
                shipping: {
                    name: randomUser.name,
                    email: randomUser.email,
                    phone: randomUser.phone,
                    address: `Surat Address ${Math.floor(Math.random() * 100)}`,
                    city: 'Surat',
                    state: 'Gujarat',
                    pincode: '395001', // Specifically for testing
                    country: 'India'
                },
                paymentDetails: {
                    paymentMethod: ['cash', 'card', 'upi'][Math.floor(Math.random() * 3)]
                },
                isSubscription: Math.random() > 0.8,
                createdAt: orderDate
            };

            if (order.isSubscription) {
                order.subscriptionDetails = {
                    frequency: ['weekly', 'monthly'][Math.floor(Math.random() * 2)],
                    nextDeliveryDate: new Date(orderDate.getTime() + 7 * 24 * 60 * 60 * 1000)
                };
            }

            sampleOrders.push(order);
        }

        // Insert sample orders
        await Order.insertMany(sampleOrders);
        console.log(`Created ${sampleOrders.length} sample orders for revenue testing`);
        console.log(`Orders created for pincodes: 395001 (${sampleOrders.filter(o => o.shipping.pincode === '395001').length}), 394355, 395002, 395003`);

    } catch (error) {
        console.error('Error creating sample orders:', error);
    }
};

module.exports = { createSampleOrders }; 