const express = require('express');
const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const {authAdmin} =require('../Middlewares/authMiddlewares')
const router = express.Router();
router.get('/product-sales-by-district',authAdmin, async (req, res) => {
    try {
        const salesData = await Purchase.aggregate([
            {
                $lookup: {
                    from: 'users',  // Join with User collection
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $group: {
                    _id: '$user.districts',  // Grouping by user's districts
                    totalSales: { $sum: '$quantity' }
                }
            },
            { $sort: { totalSales: -1 } }
        ]);

        res.json(salesData);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching product sales data by district.');
    }
});

const formatDate = (date) => {
    const d = new Date(date); // Ensure it's a Date object
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

router.get('/api/sales-by-district-weekly', authAdmin,async (req, res) => {
    try {
        const today = new Date();
        today.setHours(23, 59, 59, 999);  // End of the day

        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 6); // 6 days ago from today
        oneWeekAgo.setHours(0, 0, 0, 0);  // Start of the day

        const salesData = await Purchase.aggregate([
            {
                $match: {
                    orderPlacedDate: { $gte: oneWeekAgo, $lte: today }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderPlacedDate" } },
                    totalSales: { $sum: "$quantity" }
                }
            },
            {
                $sort: {
                    _id: 1
                }
            }
        ]);

        // Create an array for the 7 days
        let daysArray = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(oneWeekAgo);
            d.setDate(d.getDate() + i);
            daysArray.push({
                date: formatDate(d),
                totalSales: 0
            });
        }

        // Populate the sales data into our array
        daysArray.forEach(day => {
            const saleData = salesData.find(s => s._id === day.date);
            if (saleData) {
                day.totalSales = saleData.totalSales;
            }
        });

        res.json(daysArray);

    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching weekly sales data.');
    }
});

router.get('/erp/highest-growth-categories', async (req, res) => {
    try {
      // Fetch all purchases and populate the 'product' field
      const populatedPurchases = await Purchase.find().populate('productId').exec();
  
      // Calculate category sales
      const categorySales = {};
  
      for (const purchase of populatedPurchases) {
        const product = purchase.productId;
  
        const category = product.category;
  
        if (!categorySales[category]) {
          categorySales[category] = 0;
        }
  
        // Calculate total sales value for the category
        categorySales[category] += purchase.quantity;
      }
  
      // Convert the categorySales object into an array of objects for sorting
      const categorySalesArray = Object.keys(categorySales).map((category) => ({
        category,
        sales: categorySales[category],
      }));
  
      // Sort the categories by sales in descending order
      categorySalesArray.sort((a, b) => b.sales - a.sales);
  
      // Get the top 5 categories
      const top5Categories = categorySalesArray.slice(0, 5);
  
      res.json(top5Categories);
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  

module.exports = router;
