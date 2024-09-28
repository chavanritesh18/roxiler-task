// controllers/statisticsList.js

const Transaction = require('../models/db');

// Function to get statistics for a specified month (defaults to March)
const statistics = async (req, res) => {
    try {
        let { month } = req.query;
        month = month || "March"; // Default to March

        // Convert month string to month number (1-12)
        const monthNumber = new Date(Date.parse(`${month} 1, 2000`)).getMonth() + 1;

        // Fetch total sale amount for the specified month
        const totalSaleAmount = await Transaction.aggregate([
            {
                $match: {
                    $expr: {
                        $eq: [
                            { $month: "$dateOfSale" },
                            monthNumber
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$price" }
                }
            }
        ]);

        // Fetch total sold items
        const totalSoldItems = await Transaction.countDocuments({
            $expr: {
                $eq: [
                    { $month: "$dateOfSale" },
                    monthNumber
                ]
            },
            sold: true // Assuming there is a 'sold' field indicating sold items
        });

        // Fetch total not sold items
        const totalNotSoldItems = await Transaction.countDocuments({
            $expr: {
                $eq: [
                    { $month: "$dateOfSale" },
                    monthNumber
                ]
            },
            sold: false // Assuming a 'sold' field to identify unsold items
        });

        res.json({
            totalSaleAmount: totalSaleAmount.length > 0 ? totalSaleAmount[0].totalAmount : 0,
            totalSoldItems,
            totalNotSoldItems,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Function for bar chart
const barChart = async (req, res) => {
    try {
        let { month } = req.query;
        month = month || "March"; // Default to March

        // Convert month string to month number (1-12)
        const monthNumber = new Date(Date.parse(`${month} 1, 2000`)).getMonth() + 1;

        // Define price ranges
        const priceRanges = [
            { min: 0, max: 100 },
            { min: 101, max: 200 },
            { min: 201, max: 300 },
            { min: 301, max: 400 },
            { min: 401, max: 500 },
            { min: 501, max: 600 },
            { min: 601, max: 700 },
            { min: 701, max: 800 },
            { min: 801, max: 900 },
            { min: 901, max: Infinity }, // For items with a price above 900
        ];

        const priceRangeCounts = new Array(priceRanges.length).fill(0);

        const aggregationResult = await Transaction.aggregate([
            {
                $match: {
                    $expr: {
                        $eq: [
                            { $month: "$dateOfSale" },
                            monthNumber
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    prices: { $push: "$price" }
                }
            },
        ]);

        const prices = aggregationResult.length > 0 ? aggregationResult[0].prices : [];

        // Counting items in each price range
        prices.forEach((price) => {
            for (let i = 0; i < priceRanges.length; i++) {
                if (price >= priceRanges[i].min && price <= priceRanges[i].max) {
                    priceRangeCounts[i]++;
                    break;
                }
            }
        });

        const response = priceRanges.map((range, index) => ({
            range: `${range.min} - ${range.max === Infinity ? "above" : range.max}`,
            count: priceRangeCounts[index],
        }));

        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Function for pie chart
const pieChart = async (req, res) => {
    try {
        let { month } = req.query;
        month = month || "March"; // Default to March

        // Convert month string to month number (1-12)
        const monthNumber = new Date(Date.parse(`${month} 1, 2000`)).getMonth() + 1;

        // Aggregate to find unique categories and count items in each category
        const aggregationResult = await Transaction.aggregate([
            {
                $match: {
                    $expr: {
                        $eq: [
                            { $month: "$dateOfSale" },
                            monthNumber
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: "$category", // Group by category
                    count: { $sum: 1 } // Count the number of items in each category
                }
            }
        ]);

        const response = aggregationResult.map(item => ({
            category: item._id || "Uncategorized", // Default category name if null
            count: item.count,
        }));

        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Combined response function
const combinedResponse = async (req, res) => {
    try {
        const { month } = req.query;
        const stats = await statistics(req, res); // Avoid sending res here, refactor if needed
        const barChartData = await barChart(req, res); // Same here
        const pieChartData = await pieChart(req, res); // Same here

        res.json({
            statistics: stats,
            barChartData,
            pieChartData,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = {
    statistics,
    barChart,
    pieChart,
    combinedResponse
};
