const {Router}=require('express');
const BASE_URL="http://localhost:3006"
const addToCart=require('../controllers/addToCart') ;
const Purchase=require('../models/Purchase');
const {
   
    purchaseProduct,
    purchaseOverAllProduct
  } = require('../controllers/cart');
  const { generatePDF ,generateOverallPDF} = require('../utils/pdfGenrator');
const router =Router();

router.post('/bank',purchaseProduct)
router.post('/overall',purchaseOverAllProduct)

router.post('/okk/:tran_id', async (req, res) => {
    //console.log(req.body)
    try {
      const transactionId = req.params.tran_id;
      
  
      // Find the purchase based on the transaction ID
      const purchase = await Purchase.findOne({ transactionId });
  
      if (!purchase) {
        res.status(404).send('Purchase not found.');
        return;
      }
       const productId=purchase.productId;
       const userId=purchase.userId;
      // Generate the PDF link using your generatePDF function
      const pdfLink = await generatePDF(purchase, purchase.userId, purchase.productId);
  
      if (pdfLink) {
        // Send the PDF link as a response
       // res.send({ pdfLink });
  
        // After sending the PDF link, redirect the client to another URL
        res.redirect(`${BASE_URL}/payment/${productId}/${userId}/done?pdfLink=${pdfLink}`);

      } else {
        res.status(404).send('PDF link not available.');
      }
    } catch (error) {
      console.error('Error while handling the payment success:', error);
      res.status(500).send('Internal server error');
    }
  });
  

module.exports=router;