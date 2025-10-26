const storage = require('../utils/storage');
const { generateId, getStartOfDay, getEndOfDay } = require('../utils/helpers');

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
    
    let filteredSales = sales;
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0); // Start of day
      
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // End of day
      
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
    console.error('History endpoint error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getDailyAggregates = async (req, res) => {
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

const deleteSale = async (req, res) => {
  try {
    const { saleId } = req.params;
    const sales = await storage.getSales();
    
    const saleIndex = sales.findIndex(sale => sale.id === parseInt(saleId));
    if (saleIndex === -1) {
      return res.status(404).json({ message: 'Sale record not found' });
    }

    // Only allow deletion if user is admin or the creator of the sale
    if (req.user.role !== 'admin' && sales[saleIndex].createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. Only admins or the creator can delete sales.' });
    }

    sales.splice(saleIndex, 1);
    await storage.saveSales(sales);

    res.json({ message: 'Sale record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { 
  createSale, 
  getTodaySales, 
  getSalesByDateRange, 
  getDailyAggregates,
  deleteSale
};
