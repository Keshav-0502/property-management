import React, { useEffect, useCallback } from 'react';
import './Modal.css';

const Modal = ({ isOpen, onClose, data }) => {
  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return price;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  return (
    <div 
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="property-modal-header">
          <h2 className="property-modal-title">{data.title}</h2>
          <p className="property-modal-subtitle">
            {data.property_type} in {data.location?.city_town}, {data.location?.province_state}
          </p>
        </div>

        <div className="property-modal-grid">
          <div className="property-modal-section">
            <h3 className="section-title">
              <span className="icon">💰</span>
              Auction Details
            </h3>
            <div className="info-grid">
              <span className="info-label">Reserve Price</span>
              <span className="info-value highlight">{formatPrice(data.bank_details?.reserve_price)}</span>
              
              <span className="info-label">EMD Amount</span>
              <span className="info-value">{formatPrice(data.bank_details?.emd)}</span>
              
              <span className="info-label">Auction Date</span>
              <span className="info-value">{formatDate(data.auction_date)}</span>
              
              <span className="info-label">Start Time</span>
              <span className="info-value">{formatDate(data.property_details?.auction_start_date)}</span>
              
              <span className="info-label">End Time</span>
              <span className="info-value">{formatDate(data.property_details?.auction_end_time)}</span>
              
              <span className="info-label">Submission Date</span>
              <span className="info-value">{formatDate(data.property_details?.application_submission_date)}</span>
            </div>
          </div>

          <div className="property-modal-section">
            <h3 className="section-title">
              <span className="icon">🏦</span>
              Bank Information
            </h3>
            <div className="info-grid">
              <span className="info-label">Bank Name</span>
              <span className="info-value">{data.bank_details?.bank_name || 'N/A'}</span>
              
              <span className="info-label">Branch</span>
              <span className="info-value">{data.bank_details?.branch_name || 'N/A'}</span>
              
              <span className="info-label">Service Provider</span>
              <span className="info-value">{data.bank_details?.service_provider || 'N/A'}</span>
              
              <span className="info-label">Auction Type</span>
              <span className="info-value">{data.property_details?.auction_type || 'N/A'}</span>
              
              <span className="info-label">Asset Category</span>
              <span className="info-value">{data.property_details?.asset_category || 'N/A'}</span>
            </div>
          </div>

          <div className="property-modal-section">
            <h3 className="section-title">
              <span className="icon">📍</span>
              Location Details
            </h3>
            <div className="info-grid">
              <span className="info-label">State/Province</span>
              <span className="info-value">{data.location?.province_state || 'N/A'}</span>
              
              <span className="info-label">City</span>
              <span className="info-value">{data.location?.city_town || 'N/A'}</span>
              
              <span className="info-label">Area</span>
              <span className="info-value">{data.location?.area_town || 'N/A'}</span>
            </div>
          </div>

          <div className="property-modal-section">
            <h3 className="section-title">
              <span className="icon">👥</span>
              Additional Information
            </h3>
            <div className="info-grid">
              <span className="info-label">Property Type</span>
              <span className="info-value">{data.property_type || 'N/A'}</span>
              
              <span className="info-label">Borrower Name</span>
              <span className="info-value">{data.property_details?.borrower_name || 'N/A'}</span>
              
              <span className="info-label">Auction ID</span>
              <span className="info-value">{data.auction_id || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="property-modal-description">
          <h3 className="description-title">Property Description</h3>
          <p className="description-content">{data.description || 'No description available.'}</p>
          
          {data.bank_details?.contact_details && (
            <div className="contact-info">
              <h4 className="contact-title">
                <span className="icon">📞</span>
                Contact Information
              </h4>
              <p>{data.bank_details.contact_details}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal; 