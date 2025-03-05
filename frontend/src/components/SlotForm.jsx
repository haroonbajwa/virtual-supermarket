import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import './SlotForm.css';

const SlotForm = ({ slot, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    id: slot?.id || '',
    productId: slot?.productId || '',
    productName: slot?.productName || '',
    description: slot?.description || '',
    price: slot?.price || '',
    quantity: slot?.quantity || 0
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onSave(formData);
    onClose();
  };

  return (
    <Html position={[0, 2, 2]} center transform>
      <div className="slot-form-overlay" onClick={onClose}>
        <div className="slot-form-container" onClick={e => e.stopPropagation()}>
          <div className="slot-form-header">
            <h3>Edit Slot: {slot?.id}</h3>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Product ID:</label>
              <input
                type="text"
                name="productId"
                value={formData.productId}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Product Name:</label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Description:</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Price:</label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Quantity:</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="save-button">Save</button>
              <button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </Html>
  );
};

export default SlotForm;
