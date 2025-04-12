const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        book: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['주문완료', '배송준비중', '배송중', '배송완료', '취소'],
        default: '주문완료'
    },
    shippingAddress: {
        postcode: String,
        address: String,
        addressDetail: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema); 