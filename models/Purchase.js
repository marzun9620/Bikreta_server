const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    transactionId: {
        type: String,
       
        unique: true
    },
   expectedDeliveryDate: {
        type: Date,
    },
    actualDeliveryDate: {
        type: Date,
    },
    orderStatus:{
          type:String,
          
    },
    trackingId: {
        type: String,
       
        unique: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1  // Assuming the minimum quantity one can purchase is 1
    },
    discountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Discount'
      }
});

const Purchase = mongoose.model("Purchase", purchaseSchema);

module.exports = Purchase;
