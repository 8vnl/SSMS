const storage = require('../utils/storage');
const { getStartOfDay, getEndOfDay } = require('../utils/helpers');

const getPublicTodaySales = async (req, res) => {
  try {
    const sales = await storage.getSales();
    const menuItems = await storage.getMenuItems();
    
    const todayStart = getStartOfDay();
    const todayEnd = getEndOfDay();

    const todaySales = sales.filter(sale => {
      const saleDate = new Date(sale.createdAt);
      return saleDate >= todayStart && saleDate <= todayEnd;
    });

    // Populate menu items
    const populatedSales = todaySales.map(sale => ({
      ...sale,
      orderItems: sale.orderItems.map(item => ({
        ...item,
        menuItem: menuItems.find(mi => mi.id === item.menuItem)
      }))
    }));

    const totalSales = populatedSales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    const transactionCount = populatedSales.length;

    res.json({
      sales: populatedSales,
      summary: {
        totalSales,
        transactionCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getPublicSalesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const sales = await storage.getSales();
    const menuItems = await storage.getMenuItems();
    
    let filteredSales = sales;
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      filteredSales = sales.filter(sale => {
        const saleDate = new Date(sale.createdAt);
        return saleDate >= start && saleDate <= end;
      });
    }

    // Populate menu items
    const populatedSales = filteredSales.map(sale => ({
      ...sale,
      orderItems: sale.orderItems.map(item => ({
        ...item,
        menuItem: menuItems.find(mi => mi.id === item.menuItem)
      }))
    }));

    res.json(populatedSales);
  } catch (error) {
    console.error('Public history endpoint error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getPublicDailyAggregates = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const sales = await storage.getSales();
    
    let filteredSales = sales;
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      filteredSales = sales.filter(sale => {
        const saleDate = new Date(sale.createdAt);
        return saleDate >= start && saleDate <= end;
      });
    }

    // Group by date
    const aggregates = {};
    
    filteredSales.forEach(sale => {
      const saleDate = new Date(sale.createdAt).toISOString().split('T')[0];
      
      if (!aggregates[saleDate]) {
        aggregates[saleDate] = {
          date: saleDate,
          totalSales: 0,
          transactionCount: 0
        };
      }
      
      aggregates[saleDate].totalSales += sale.totalPrice;
      aggregates[saleDate].transactionCount += 1;
    });

    const result = Object.values(aggregates).sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getPublicTodaySales,
  getPublicSalesByDateRange,
  getPublicDailyAggregates
};
