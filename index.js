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



// Connect to the database (assuming your connection module exports a function)
// connection();

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));  // To serve images statically


// Multer config

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

app.use('/pdfs/', express.static(path.join(__dirname, 'public', 'pdfs')));






// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});
