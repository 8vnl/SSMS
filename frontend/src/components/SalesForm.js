import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const SalesForm = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [formData, setFormData] = useState({
    buyerIdentifier: '',
    orderItems: [{ menuItem: '', quantity: 1, selectedOption: '' }],
    customAdditionalCharges: 0,
    additionalChargeNotes: '',
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
  }, [formData.orderItems, formData.customAdditionalCharges, menuItems]);

  const fetchMenuItems = async () => {
    try {
      const response = await api.get('/menu');
      setMenuItems(response.data);
    } catch (error) {
      setError('Failed to load menu items');
    }
  };

  const calculateTotalPrice = () => {
    let total = parseFloat(formData.customAdditionalCharges) || 0;

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
      orderItems: [...prev.orderItems, { menuItem: '', quantity: 1, selectedOption: '' }]
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
          menuItem: parseInt(item.menuItem)
        }))
      };
      
      await api.post('/sales', submissionData);
      setMessage('Sale recorded successfully!');
      setFormData({
        buyerIdentifier: '',
        orderItems: [{ menuItem: '', quantity: 1, selectedOption: '' }],
        customAdditionalCharges: 0,
        additionalChargeNotes: '',
        generalNotes: ''
      });
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to record sale');
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
      <h2>Record New Sale</h2>
      
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Buyer/Table Identifier *</label>
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
          {formData.orderItems.map((item, index) => (
            <div key={index} className="order-item">
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

              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => handleOrderItemChange(index, 'quantity', parseInt(e.target.value))}
                placeholder="Qty"
                style={{ width: '80px' }}
              />

              {item.menuItem && (
                <select
                  value={item.selectedOption}
                  onChange={(e) => handleOrderItemChange(index, 'selectedOption', e.target.value)}
                >
                  <option value="">No Option</option>
                  {getMenuItemOptions(item.menuItem).map(option => (
                    <option key={option.name} value={option.name}>
                      {option.name} (+{formatCurrency(option.price)})
                    </option>
                  ))}
                </select>
              )}

              {formData.orderItems.length > 1 && (
                <button
                  type="button"
                  className="remove-item"
                  onClick={() => removeOrderItem(index)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          
          <button type="button" className="btn" onClick={addOrderItem}>
            Add Another Item
          </button>
        </div>

        <div className="form-group">
          <label>Custom Additional Charges</label>
          <input
            type="number"
            name="customAdditionalCharges"
            value={formData.customAdditionalCharges}
            onChange={handleInputChange}
            min="0"
            step="1000"
          />
        </div>

        <div className="form-group">
          <label>Additional Charge Notes</label>
          <input
            type="text"
            name="additionalChargeNotes"
            value={formData.additionalChargeNotes}
            onChange={handleInputChange}
            placeholder="e.g., Extra Ice, Special Request"
          />
        </div>

        <div className="form-group">
          <label>General Notes</label>
          <textarea
            name="generalNotes"
            value={formData.generalNotes}
            onChange={handleInputChange}
            placeholder="Any special instructions or notes..."
          />
        </div>

        <div className="form-group">
          <h3>Total Price: {formatCurrency(totalPrice)}</h3>
        </div>

        <button type="submit" className="btn btn-success" disabled={loading}>
          {loading ? 'Recording Sale...' : 'Record Sale'}
        </button>
      </form>
    </div>
  );
};

export default SalesForm;
