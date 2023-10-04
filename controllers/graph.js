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
module.exports = router;
