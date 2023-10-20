const {Router}=require('express');

const addToCart=require('../controllers/addToCart') ;
const Purchase=require('../models/Purchase');
const {
   
    purchaseProduct
  } = require('../controllers/cart');

const router =Router();

router.post('/bank',purchaseProduct)

router.post('/okk/:tran_id', async (req, res) => {
  try {
      const result = await Purchase.updateOne(
          { transactionId: req.params.tran_id },
          {
              $set: {
                  paymentStatus: "true",
              },
          }
      );

      console.log('jii');

      if (result.modifiedCount >0) {
          res.redirect(`http://localhost:3006/payment/done`);
      } else {
          // If the document was not modified, send a response indicating that.
          res.status(200).send('No documents were modified.');
      }
  } catch (error) {
      // Handle any errors
      console.error('Error updating purchase:', error);
      res.status(500).send('Internal server error');
  }
});

module.exports=router;