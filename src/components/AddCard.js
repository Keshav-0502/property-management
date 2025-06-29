import React, { useState } from 'react';
import './AddCard.css';

const AddCard = ({ listId, onAddCard }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onAddCard(listId, title.trim(), description.trim());
      setTitle('');
      setDescription('');
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setIsAdding(false);
  };

  if (isAdding) {
    return (
      <form className="add-card-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter card title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="card-title-input"
          autoFocus
          required
        />
        <textarea
          placeholder="Enter description (optional)..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="card-description-input"
          rows="2"
        />
        <div className="add-card-actions">
          <button type="submit" className="add-btn">
            Add Card
          </button>
          <button type="button" onClick={handleCancel} className="cancel-btn">
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <button className="add-card-trigger" onClick={() => setIsAdding(true)}>
      + Add a card
    </button>
  );
};

export default AddCard; 