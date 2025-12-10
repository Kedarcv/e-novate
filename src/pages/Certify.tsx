import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Certify.scss';

const certifications = [
  { id: 'web-dev', title: 'Web Development', price: 25, currency: 'USD' },
  { id: 'ai-basics', title: 'AI & Machine Learning', price: 30, currency: 'USD' },
  { id: 'data-analytics', title: 'Data Analytics', price: 25, currency: 'USD' },
  { id: 'digital-marketing', title: 'Digital Marketing', price: 20, currency: 'USD' },
  { id: 'entrepreneurship', title: 'Entrepreneurship', price: 20, currency: 'USD' },
];

export default function Certify() {
  const [selectedCert, setSelectedCert] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  const handlePayment = () => {
    if (!selectedCert || !phoneNumber) return;
    
    setPaymentStatus('processing');
    
    // Simulate EcoCash payment
    setTimeout(() => {
      setPaymentStatus('success');
    }, 2000);
  };

  const selectedCertData = certifications.find(c => c.id === selectedCert);

  return (
    <div className="certify-page">
      <div className="page-header">
        <Link to="/dashboard" className="back-btn">
          <span className="material-symbols-outlined">arrow_back</span>
          Back
        </Link>
        <h1>Get Certified</h1>
        <p>Complete payment via EcoCash to receive your certification and unlock job opportunities.</p>
      </div>

      <div className="certify-grid">
        <section className="cert-selection">
          <h2>Select Certification</h2>
          <div className="cert-list">
            {certifications.map((cert) => (
              <div
                key={cert.id}
                className={`cert-option ${selectedCert === cert.id ? 'selected' : ''}`}
                onClick={() => setSelectedCert(cert.id)}
              >
                <div className="cert-info">
                  <h3>{cert.title}</h3>
                  <p>Professional Certification</p>
                </div>
                <span className="cert-price">${cert.price}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="payment-section">
          <h2>Payment via EcoCash</h2>
          
          {paymentStatus === 'success' ? (
            <div className="success-message">
              <span className="material-symbols-outlined">check_circle</span>
              <h3>Payment Successful!</h3>
              <p>Your {selectedCertData?.title} certification is now active.</p>
              <p className="note">You can now access job opportunities in this field.</p>
            </div>
          ) : (
            <div className="payment-form">
              {selectedCertData ? (
                <>
                  <div className="order-summary">
                    <h3>Order Summary</h3>
                    <div className="summary-row">
                      <span>{selectedCertData.title} Certification</span>
                      <span>${selectedCertData.price}</span>
                    </div>
                    <div className="summary-total">
                      <span>Total</span>
                      <span>${selectedCertData.price}</span>
                    </div>
                  </div>

                  <div className="ecocash-form">
                    <label>EcoCash Number</label>
                    <input
                      type="tel"
                      placeholder="e.g., 0771234567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                    <p className="hint">You will receive a prompt on your phone to confirm payment.</p>
                  </div>

                  <button
                    className="pay-btn"
                    onClick={handlePayment}
                    disabled={!phoneNumber || paymentStatus === 'processing'}
                  >
                    {paymentStatus === 'processing' ? (
                      <>Processing...</>
                    ) : (
                      <>Pay ${selectedCertData.price} via EcoCash</>
                    )}
                  </button>
                </>
              ) : (
                <div className="select-prompt">
                  <span className="material-symbols-outlined">arrow_back</span>
                  <p>Select a certification to proceed with payment</p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
