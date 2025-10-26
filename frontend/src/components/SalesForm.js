import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const SalesForm = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [formData, setFormData] = useState({
    buyerIdentifier: '',
    orderItems: [{ 
      menuItem: '', 
      quantity: 1, 
      selectedOption: '',
      customAdditionalCharges: 0,
      additionalChargeNotes: ''
    }],
    generalNotes: ''
  });
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMenuItems();
  }, []);

  useEffect(() => {
    calculateTotalPrice();
  }, [formData.orderItems, formData.generalNotes, menuItems]);

  const fetchMenuItems = async () => {
    try {
      const response = await api.get('/menu');
      setMenuItems(response.data);
    } catch (error) {
      setError('Failed to load menu items');
    }
  };

  const calculateTotalPrice = () => {
    let total = 0;

    formData.orderItems.forEach(item => {
      const menuItem = menuItems.find(mi => mi.id === parseInt(item.menuItem));
      if (menuItem) {
        let itemPrice = menuItem.basePrice;
        
        if (item.selectedOption && !menuItem.requiresManualPrice) {
          const option = menuItem.options.find(opt => opt.name === item.selectedOption);
          if (option) {
            itemPrice += option.price;
          }
        }

        // Add custom additional charges for this specific item
        itemPrice += parseFloat(item.customAdditionalCharges) || 0;

        total += itemPrice * item.quantity;
      }
    });

    setTotalPrice(total);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOrderItemChange = (index, field, value) => {
    const updatedItems = [...formData.orderItems];
    updatedItems[index][field] = value;
    setFormData(prev => ({
      ...prev,
      orderItems: updatedItems
    }));
  };

  const addOrderItem = () => {
    setFormData(prev => ({
      ...prev,
      orderItems: [...prev.orderItems, { 
        menuItem: '', 
        quantity: 1, 
        selectedOption: '',
        customAdditionalCharges: 0,
        additionalChargeNotes: ''
      }]
    }));
  };

  const removeOrderItem = (index) => {
    if (formData.orderItems.length > 1) {
      const updatedItems = formData.orderItems.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        orderItems: updatedItems
      }));
    }
  };

  const getMenuItemOptions = (menuItemId) => {
    const menuItem = menuItems.find(item => item.id === parseInt(menuItemId));
    return menuItem ? menuItem.options : [];
  };

  const getMenuItemPrice = (menuItemId, selectedOption, customCharges = 0) => {
    const menuItem = menuItems.find(item => item.id === parseInt(menuItemId));
    if (!menuItem) return 0;

    let price = menuItem.basePrice;
    
    if (selectedOption && !menuItem.requiresManualPrice) {
      const option = menuItem.options.find(opt => opt.name === selectedOption);
      if (option) {
        price += option.price;
      }
    }

    price += parseFloat(customCharges) || 0;
    return price;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    // Validate that all menu items are selected
    const hasEmptyMenuItems = formData.orderItems.some(item => !item.menuItem);
    if (hasEmptyMenuItems) {
      setError('Please select a menu item for all order items');
      setLoading(false);
      return;
    }

    try {
      // Convert menuItem values to integers for the backend
      const submissionData = {
        ...formData,
        orderItems: formData.orderItems.map(item => ({
          ...item,
          menuItem: parseInt(item.menuItem),
          customAdditionalCharges: parseFloat(item.customAdditionalCharges) || 0
        }))
      };
      
      await api.post('/sales', submissionData);
      setMessage('✅ Sale recorded successfully!');
      setFormData({
        buyerIdentifier: '',
        orderItems: [{ 
          menuItem: '', 
          quantity: 1, 
          selectedOption: '',
          customAdditionalCharges: 0,
          additionalChargeNotes: ''
        }],
        generalNotes: ''
      });
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      setError('❌ ' + (error.response?.data?.message || 'Failed to record sale'));
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  return (
    <div className="form-container">
      <h2>➕ New Sale</h2>
      
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Customer/Table *</label>
          <input
            type="text"
            name="buyerIdentifier"
            value={formData.buyerIdentifier}
            onChange={handleInputChange}
            placeholder="e.g., Table 1, Customer Name, Takeaway"
            required
          />
        </div>

        <div className="form-group">
          <label>Order Items *</label>
          {formData.orderItems.map((item, index) => {
            const itemPrice = getMenuItemPrice(item.menuItem, item.selectedOption, item.customAdditionalCharges);
            const itemTotal = itemPrice * item.quantity;
            
            return (
              <div key={index} className="order-item-card">
                <div className="order-item-header">
                  <h4>Item #{index + 1}</h4>
                  {formData.orderItems.length > 1 && (
                    <button
                      type="button"
                      className="remove-item"
                      onClick={() => removeOrderItem(index)}
                      title="Remove item"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="order-item-fields">
                  <div className="field-group">
                    <label>Menu Item *</label>
                    <select
                      value={item.menuItem}
                      onChange={(e) => handleOrderItemChange(index, 'menuItem', e.target.value)}
                      required
                    >
                      <option value="">Select Menu Item</option>
                      {menuItems.map(menuItem => (
                        <option key={menuItem.id} value={menuItem.id}>
                          {menuItem.name} - {formatCurrency(menuItem.basePrice)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field-row">
                    <div className="field-group">
                      <label>Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleOrderItemChange(index, 'quantity', parseInt(e.target.value))}
                        placeholder="Qty"
                        className="quantity-input"
                      />
                    </div>
                  </div>

                  {item.menuItem && (
                    <div className="field-group">
                      <label>Additional Options</label>
                      <select
                        value={item.selectedOption}
                        onChange={(e) => handleOrderItemChange(index, 'selectedOption', e.target.value)}
                      >
                        <option value="">No Additional Option</option>
                        {getMenuItemOptions(item.menuItem).map(option => (
                          <option key={option.name} value={option.name}>
                            {option.name} (+{formatCurrency(option.price)})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="field-row">
                    <div className="field-group">
                      <label>Extra Charges</label>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={item.customAdditionalCharges}
                        onChange={(e) => handleOrderItemChange(index, 'customAdditionalCharges', e.target.value)}
                        placeholder="0"
                        className="charges-input"
                      />
                    </div>
                  </div>

                  <div className="field-group">
                    <label>Item Notes</label>
                    <input
                      type="text"
                      value={item.additionalChargeNotes}
                      onChange={(e) => handleOrderItemChange(index, 'additionalChargeNotes', e.target.value)}
                      placeholder="Special instructions for this item (e.g., Extra spicy, No onions)"
                      className="notes-input"
                    />
                  </div>

                  <div className="item-price-summary">
                    <div className="price-breakdown">
                      <span>Base Price: {formatCurrency(getMenuItemPrice(item.menuItem, '', 0))}</span>
                      {item.selectedOption && (
                        <span>Option: +{formatCurrency(getMenuItemOptions(item.menuItem).find(opt => opt.name === item.selectedOption)?.price || 0)}</span>
                      )}
                      {item.customAdditionalCharges > 0 && (
                        <span>Extra Charges: +{formatCurrency(parseFloat(item.customAdditionalCharges) || 0)}</span>
                      )}
                      <span>Quantity: × {item.quantity}</span>
                      <span className="item-total">Item Total: {formatCurrency(itemTotal)}</span>
                    </div>
                    {item.additionalChargeNotes && (
                      <div className="item-notes">
                        <small>Note: {item.additionalChargeNotes}</small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          <button type="button" className="btn" onClick={addOrderItem}>
            ➕ Add Another Item
          </button>
        </div>

        <div className="form-group">
          <label>General Order Notes</label>
          <textarea
            name="generalNotes"
            value={formData.generalNotes}
            onChange={handleInputChange}
            placeholder="Any special instructions or notes for the entire order..."
            rows="3"
          />
        </div>

        <div className="form-group text-center" style={{ 
          background: '#f8fafc', 
          padding: '1rem', 
          borderRadius: '8px',
          border: '2px solid #e2e8f0'
        }}>
          <h3 style={{ margin: 0, color: '#1e293b' }}>
            Order Total: <span className="currency">{formatCurrency(totalPrice)}</span>
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            type="submit" 
            className="btn btn-success" 
            disabled={loading}
            style={{ flex: 1 }}
          >
            {loading ? '💾 Saving...' : '💾 Save Sale'}
          </button>
          <button 
            type="button" 
            className="btn" 
            onClick={() => navigate('/dashboard')}
            style={{ flex: 1 }}
          >
            ↩️ Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default SalesForm;
