const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  items: [{
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    }
  }],

  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },

  shipping: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    }
  },

  isSubscription: {
    type: Boolean,
    default: false
  },

  subscriptionDetails: {
    frequency: {
      type: String,
      enum: ['weekly', 'monthly'],
      required: function () {
        return this.isSubscription;
      }
    },
    duration: {
      type: String,
      enum: ['7days', '1month'],
      required: function () {
        return this.isSubscription;
      }
    },
    nextDeliveryDate: {
      type: Date,
      required: function () {
        return this.isSubscription;
      }
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'cancelled'],
      default: 'active',
      required: function () {
        return this.isSubscription;
      }
    }
  },

  paymentDetails: {
    paymentMethod: {
      type: String,
      enum: ['card', 'cash', 'upi'],
      default: 'cash'
    }
  }
}, {timestamps : true});

orderSchema.methods.isSubscriptionOrder = ()=> this.isSubscription ;

orderSchema.methods.cancelOrder = ()=>{
    if(this.status === "shipped" || this.status === "delivered"){
        throw new Error("Cannot cancel shipped or delivered orders");
    }
    this.status = "cancelled";
    return this.save();
}

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;