// app.js

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { graphqlHTTP } = require("express-graphql");
const mongoose = require("mongoose");
const http = require("http");
const socketIO = require("socket.io");
const connection = require("./connection");
const adminRoutes = require("./routes/adminRoutes");
const taskRoutes = require("./routes/taskRoute");
const addToCartRoutes = require("./routes/addToCartRoute");
const purchaseRoutes = require("./routes/purchase");
const productRoutes = require("./routes/productRoutes");
const offerRoutes = require("./routes/OfferRoute");
const erpRoutes = require("./routes/erpRoutes");
const showProductOfferRoutes = require("./routes/FetchProductOffer");
const graphqlSchema = require("./controllers/graphqlSchema");
const { authAdmin } = require("./Middlewares/authMiddlewares");
const Purchase = require('./models/Purchase');
const productCollection = require('./models/Product');
const discountCollection = require('./models/Discount');
const offerCollection = require('./models/Offer');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, { cors: { origin: "http://localhost:3006", methods: ["GET", "POST"] } });


// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static("uploads")); // Serve images statically

// Routes
app.use("/admin",  adminRoutes);
app.use("/api", taskRoutes);
app.use("/product/api", showProductOfferRoutes);
app.use("/product/cart", addToCartRoutes);
app.use("/hob1/checkout", purchaseRoutes);
app.use("/bar", require("./controllers/graph"));
app.use("/api/products", productRoutes);
app.use("/marzun/cart/", addToCartRoutes);
app.use("/erp", erpRoutes);
app.use("/erp/offers", offerRoutes);
app.use("/pdfs/", express.static(path.join(__dirname, "public", "pdfs")));

// Route handlers

// Secure endpoint with authAdmin middleware
app.post("/okk/:tran_id", authAdmin, async (req, res, next) => {
  try {
    const result = await Purchase.updateOne(
      { transactionId: req.params.tran_id },
      { $set: { paymentStatus: "true" } }
    );

    if (result.modifiedCount >= 0) {
      res.redirect(process.env.BASE_URL);
    }
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
});

app.get("/4marzun4/api/sales-data", async (req, res) => {
  try {
    const { productId, from, to } = req.query;

    const salesData = await Purchase.find({
      productId,
      orderPlacedDate: { $gte: new Date(from), $lte: new Date(to) },
    });

    res.json(salesData);
  } catch (error) {
    console.error("Error fetching sales data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/data", async (req, res) => {
  try {
    const purchaseData = await fetchData(Purchase);
    const productData = await fetchData(productCollection);
    const discountData = await fetchData(discountCollection);
    const offerData = await fetchData(offerCollection);

    res.json({
      purchaseData,
      productData,
      discountData,
      offerData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ... (existing Socket.IO and helper functions)
// Start the Socket.IO server
io.on('connection', (socket) => {
  console.log('Client connected');

  // Send initial data to the client on connection
  fetchDataAndEmit(socket);

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  // Handle connection errors
  socket.on('error', (error) => {
    console.error('Socket connection error:', error);
  });
});

setInterval(() => {
  fetchDataAndEmit(io);
}, 10000); // Update data every 10 seconds (adjust as needed)

// Helper function to fetch data and emit to clients
async function fetchDataAndEmit(socket) {
  try {
    const [purchaseData, productData, discountData, offerData] = await Promise.all([
      fetchData(Purchase),
      fetchData(productCollection),
      fetchData(discountCollection),
      fetchData(offerCollection),
    ]);

    const newData = {
      purchaseData,
      productData,
      discountData,
      offerData,
    };
//console.log(newData);
    socket.emit('dataUpdate', newData);
  } catch (error) {
    console.error(error);
  }
}



async function fetchData(model) {
  try {
    const data = await model.find({}).lean().exec();
    return data;
  } catch (error) {
    throw error;
  }
}


// Starting the server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
