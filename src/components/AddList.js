import React, { useState } from 'react';
import './AddList.css';

const AddList = ({ onAddList }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onAddList(title.trim());
      setTitle('');
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setIsAdding(false);
  };

  if (isAdding) {
    return (
      <div className="add-list-form-container">
        <form className="add-list-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter list title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="list-title-input"
            autoFocus
            required
          />
          <div className="add-list-actions">
            <button type="submit" className="add-list-btn">
              Add List
            </button>
            <button type="button" onClick={handleCancel} className="cancel-list-btn">
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <button className="add-list-trigger" onClick={() => setIsAdding(true)}>
      <span className="add-list-icon">+</span>
      <span className="add-list-text">Add another list</span>
    </button>
  );
};

export default AddList; 