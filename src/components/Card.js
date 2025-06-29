import React, { useState, useRef } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import Modal from './Modal';
import './Card.css';

const Card = ({ card, index, listId, onDeleteCard }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const cardRef = useRef(null);
  const dragStartPositionRef = useRef({ x: 0, y: 0 });

  const formatPrice = (price) => {
    if (!price) return '';
    // Remove ₹ symbol and commas, then convert to number
    const numPrice = parseFloat(price.replace(/[₹,]/g, ''));
    if (numPrice >= 10000000) {
      return `${(numPrice / 10000000).toFixed(2)} Cr`;
    }
    if (numPrice >= 100000) {
      return `${(numPrice / 100000).toFixed(2)} L`;
    }
    return price;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    const day = date.getDate();
    const suffix = ['th', 'st', 'nd', 'rd'][day % 10 > 3 ? 0 : day % 10];
    return `${day}${suffix} ${date.toLocaleString('default', { month: 'short' })}`;
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this card?')) {
      onDeleteCard(listId, card.id);
    }
  };

  const calculateDragOffset = (e) => {
    const cardElement = cardRef.current;
    if (!cardElement) return;

    const rect = cardElement.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);
    
    if (clientX && clientY) {
      dragStartPositionRef.current = {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    }
  };

  const handleMouseDown = (e) => {
    if (e.target.closest('.delete-btn')) return;
    calculateDragOffset(e);
  };

  const handleTouchStart = (e) => {
    if (e.target.closest('.delete-btn')) return;
    calculateDragOffset(e);
  };

  const handleClick = (e) => {
    if (!e.target.closest('.delete-btn')) {
      setIsModalOpen(true);
    }
  };

  const propertyData = card.propertyData || {};
  const status = listId === 'list-1' ? 'Registered for Auction' : 
                 listId === 'list-7' ? 'Registration & EMD Submitted' :
                 listId === 'list-8' ? 'Auction Won' : '';
  const isLive = propertyData.auction_date && new Date(propertyData.auction_date).toDateString() === new Date().toDateString();
  const isSold = listId === 'list-8';

  // Calculate area in sqft if provided in hectares
  const getArea = () => {
    if (propertyData.description) {
      const hectMatch = propertyData.description.match(/(\d+\.\d+)\s*Hect/);
      if (hectMatch) {
        const hectares = parseFloat(hectMatch[1]);
        return `${Math.round(hectares * 107639)} sqft`;
      }
    }
    return '';
  };

  // Extract dues from property data or tags
  const getDues = () => {
    if (propertyData.bank_details?.emd) {
      const emd = parseFloat(propertyData.bank_details.emd.replace(/[₹,]/g, ''));
      return `EMD ${(emd / 100000).toFixed(1)}L`;
    }
    return '';
  };

  return (
    <>
      <Draggable draggableId={card.id} index={index}>
        {(provided, snapshot) => (
          <div
            className={`card ${snapshot.isDragging ? 'dragging' : ''} ${isSold ? 'sold' : ''}`}
            ref={(el) => {
              provided.innerRef(el);
              cardRef.current = el;
            }}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onClick={handleClick}
            style={{
              ...provided.draggableProps.style,
              ...(snapshot.isDragging && {
                transform: `${provided.draggableProps.style?.transform || ''} translate(${-dragStartPositionRef.current.x}px, ${-dragStartPositionRef.current.y}px)`,
              })
            }}
          >
            <div className="card-status">
              {isLive && <span className="live-badge">LIVE</span>}
              {isSold && <span className="sold-badge">SOLD</span>}
              <span className="status-text">{status}</span>
            </div>

            <div className="property-header">
              <h3 className="property-title">{propertyData.title || card.title}</h3>
            </div>

            <div className="property-price-info">
              <div className="price">
                <span className="amount">{formatPrice(propertyData.bank_details?.reserve_price)}</span>
                <div className="details">
                  <span>{getArea()}</span>
                  {getArea() && <span className="separator">|</span>}
                  <span>{propertyData.bank_details?.bank_name}</span>
                  <span className="separator">|</span>
                  <span>{propertyData.property_details?.auction_type}</span>
                  {propertyData.property_details?.asset_category && (
                    <>
                      <span className="separator">|</span>
                      <span>{propertyData.property_details.asset_category}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="property-tags">
              {[
                propertyData.property_type && { text: propertyData.property_type, type: 'property-type' },
                getDues() && { text: getDues(), type: 'dues' },
                propertyData.location?.city_town && { text: propertyData.location.city_town, type: 'locality' },
                propertyData.property_details?.borrower_name && { text: 'Legal', type: 'legal' }
              ].filter(Boolean).map((tag, index) => (
                <span key={index} className={`tag ${tag.type}`}>
                  {tag.text}
                </span>
              ))}
            </div>

            {propertyData.property_details && (
              <div className="property-dates">
                <div className="date-item">
                  <span className="icon">👁️</span>
                  <span className="date">{formatDate(propertyData.property_details.application_submission_date)}</span>
                </div>
                <div className="date-item">
                  <span className="icon">📅</span>
                  <span className="date">{formatDate(propertyData.property_details.auction_start_date)}</span>
                </div>
                <div className="date-item important">
                  <span className="icon">⚡</span>
                  <span className="date">{formatDate(propertyData.auction_date)}</span>
                </div>
                <div className="date-item">
                  <span className="icon">🎯</span>
                  <span className="date">{formatDate(propertyData.property_details.auction_end_time)}</span>
                </div>
              </div>
            )}

            <button 
              className="delete-btn"
              onClick={handleDelete}
              aria-label="Delete card"
            >
              ×
            </button>
          </div>
        )}
      </Draggable>
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={propertyData}
      />
    </>
  );
};

export default Card; 