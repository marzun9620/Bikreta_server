require("dotenv").config();
const fs = require('fs');
const plotly = require('plotly')(process.env.PLOTLY_USERNAME, process.env.PLOTLY_API_KEY);


    // Fetch data from MongoDB collections
    const purchaseCollection = require('../models/Purchase');
    const productCollection1 = require('../models/Product');
    const discountCollection = require('../models/Discount');
    const offerCollection =require('../models/Offer');

    try {
        const purchaseData = await fetchData(purchaseCollection);
        const productData = await fetchData(productCollection1);
        const discountData = await fetchData(discountCollection);
        const offerData = await fetchData(offerCollection);

        analyzeSalesTrends(purchaseData);
        analyzeProductPerformance(productData);
        analyzeUserBehavior(purchaseData);
        analyzeOfferDiscountEffectiveness(purchaseData, discountData, offerData);
        analyzeDeliveryPerformance(purchaseData);
        analyzeCategory(productData, purchaseData);
        analyzeProfitability(productData, purchaseData);
        analyzeUserSatisfaction(productData);
        performCorrelationAnalysis(purchaseData, productData, discountData, offerData);
        performCustomerSegmentation(purchaseData);
    } finally {
        client.close();
    }


async function fetchData(collection) {
    const cursor = await collection.find({}).toArray();
    return cursor;
}

function savePlotImage(figure, plotName) {
    const imgOpts = {
        format: 'png',
        width: 1000,
        height: 500,
    };

    plotly.getImage(figure, imgOpts, (error, imageStream) => {
        if (error) return console.log(error);

        const fileStream = fs.createWriteStream(`./analysis_images/${plotName}.png`);
        imageStream.pipe(fileStream);
    });
}

function analyzeSalesTrends(purchaseData) {
    // Analyze sales trends over time
    const trace = {
        x: purchaseData.map(item => item.orderPlacedDate),
        y: purchaseData.map(item => item.totalPaid),
        type: 'scatter',
    };

    const layout = {
        title: 'Sales Trends Over Time',
        xaxis: {
            title: 'Date',
        },
        yaxis: {
            title: 'Total Sales Amount',
        },
    };

    const figure = { data: [trace], layout };
    savePlotImage(figure, 'sales_trends_over_time');
}

function analyzeProductPerformance(productData) {
    // Analyze average rating by category
    const trace = {
        x: productData.map(item => item.category),
        y: productData.map(item => item.averageRating),
        type: 'bar',
    };

    const layout = {
        title: 'Average Rating by Category',
        xaxis: {
            title: 'Category',
        },
        yaxis: {
            title: 'Average Rating',
        },
    };

    const figure = { data: [trace], layout };
    savePlotImage(figure, 'average_rating_by_category');
}

function analyzeUserBehavior(purchaseData) {
    // Analyze user purchase behavior
    const trace = {
        x: purchaseData.map(item => item.userId),
        type: 'histogram',
    };

    const layout = {
        title: 'User Purchase Behavior',
        xaxis: {
            title: 'User ID',
        },
        yaxis: {
            title: 'Number of Purchases',
        },
    };

    const figure = { data: [trace], layout };
    savePlotImage(figure, 'user_purchase_behavior');
}

function analyzeOfferDiscountEffectiveness(purchaseData, discountData, offerData) {
    // Analyze average discount percentage by category
    const trace = {
        x: discountData.map(item => item.category),
        y: discountData.map(item => item.discountPercentage),
        type: 'bar',
    };

    const layout = {
        title: 'Average Discount Percentage by Category',
        xaxis: {
            title: 'Category',
        },
        yaxis: {
            title: 'Average Discount Percentage',
        },
    };

    const figure = { data: [trace], layout };
    savePlotImage(figure, 'average_discount_by_category');
}

function analyzeDeliveryPerformance(purchaseData) {
    // Analyze delivery delay distribution
    const trace = {
        x: purchaseData.map(item => item.deliveryDelay),
        type: 'histogram',
    };

    const layout = {
        title: 'Delivery Delay Distribution',
        xaxis: {
            title: 'Number of Days Delayed',
        },
        yaxis: {
            title: 'Number of Purchases',
        },
    };

    const figure = { data: [trace], layout };
    savePlotImage(figure, 'delivery_delay_distribution');
}

function analyzeCategory(productData, purchaseData) {
    // Analyze purchase by category
    const trace = {
        x: purchaseData.map(item => item.category),
        type: 'bar',
    };

    const layout = {
        title: 'Purchase by Category',
        xaxis: {
            title: 'Category',
        },
        yaxis: {
            title: 'Number of Purchases',
        },
    };

    const figure = { data: [trace], layout };
    savePlotImage(figure, 'purchase_by_category');
}

function analyzeProfitability(productData, purchaseData) {
    // Analyze profitability by product
    const trace = {
        x: productData.map(item => item.productName),
        y: purchaseData.map(item => item.totalPaid - item.unitMakeCost * item.quantity),
        type: 'bar',
    };

    const layout = {
        title: 'Profitability by Product',
        xaxis: {
            title: 'Product Name',
        },
        yaxis: {
            title: 'Profit',
        },
    };

    const figure = { data: [trace], layout };
    savePlotImage(figure, 'profitability_by_product');
}

function analyzeUserSatisfaction(productData) {
    // Analyze weighted average rating distribution
    const trace = {
        x: productData.map(item => item.weighted_avg_rating),
        type: 'histogram',
    };

    const layout = {
        title: 'Weighted Average Rating Distribution',
        xaxis: {
            title: 'Weighted Average Rating',
        },
        yaxis: {
            title: 'Number of Products',
        },
    };

    const figure = { data: [trace], layout };
    savePlotImage(figure, 'weighted_avg_rating_distribution');
}

function performCorrelationAnalysis(purchaseData, productData, discountData, offerData) {
    // Perform correlation analysis
    const correlationMatrix = getCorrelationMatrix(purchaseData, productData, discountData, offerData);

    const trace = {
        z: correlationMatrix,
        x: ['quantity', 'totalPaid', 'unitPrice', 'discountPercentage'],
        y: ['quantity', 'totalPaid', 'unitPrice', 'discountPercentage'],
        type: 'heatmap',
    };

    const layout = {
        title: 'Correlation Analysis',
    };

    const figure = { data: [trace], layout };
    savePlotImage(figure, 'correlation_analysis_heatmap');
}

function getCorrelationMatrix(purchaseData, productData, discountData, offerData) {
    // Replace this with the actual logic to calculate the correlation matrix
    // Example code:
    const correlationMatrix = [
        [1, 0.8, 0.6, 0.4],
        [0.8, 1, 0.7, 0.5],
        [0.6, 0.7, 1, 0.3],
        [0.4, 0.5, 0.3, 1],
    ];

    return correlationMatrix;
}

function performCustomerSegmentation(purchaseData) {
    // Perform customer segmentation
    const trace = {
        x: purchaseData.map(item => item.quantity),
        y: purchaseData.map(item => item.totalPaid),
        mode: 'markers',
        type: 'scatter',
        marker: { color: purchaseData.map(item => item.segment) },
    };

    const layout = {
        title: 'Customer Segmentation',
        xaxis: {
            title: 'Quantity Purchased',
        },
        yaxis: {
            title: 'Total Amount Paid',
        },
    };

    const figure = { data: [trace], layout };
    savePlotImage(figure, 'customer_segmentation');
}
