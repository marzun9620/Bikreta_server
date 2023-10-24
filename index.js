require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const connection = require("./connection");
const taskRoute = require('./routes/taskRoute');
const addToCartRoute = require('./routes/addToCartRoute');
const purchase = require('./routes/purchase');
const productRoutes = require('./routes/productRoutes');
const path = require('path');
const graph = require('./controllers/graph');
const erp = require('./routes/erpRoutes');
const admin = require('./routes/adminRoutes');

const { graphqlHTTP } = require('express-graphql');
const mongoose = require('mongoose');
const graphqlSchema = require('./controllers/graphqlSchema');
const Purchase=require('./models/Purchase');
// Connect to the database (assuming your connection module exports a function)
// connection();

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));  // To serve images statically


// Multer config
app.use('/admin',admin);
// Other routes
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });
  app.use("/hob1/checkout", purchase);
app.use("/api", taskRoute);
app.use("/product/cart", addToCartRoute);

app.use("/bar", graph);


app.use('/api/products', productRoutes);
app.use("/marzun/cart/", addToCartRoute);
//console.log(__dirname);

app.use('/erp', erp);

app.use('/pdfs/', express.static(path.join(__dirname, 'public', 'pdfs')));


app.use('/graphql1', graphqlHTTP(req => {
  const startTime = Date.now();
  return {
      schema: graphqlSchema,
      graphiql: true,
      extensions({ document, variables, operationName, result }) {
          return { runTime: Date.now() - startTime };
      },
      formatError: error => {
          console.error(error);
          return {
              message: error.message,
              locations: error.locations,
              stack: error.stack,
              path: error.path
          };
      }
  };
}));
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


// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});
