

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
const graph = require('./controllers/graph');
const erp = require('./routes/erpRoutes');
const Cart = require('./models/Cart');
const Purchase = require('./models/Purchase');
const graphqlSchema = require('./controllers/graphqlSchema');

const app = express();

// Initialize server and socket.io
const server = require('http').createServer(app);
const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:3006"
    }
});


// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));  // Serve images statically

// Routes
app.use("/api", taskRoute);
app.use("/product/cart", addToCartRoute);
app.use("/hob1/checkout", purchase);
app.use("/bar", graph);
app.use('/api/products', productRoutes);
app.use("/marzun/cart/", addToCartRoute);
app.use('/erp', erp);
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
      `localhost:3006`
    );
  };
})



// Socket.io logic
io.on("connection", socket => {
  console.log("A client connected with socket ID:", socket.id);
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
