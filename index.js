

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require('path');
const { graphqlHTTP } = require('express-graphql');
const mongoose = require('mongoose');
const connection = require("./connection");
const taskRoute = require('./routes/taskRoute');
const addToCartRoute = require('./routes/addToCartRoute');
const purchase = require('./routes/purchase');
const productRoutes = require('./routes/productRoutes');
const Offer=require('./routes/OfferRoute');
const graph = require('./controllers/graph');
const erp = require('./routes/erpRoutes');
const Cart = require('./models/Cart');
const Purchase = require('./models/Purchase');
const show=require('./routes/FetchProductOffer')
const graphqlSchema = require('./controllers/graphqlSchema');
const admin = require('./routes/adminRoutes');
const app = express();
const {authAdmin} = require('./Middlewares/authMiddlewares');
// Initialize server and socket.io
const server = require('http').createServer(app);
const io = require("socket.io")(server, {
    cors: {
        origin: process.env.BASE_URL
    }
});


// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));  // Serve images statically

// Routes
app.use('/admin',admin);
app.use("/api", taskRoute);
app.use("/product/api", show);
app.use("/product/cart", addToCartRoute);
app.use("/hob1/checkout", purchase);
app.use("/bar", graph);
app.use('/api/products', productRoutes);
app.use("/marzun/cart/", addToCartRoute);
app.use('/erp',erp);
app.use('/erp/offers',Offer);
app.use('/pdfs/', express.static(path.join(__dirname, 'public', 'pdfs')));

// Route handlers

app.post('/okk/:tran_id', async(req,res)=>{
 
  const result = await Purchase.updateOne(
    {transactionId: req.params.tran_id},
    {
      $set:{
        paymentStatus:"true",
      },
    }
  );
  console.log('jii');
  if(result.modifiedCount>=0){
    res.redirect(
      process.env.BASE_URL
    );
  };
})
app.get('/4marzun4/api/sales-data', async (req, res) => {
  try {
    const { productId, from, to } = req.query;

    // Use the parameters to query your database for sales data
    const salesData = await Purchase.find({
      productId,
      orderPlacedDate: { $gte: new Date(from), $lte: new Date(to) },
    });

    // Send the sales data as a response
    res.json(salesData);
  } catch (error) {
    console.error('Error fetching sales data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Socket.io logic
io.on("connection", socket => {
  //console.log("A client connected with socket ID:", socket.id);
  socket.on("cartUpdated1", updatedUserId => {
    console.log(updatedUserId);
    io.emit('cartUpdated',(updatedUserId));
  });
});

// Error handling middleware - positioned last, after all routes
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Starting the server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
