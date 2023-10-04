const express = require('express');
const Purchase = require('../models/Purchase');

const router = express.Router();
router.get('/sales-data', (req, res) => {
    Purchase.aggregate([
        {
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'user'
            }
        },
        {
            $unwind: '$user'
        },
        {
            $group: {
                _id: '$user.location',
                totalSales: { $sum: '$quantity' }
            }
        },
        {
            $sort: {
                totalSales: -1
            }
        }
    ])
    .exec()
    .then(result => {
        res.json(result);
    })
    .catch(error => {
        console.error(error);
        res.status(500).send('Error fetching sales data.');
    });
    
});
const formatDate = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

router.get('/api/sales/weekly', async (req, res) => {
   // Utility function to format date as YYYY-MM-DD


try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 6); // Include today in the 7 days

    const salesData = await Purchase.aggregate([
        {
            $match: {
                date: { $gte: oneWeekAgo }
            }
        },
        {
            $group: {
                _id: { $dayOfYear: "$date" },
                totalSales: { $sum: "$quantity" },
                date: { $first: "$date" }
            }
        },
        {
            $sort: {
                date: 1
            }
        }
    ]);

    // Create 7 days array
    let daysArray = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(oneWeekAgo);
        d.setDate(d.getDate() + i);
        daysArray.push({
            formattedDate: formatDate(d),
            totalSales: 0
        });
    }

    // Merge salesData into 7 days array
    daysArray = daysArray.map(day => {
        const found = salesData.find(s => formatDate(s.date) === day.formattedDate);
        return found || day;
    });
 console.log(daysArray);
    res.json(daysArray);

} catch (err) {
    console.error(err);
    res.status(500).send('Error fetching sales data.');
}

    
});

module.exports = router;
