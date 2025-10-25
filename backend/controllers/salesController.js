const storage = require('../utils/storage');
const { generateId, getStartOfDay, getEndOfDay, filterSalesByDateRange } = require('../utils/helpers');

const createSale = async (req, res) => {
  try {
    const { 
      buyerIdentifier, 
      orderItems, 
      customAdditionalCharges = 0, 
      additionalChargeNotes, 
      generalNotes 
    } = req.body;

    const sales = await storage.getSales();
    const menuItems = await storage.getMenuItems();

    let totalPrice = parseFloat(customAdditionalCharges) || 0;

    // Calculate total price
    for (let item of orderItems) {
      const menuItem = menuItems.find(mi => mi.id === item.menuItem);
      if (!menuItem) {
        return res.status(400).json({ message: `Menu item not found: ${item.menuItem}` });
      }

      let itemPrice = menuItem.basePrice;
      if (item.selectedOption && !menuItem.requiresManualPrice) {
        const option = menuItem.options.find(opt => opt.name === item.selectedOption);
        if (option) {
          itemPrice += option.price;
        }
      }

      totalPrice += itemPrice * item.quantity;
    }

    // Create new sale
    const newSale = {
      id: generateId(sales),
      buyerIdentifier,
      orderItems,
      customAdditionalCharges: parseFloat(customAdditionalCharges) || 0,
      additionalChargeNotes,
      generalNotes,
      totalPrice,
      createdBy: req.user.id,
      createdAt: new Date().toISOString()
    };

    sales.push(newSale);
    await storage.saveSales(sales);

    // Populate menu items for response
    const populatedSale = {
      ...newSale,
      orderItems: newSale.orderItems.map(item => ({
        ...item,
        menuItem: menuItems.find(mi => mi.id === item.menuItem)
      }))
    };

    res.status(201).json(populatedSale);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getTodaySales = async (req, res) => {
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

const getSalesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const sales = await storage.getSales();
    const menuItems = await storage.getMenuItems();
    
    const filteredSales = filterSalesByDateRange(sales, startDate, endDate);

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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getDailyAggregates = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const sales = await storage.getSales();
    
    let filteredSales = sales;
    if (startDate && endDate) {
      filteredSales = filterSalesByDateRange(sales, startDate, endDate);
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
  createSale, 
  getTodaySales, 
  getSalesByDateRange, 
  getDailyAggregates 
};