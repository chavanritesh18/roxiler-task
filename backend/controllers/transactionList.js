const Transaction = require('../models/db')

const listTransactions = async (req, res) => {
    try {
      let {
        month = "March",
        // month  = "December",
        search = "",
        page = 1,
        perPage = 10,
        sortField = "dateOfSale",
        sortDirection = "asc",
      } = req.query;
      month = month || "March";
      const monthNumber = new Date(Date.parse(`${month} 1, 2000`)).getMonth() + 1;
      // Validating the month parameter
      if (!(monthNumber >= 1 && monthNumber <= 12)) {
        return res.status(400).json({
          error: "Invalid month parameter. Please provide a valid month.",
        });
      }
  
      // Validating pagination parameters
      if (page < 1 || perPage < 1) {
        return res.status(400).json({
          error: "Invalid pagination parameters. Please provide valid values.",
        });
      }
  
      const isNumericSearch = /^[0-9.]+$/.test(search);
  
      const filter = {
        $expr: {
          $eq: [
            {
              $month: {
                $dateFromString: {
                  dateString: { $toString: "$dateOfSale" },
                  format: "%Y-%m-%dT%H:%M:%S.%LZ",
                },
              },
            },
            monthNumber,
          ],
        },
        ...(search !== "" && {
          $or: [
            ...(isNumericSearch
              ? [{ price: parseFloat(search) }]
              : [
                  { title: { $regex: new RegExp(`\\b${search}\\b`, "i") } },
                  { description: { $regex: new RegExp(`\\b${search}\\b`, "i") } },
                ]),
          ],
        }),
      };
  
      // Counting total documents for pagination details
      const totalCount = await Transaction.countDocuments(filter);
      const totalPages = Math.ceil(totalCount / perPage);
  
      // Sort options
      const sortOptions = {};
      sortOptions[sortField] = sortDirection === "asc" ? 1 : -1;
  
      const transactions = await Transaction.find(filter)
        .sort(sortOptions)
        .skip((page - 1) * perPage)
        .limit(Number(perPage));
  
      res.json({
        transactions,
        totalCount,
        totalPages,
        currentPage: page,
        sortField,
        sortDirection,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  module.exports = {
    listTransactions,
};